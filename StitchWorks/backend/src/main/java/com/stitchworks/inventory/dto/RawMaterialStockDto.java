package com.stitchworks.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RawMaterialStockDto {
    private Long materialId;
    private String materialName;
    private String category;
    private String unit;
    private BigDecimal reorderLevel;
    private BigDecimal currentStock;
}
