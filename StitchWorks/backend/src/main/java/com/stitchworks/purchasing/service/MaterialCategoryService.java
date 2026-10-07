package com.stitchworks.purchasing.service;

import com.stitchworks.purchasing.dto.MaterialCategoryDto;
import com.stitchworks.purchasing.model.MaterialCategory;
import com.stitchworks.purchasing.repository.MaterialCategoryRepository;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.product.service.ImageService;
import lombok.RequiredArgsConstructor;
import com.stitchworks.shared.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class MaterialCategoryService {

    private final MaterialCategoryRepository categoryRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final FileStorageService fileStorageService;
    private final ImageService imageService;

    public List<MaterialCategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MaterialCategoryDto getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @Transactional
    public MaterialCategoryDto createCategory(MaterialCategoryDto dto, MultipartFile coverImage) {
        if (categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new RuntimeException("Category name already exists");
        }
        String coverImageUrl = fileStorageService.storeFile(coverImage, "categories");

        MaterialCategory category = MaterialCategory.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .coverImageUrl(coverImageUrl)
                .build();
        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Transactional
    public MaterialCategoryDto updateCategory(Long id, MaterialCategoryDto dto, MultipartFile coverImage) {
        MaterialCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        if (coverImage != null && !coverImage.isEmpty()) {
            fileStorageService.deleteFile(category.getCoverImageUrl());
            String coverImageUrl = fileStorageService.storeFile(coverImage, "categories");
            category.setCoverImageUrl(coverImageUrl);
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        MaterialCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // If there are raw materials linked, disassociate them instead of blocking deletion
        if (rawMaterialRepository.existsByMaterialCategory_Id(id)) {
            var linkedMaterials = rawMaterialRepository.findByMaterialCategory_Id(id);
            linkedMaterials.forEach(m -> m.setMaterialCategory(null));
            rawMaterialRepository.saveAll(linkedMaterials);
        }

        fileStorageService.deleteFile(category.getCoverImageUrl());
        categoryRepository.deleteById(id);
    }

    private MaterialCategoryDto mapToDto(MaterialCategory category) {
        String coverUrl = category.getCoverImageUrl();
        
        if (coverUrl == null || coverUrl.trim().isEmpty()) {
            // Check raw materials for an image
            String firstMaterialImg = null;
            if (category.getMaterials() != null) {
                firstMaterialImg = category.getMaterials().stream()
                    .filter(m -> m.getImages() != null && !m.getImages().isEmpty())
                    .map(m -> m.getImages().get(0).getImageUrl())
                    .findFirst()
                    .orElse(null);
            }
                
            if (firstMaterialImg != null) {
                coverUrl = firstMaterialImg;
            }
        }

        return MaterialCategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .coverImageUrl(coverUrl)
                .build();
    }
}
