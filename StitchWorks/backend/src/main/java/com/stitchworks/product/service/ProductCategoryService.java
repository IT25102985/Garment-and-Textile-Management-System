package com.stitchworks.product.service;

import com.stitchworks.product.dto.ProductCategoryDto;
import com.stitchworks.product.model.ProductCategory;
import com.stitchworks.product.repository.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryRepository repository;

    public List<ProductCategoryDto> getAllCategories() {
        return repository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ProductCategoryDto createCategory(ProductCategoryDto dto) {
        ProductCategory entity = ProductCategory.builder().name(dto.getName()).build();
        return mapToDto(repository.save(entity));
    }

    public ProductCategoryDto updateCategory(Long id, ProductCategoryDto dto) {
        ProductCategory entity = repository.findById(id).orElseThrow();
        entity.setName(dto.getName());
        return mapToDto(repository.save(entity));
    }

    public void deleteCategory(Long id) {
        repository.deleteById(id);
    }

    private ProductCategoryDto mapToDto(ProductCategory entity) {
        ProductCategoryDto dto = new ProductCategoryDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        return dto;
    }
}
