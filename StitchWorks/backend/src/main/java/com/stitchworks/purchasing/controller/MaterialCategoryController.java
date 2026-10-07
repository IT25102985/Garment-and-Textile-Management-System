package com.stitchworks.purchasing.controller;

import com.stitchworks.purchasing.dto.MaterialCategoryDto;
import com.stitchworks.purchasing.service.MaterialCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping({"/api/admin/categories", "/api/material-categories"})
@RequiredArgsConstructor
public class MaterialCategoryController {

    private final MaterialCategoryService categoryService;

    @GetMapping
    public List<MaterialCategoryDto> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public MaterialCategoryDto getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @PostMapping(consumes = {"application/json"})
    public MaterialCategoryDto createCategoryJson(@RequestBody MaterialCategoryDto dto) {
        return categoryService.createCategory(dto, null);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public MaterialCategoryDto createCategory(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {
        MaterialCategoryDto dto = new MaterialCategoryDto();
        dto.setName(name);
        dto.setDescription(description);
        return categoryService.createCategory(dto, coverImage);
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.POST, RequestMethod.PUT}, consumes = {"application/json"})
    public MaterialCategoryDto updateCategoryJson(@PathVariable Long id, @RequestBody MaterialCategoryDto dto) {
        return categoryService.updateCategory(id, dto, null);
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.POST, RequestMethod.PUT}, consumes = {"multipart/form-data"})
    public MaterialCategoryDto updateCategory(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {
        MaterialCategoryDto dto = new MaterialCategoryDto();
        dto.setName(name);
        dto.setDescription(description);
        return categoryService.updateCategory(id, dto, coverImage);
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
