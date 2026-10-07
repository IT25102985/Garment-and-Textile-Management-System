package com.stitchworks.purchasing.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseOrderDto {
    private Long id;
    private String poNumber;
    private Long supplierId;
    private String supplierName;
    private LocalDate orderDate;
    private LocalDate expectedDate;
    private String status;
    private java.math.BigDecimal totalAmount;
    private java.math.BigDecimal amountPaid;
    private List<PurchaseOrderItemDto> items;
}
