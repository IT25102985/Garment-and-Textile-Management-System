package com.stitchworks.purchasing.controller;

import com.stitchworks.purchasing.dto.RawMaterialDto;
import com.stitchworks.purchasing.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/raw-materials", "/api/admin/materials"})
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<RawMaterialDto> getAllRawMaterials(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return rawMaterialService.getRawMaterialsByCategory(categoryId);
        }
        return rawMaterialService.getAllRawMaterials();
    }

    @GetMapping("/{id}")
    public RawMaterialDto getRawMaterialById(@PathVariable Long id) {
        return rawMaterialService.getRawMaterialById(id);
    }

    @PostMapping(consumes = {"application/json"})
    public RawMaterialDto createRawMaterialJson(@RequestBody RawMaterialDto dto) {
        return rawMaterialService.createRawMaterial(dto, null);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public RawMaterialDto createRawMaterial(
            @RequestParam("name") String name,
            @RequestParam(value = "unit", required = false) String unit,
            @RequestParam(value = "pricePerUnit", required = false) BigDecimal pricePerUnit,
            @RequestParam(value = "unitForSale", required = false) String unitForSale,
            @RequestParam(value = "minimumOrderQuantity", defaultValue = "1") Integer minimumOrderQuantity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "specifications", required = false) String specifications,
            @RequestParam(value = "reorderLevel", required = false) BigDecimal reorderLevel,
            @RequestParam(value = "supplierId", required = false) Long supplierId,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "customFields", required = false) String customFieldsJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        RawMaterialDto dto = new RawMaterialDto();
        dto.setName(name);
        dto.setUnit(unit);
        dto.setPricePerUnit(pricePerUnit);
        dto.setUnitForSale(unitForSale);
        dto.setMinimumOrderQuantity(minimumOrderQuantity);
        dto.setDescription(description);
        dto.setSpecifications(specifications);
        dto.setReorderLevel(reorderLevel);
        dto.setSupplierId(supplierId);
        dto.setCategoryId(categoryId);
        
        if (customFieldsJson != null && !customFieldsJson.isEmpty()) {
            try {
                Map<String, String> customFields = objectMapper.readValue(customFieldsJson, new TypeReference<Map<String, String>>() {});
                dto.setCustomFields(customFields);
            } catch (Exception e) {
                // Ignore parsing errors and fallback gracefully
            }
        }

        return rawMaterialService.createRawMaterial(dto, images);
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.POST, RequestMethod.PUT}, consumes = {"multipart/form-data"})
    public RawMaterialDto updateRawMaterial(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "unit", required = false) String unit,
            @RequestParam(value = "pricePerUnit", required = false) BigDecimal pricePerUnit,
            @RequestParam(value = "unitForSale", required = false) String unitForSale,
            @RequestParam(value = "minimumOrderQuantity", defaultValue = "1") Integer minimumOrderQuantity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "specifications", required = false) String specifications,
            @RequestParam(value = "reorderLevel", required = false) BigDecimal reorderLevel,
            @RequestParam(value = "supplierId", required = false) Long supplierId,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "existingImageUrls", required = false) List<String> existingImageUrls,
            @RequestParam(value = "customFields", required = false) String customFieldsJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        RawMaterialDto dto = new RawMaterialDto();
        dto.setName(name);
        dto.setUnit(unit);
        dto.setPricePerUnit(pricePerUnit);
        dto.setUnitForSale(unitForSale);
        dto.setMinimumOrderQuantity(minimumOrderQuantity);
        dto.setDescription(description);
        dto.setSpecifications(specifications);
        dto.setReorderLevel(reorderLevel);
        dto.setSupplierId(supplierId);
        dto.setCategoryId(categoryId);
        
        if (customFieldsJson != null && !customFieldsJson.isEmpty()) {
            try {
                Map<String, String> customFields = objectMapper.readValue(customFieldsJson, new TypeReference<Map<String, String>>() {});
                dto.setCustomFields(customFields);
            } catch (Exception e) {
                throw new RuntimeException("Invalid customFields JSON", e);
            }
        }

        return rawMaterialService.updateRawMaterial(id, dto, existingImageUrls, images);
    }

    @DeleteMapping("/{id}")
    public void deleteRawMaterial(@PathVariable Long id) {
        rawMaterialService.deleteRawMaterial(id);
    }
}
