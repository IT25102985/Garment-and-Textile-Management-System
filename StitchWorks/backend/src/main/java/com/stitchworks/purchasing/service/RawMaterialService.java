package com.stitchworks.purchasing.service;

import com.stitchworks.purchasing.dto.RawMaterialDto;
import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.purchasing.model.MaterialCategory;
import com.stitchworks.purchasing.model.Supplier;
import com.stitchworks.purchasing.model.RawMaterialImage;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.purchasing.repository.MaterialCategoryRepository;
import com.stitchworks.purchasing.repository.SupplierRepository;
import com.stitchworks.purchasing.repository.RawMaterialImageRepository;
import com.stitchworks.shared.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final SupplierRepository supplierRepository;
    private final MaterialCategoryRepository categoryRepository;
    private final RawMaterialImageRepository rawMaterialImageRepository;
    private final com.stitchworks.product.repository.BOMRepository bomRepository;
    private final FileStorageService fileStorageService;

    public List<RawMaterialDto> getAllRawMaterials() {
        return rawMaterialRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public RawMaterialDto getRawMaterialById(Long id) {
        return rawMaterialRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("RawMaterial not found"));
    }

    public List<RawMaterialDto> getRawMaterialsByCategory(Long categoryId) {
        return rawMaterialRepository.findAll().stream()
                .filter(m -> m.getMaterialCategory() != null && m.getMaterialCategory().getId().equals(categoryId))
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public RawMaterialDto createRawMaterial(RawMaterialDto dto, List<MultipartFile> imageFiles) {
        Supplier supplier = null;
        if (dto.getSupplierId() != null) {
            supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
        }

        MaterialCategory category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElse(null);
        }

        String sku = dto.getSku();
        if (sku == null || sku.trim().isEmpty()) {
            sku = "RM-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        RawMaterial rawMaterial = RawMaterial.builder()
                .name(dto.getName())
                .sku(sku)
                .category(category != null ? category.getName() : dto.getCategory())
                .materialCategory(category)
                .unit(dto.getUnit())
                .pricePerUnit(dto.getPricePerUnit() != null ? dto.getPricePerUnit() : java.math.BigDecimal.ZERO)
                .unitForSale(dto.getUnitForSale())
                .minimumOrderQuantity(dto.getMinimumOrderQuantity() != null ? dto.getMinimumOrderQuantity() : 1)
                .description(dto.getDescription())
                .specifications(dto.getSpecifications())
                .reorderLevel(dto.getReorderLevel())
                .supplier(supplier)
                .customFields(dto.getCustomFields() != null ? dto.getCustomFields() : new java.util.HashMap<>())
                .images(new ArrayList<>())
                .build();

        rawMaterial = rawMaterialRepository.save(rawMaterial);

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                if (file != null && !file.isEmpty()) {
                    String url = fileStorageService.storeFile(file, "materials");
                    RawMaterialImage img = RawMaterialImage.builder()
                            .imageUrl(url)
                            .rawMaterial(rawMaterial)
                            .build();
                    rawMaterialImageRepository.save(img);
                    rawMaterial.getImages().add(img);
                }
            }
        }
        
        if (category != null && rawMaterial.getImages() != null && !rawMaterial.getImages().isEmpty()) {
            if (category.getCoverImageUrl() == null || category.getCoverImageUrl().startsWith("http")) {
                category.setCoverImageUrl(rawMaterial.getImages().get(0).getImageUrl());
                categoryRepository.save(category);
            }
        }
        
        return mapToDto(rawMaterial);
    }

    @Transactional
    public RawMaterialDto updateRawMaterial(Long id, RawMaterialDto dto, List<String> existingImageUrls, List<MultipartFile> imageFiles) {
        RawMaterial rawMaterial = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RawMaterial not found"));

        if (dto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            rawMaterial.setSupplier(supplier);
        } else {
            rawMaterial.setSupplier(null);
        }

        if (dto.getCategoryId() != null) {
            MaterialCategory category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            rawMaterial.setMaterialCategory(category);
            rawMaterial.setCategory(category.getName());
        } else {
            rawMaterial.setMaterialCategory(null);
            rawMaterial.setCategory(dto.getCategory());
        }

        rawMaterial.setName(dto.getName());
        rawMaterial.setUnit(dto.getUnit());
        rawMaterial.setPricePerUnit(dto.getPricePerUnit());
        rawMaterial.setUnitForSale(dto.getUnitForSale());
        rawMaterial.setMinimumOrderQuantity(dto.getMinimumOrderQuantity());
        rawMaterial.setDescription(dto.getDescription());
        rawMaterial.setSpecifications(dto.getSpecifications());
        rawMaterial.setReorderLevel(dto.getReorderLevel());
        
        if (dto.getCustomFields() != null) {
            rawMaterial.setCustomFields(dto.getCustomFields());
        }

        // Track removed image URLs to check if we deleted the category cover
        List<String> removedImageUrls = new ArrayList<>();
        
        List<RawMaterialImage> imagesToKeep = new ArrayList<>();
        if (existingImageUrls != null) {
            for (RawMaterialImage img : rawMaterial.getImages()) {
                if (existingImageUrls.contains(img.getImageUrl())) {
                    imagesToKeep.add(img);
                } else {
                    removedImageUrls.add(img.getImageUrl());
                    fileStorageService.deleteFile(img.getImageUrl());
                    rawMaterialImageRepository.delete(img);
                }
            }
        } else {
            for (RawMaterialImage img : rawMaterial.getImages()) {
                removedImageUrls.add(img.getImageUrl());
                fileStorageService.deleteFile(img.getImageUrl());
                rawMaterialImageRepository.delete(img);
            }
        }
        
        // If the category's cover image was deleted, clear it so it auto-recalculates
        MaterialCategory currentCategory = rawMaterial.getMaterialCategory();
        if (currentCategory != null && currentCategory.getCoverImageUrl() != null) {
            if (removedImageUrls.contains(currentCategory.getCoverImageUrl())) {
                currentCategory.setCoverImageUrl(null);
                categoryRepository.save(currentCategory);
            }
        }
        
        rawMaterial.getImages().clear();
        rawMaterial.getImages().addAll(imagesToKeep);

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                if (file != null && !file.isEmpty()) {
                    String url = fileStorageService.storeFile(file, "materials");
                    RawMaterialImage img = RawMaterialImage.builder()
                            .imageUrl(url)
                            .rawMaterial(rawMaterial)
                            .build();
                    rawMaterialImageRepository.save(img);
                    rawMaterial.getImages().add(img);
                }
            }
        }
        
        if (currentCategory != null && rawMaterial.getImages() != null && !rawMaterial.getImages().isEmpty()) {
            if (currentCategory.getCoverImageUrl() == null || currentCategory.getCoverImageUrl().startsWith("http")) {
                currentCategory.setCoverImageUrl(rawMaterial.getImages().get(0).getImageUrl());
                categoryRepository.save(currentCategory);
            }
        }

        return mapToDto(rawMaterialRepository.save(rawMaterial));
    }

    @Transactional
    public void deleteRawMaterial(Long id) {
        RawMaterial rawMaterial = rawMaterialRepository.findById(id).orElse(null);
        if (rawMaterial != null) {
            bomRepository.deleteByMaterial_Id(id);

            MaterialCategory category = rawMaterial.getMaterialCategory();
            List<String> deletedUrls = new ArrayList<>();
            for (RawMaterialImage img : rawMaterial.getImages()) {
                deletedUrls.add(img.getImageUrl());
                fileStorageService.deleteFile(img.getImageUrl());
            }
            
            if (category != null && category.getCoverImageUrl() != null) {
                if (deletedUrls.contains(category.getCoverImageUrl())) {
                    category.setCoverImageUrl(null);
                    categoryRepository.save(category);
                }
            }
            rawMaterialRepository.delete(rawMaterial);
        }
    }

    public RawMaterialDto mapToDto(RawMaterial rawMaterial) {
        RawMaterialDto dto = new RawMaterialDto();
        dto.setId(rawMaterial.getId());
        dto.setName(rawMaterial.getName());
        dto.setCategory(rawMaterial.getCategory());
        if (rawMaterial.getMaterialCategory() != null) {
            dto.setCategoryId(rawMaterial.getMaterialCategory().getId());
        }
        dto.setUnit(rawMaterial.getUnit());
        
        if (rawMaterial.getImages() != null && !rawMaterial.getImages().isEmpty()) {
            dto.setImageUrl(rawMaterial.getImages().get(0).getImageUrl());
            dto.setImages(rawMaterial.getImages().stream().map(RawMaterialImage::getImageUrl).collect(Collectors.toList()));
        } else {
            dto.setImageUrl(rawMaterial.getImageUrl());
            dto.setImages(new ArrayList<>());
        }
        
        dto.setPricePerUnit(rawMaterial.getPricePerUnit());
        dto.setUnitForSale(rawMaterial.getUnitForSale());
        dto.setMinimumOrderQuantity(rawMaterial.getMinimumOrderQuantity());
        dto.setDescription(rawMaterial.getDescription());
        dto.setSpecifications(rawMaterial.getSpecifications());
        dto.setReorderLevel(rawMaterial.getReorderLevel());
        if (rawMaterial.getSupplier() != null) {
            dto.setSupplierId(rawMaterial.getSupplier().getId());
            dto.setSupplierName(rawMaterial.getSupplier().getName());
        }
        dto.setCustomFields(rawMaterial.getCustomFields());
        return dto;
    }
}
