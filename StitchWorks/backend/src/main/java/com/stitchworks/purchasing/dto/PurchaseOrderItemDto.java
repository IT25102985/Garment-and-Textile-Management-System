package com.stitchworks.purchasing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PurchaseOrderItemDto {
    private Long id;
    private Long rawMaterialId;
    private String rawMaterialName;
    private BigDecimal quantity;
    private BigDecimal quantityReceived;
    private BigDecimal unitPrice;
}
