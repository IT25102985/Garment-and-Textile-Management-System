package com.stitchworks.product.controller;

import com.stitchworks.product.dto.ProductCategoryDto;
import com.stitchworks.product.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER', 'PURCHASING_OFFICER', 'PRODUCTION_STAFF', 'SALES_OFFICER')")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService service;

    @GetMapping
    public List<ProductCategoryDto> getAllCategories() {
        return service.getAllCategories();
    }

    @PostMapping
    public ProductCategoryDto createCategory(@RequestBody ProductCategoryDto dto) {
        return service.createCategory(dto);
    }

    @PutMapping("/{id}")
    public ProductCategoryDto updateCategory(@PathVariable Long id, @RequestBody ProductCategoryDto dto) {
        return service.updateCategory(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        service.deleteCategory(id);
    }
}
