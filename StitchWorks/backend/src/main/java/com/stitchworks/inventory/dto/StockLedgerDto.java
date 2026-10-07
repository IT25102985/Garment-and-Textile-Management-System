package com.stitchworks.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StockLedgerDto {
    private Long id;
    private String transactionType;
    private Long materialId;
    private Long productId;
    private BigDecimal quantity;
    private String referenceType;
    private Long referenceId;
    private LocalDateTime transactionDate;
}
