package com.stitchworks.purchasing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class RawMaterialDto {
    private Long id;
    private String sku;
    private String name;
    private String category; // Fallback legacy name or getter
    private Long categoryId;
    private String unit;
    private String imageUrl; // Kept for backward compatibility
    private List<String> images;
    private BigDecimal pricePerUnit;
    private String unitForSale;
    private Integer minimumOrderQuantity;
    private String description;
    private String specifications;
    private BigDecimal reorderLevel;
    private Long supplierId;
    private String supplierName;
    private Map<String, String> customFields;
}
