package com.stitchworks.product.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BOMDto {
    private Long id;
    private Long productId;
    private String productName;
    private Long rawMaterialId;
    private String rawMaterialName;
    private String rawMaterialUnit;
    private BigDecimal quantityRequired;
    private String unit;
}
