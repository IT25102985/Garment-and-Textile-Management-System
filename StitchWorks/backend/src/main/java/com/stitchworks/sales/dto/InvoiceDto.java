package com.stitchworks.sales.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceDto {
    private Long id;
    private String invoiceNumber;
    private Long orderId;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private LocalDate dueDate;
    private String status;
}
