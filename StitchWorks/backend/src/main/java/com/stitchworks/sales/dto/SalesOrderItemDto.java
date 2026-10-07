package com.stitchworks.sales.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SalesOrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String styleCode;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private String size;
    private String color;
}
