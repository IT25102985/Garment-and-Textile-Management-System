package com.stitchworks.product.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stitchworks.product.dto.BOMDto;
import com.stitchworks.product.dto.FinishedProductDto;
import com.stitchworks.product.service.FinishedProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER', 'PURCHASING_OFFICER', 'PRODUCTION_STAFF', 'SALES_OFFICER')")
@RequiredArgsConstructor
public class FinishedProductController {

    private final FinishedProductService service;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<FinishedProductDto> getAllProducts() {
        return service.getAllProducts();
    }

    @GetMapping("/{id}")
    public FinishedProductDto getProductById(@PathVariable Long id) {
        return service.getProductById(id);
    }

    @PostMapping(consumes = {"application/json"})
    public FinishedProductDto createProductJson(@RequestBody FinishedProductDto dto) {
        return service.createProduct(dto, null);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public FinishedProductDto createProduct(
            @RequestParam("styleCode") String styleCode,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "basePrice", required = false) BigDecimal basePrice,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "published", defaultValue = "true") boolean published,
            @RequestParam(value = "boms", required = false) String bomsJson,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        FinishedProductDto dto = new FinishedProductDto();
        dto.setStyleCode(styleCode);
        dto.setName(name);
        dto.setDescription(description);
        dto.setBasePrice(basePrice);
        dto.setCategoryId(categoryId);
        dto.setImageUrl(imageUrl);
        dto.setPublished(published);

        if (bomsJson != null && !bomsJson.trim().isEmpty()) {
            try {
                List<BOMDto> boms = objectMapper.readValue(bomsJson, new TypeReference<List<BOMDto>>() {});
                dto.setBoms(boms);
            } catch (Exception e) {
                // Ignore parse errors
            }
        }

        MultipartFile targetFile = image != null ? image : file;
        return service.createProduct(dto, targetFile);
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.POST, RequestMethod.PUT}, consumes = {"application/json"})
    public FinishedProductDto updateProductJson(@PathVariable Long id, @RequestBody FinishedProductDto dto) {
        return service.updateProduct(id, dto, null);
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.POST, RequestMethod.PUT}, consumes = {"multipart/form-data"})
    public FinishedProductDto updateProduct(
            @PathVariable Long id,
            @RequestParam("styleCode") String styleCode,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "basePrice", required = false) BigDecimal basePrice,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "published", defaultValue = "true") boolean published,
            @RequestParam(value = "boms", required = false) String bomsJson,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        FinishedProductDto dto = new FinishedProductDto();
        dto.setStyleCode(styleCode);
        dto.setName(name);
        dto.setDescription(description);
        dto.setBasePrice(basePrice);
        dto.setCategoryId(categoryId);
        dto.setImageUrl(imageUrl);
        dto.setPublished(published);

        if (bomsJson != null && !bomsJson.trim().isEmpty()) {
            try {
                List<BOMDto> boms = objectMapper.readValue(bomsJson, new TypeReference<List<BOMDto>>() {});
                dto.setBoms(boms);
            } catch (Exception e) {
                // Ignore parse errors
            }
        }

        MultipartFile targetFile = image != null ? image : file;
        return service.updateProduct(id, dto, targetFile);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
    }
}
