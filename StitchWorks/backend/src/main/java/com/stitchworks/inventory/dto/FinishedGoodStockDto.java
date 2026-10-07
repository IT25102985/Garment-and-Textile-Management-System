package com.stitchworks.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FinishedGoodStockDto {
    private Long productId;
    private String styleCode;
    private String productName;
    private String categoryName;
    private BigDecimal currentStock;
}
