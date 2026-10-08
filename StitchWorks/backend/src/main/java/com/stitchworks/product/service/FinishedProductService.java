package com.stitchworks.product.service;

import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.product.dto.BOMDto;
import com.stitchworks.product.dto.FinishedProductDto;
import com.stitchworks.product.model.BOM;
import com.stitchworks.product.model.FinishedProduct;
import com.stitchworks.product.model.ProductCategory;
import com.stitchworks.product.repository.FinishedProductRepository;
import com.stitchworks.product.repository.ProductCategoryRepository;
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
public class FinishedProductService {

    private final FinishedProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final FileStorageService fileStorageService;

    public List<FinishedProductDto> getAllProducts() {
        return productRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public FinishedProductDto getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Transactional
    public FinishedProductDto createProduct(FinishedProductDto dto, MultipartFile imageFile) {
        ProductCategory category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }

        String imageUrl = dto.getImageUrl();
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = fileStorageService.storeFile(imageFile, "products");
        }

        FinishedProduct product = FinishedProduct.builder()
                .styleCode(dto.getStyleCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .basePrice(dto.getBasePrice())
                .imageUrl(imageUrl)
                .category(category)
                .published(dto.isPublished())
                .boms(new ArrayList<>())
                .build();

        if (dto.getBoms() != null) {
            for (BOMDto bomDto : dto.getBoms()) {
                if (bomDto.getRawMaterialId() != null) {
                    RawMaterial material = rawMaterialRepository.findById(bomDto.getRawMaterialId()).orElse(null);
                    if (material != null) {
                        BOM bom = BOM.builder()
                                .product(product)
                                .material(material)
                                .quantityRequired(bomDto.getQuantityRequired())
                                .build();
                        product.getBoms().add(bom);
                    }
                }
            }
        }

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public FinishedProductDto updateProduct(Long id, FinishedProductDto dto, MultipartFile imageFile) {
        FinishedProduct product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        ProductCategory category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }

        String imageUrl = dto.getImageUrl();
        if (imageFile != null && !imageFile.isEmpty()) {
            if (product.getImageUrl() != null && product.getImageUrl().startsWith("/uploads/")) {
                fileStorageService.deleteFile(product.getImageUrl());
            }
            imageUrl = fileStorageService.storeFile(imageFile, "products");
        } else if (imageUrl == null || imageUrl.trim().isEmpty()) {
            imageUrl = product.getImageUrl();
        }

        product.setStyleCode(dto.getStyleCode());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setBasePrice(dto.getBasePrice());
        product.setImageUrl(imageUrl);
        product.setCategory(category);
        product.setPublished(dto.isPublished());

        product.getBoms().clear();
        if (dto.getBoms() != null) {
            for (BOMDto bomDto : dto.getBoms()) {
                if (bomDto.getRawMaterialId() != null) {
                    RawMaterial material = rawMaterialRepository.findById(bomDto.getRawMaterialId()).orElse(null);
                    if (material != null) {
                        BOM bom = BOM.builder()
                                .product(product)
                                .material(material)
                                .quantityRequired(bomDto.getQuantityRequired())
                                .build();
                        product.getBoms().add(bom);
                    }
                }
            }
        }

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        FinishedProduct product = productRepository.findById(id).orElse(null);
        if (product != null) {
            if (product.getImageUrl() != null && product.getImageUrl().startsWith("/uploads/")) {
                fileStorageService.deleteFile(product.getImageUrl());
            }
            productRepository.delete(product);
        }
    }

    private FinishedProductDto mapToDto(FinishedProduct product) {
        FinishedProductDto dto = new FinishedProductDto();
        dto.setId(product.getId());
        dto.setStyleCode(product.getStyleCode());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setBasePrice(product.getBasePrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setPublished(product.isPublished());
        
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }

        List<BOMDto> bomDtos = product.getBoms().stream().map(bom -> {
            BOMDto bDto = new BOMDto();
            bDto.setId(bom.getId());
            bDto.setProductId(product.getId());
            bDto.setRawMaterialId(bom.getMaterial().getId());
            bDto.setRawMaterialName(bom.getMaterial().getName());
            bDto.setRawMaterialUnit(bom.getMaterial().getUnit());
            bDto.setQuantityRequired(bom.getQuantityRequired());
            return bDto;
        }).collect(Collectors.toList());

        dto.setBoms(bomDtos);
        return dto;
    }
}
