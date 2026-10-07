package com.stitchworks.production.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProductionOrderDto {
    private Long id;
    private String orderNumber;
    private Long salesOrderId;
    private String salesOrderNumber;
    private Long productId;
    private String productName;
    private String styleCode;
    private BigDecimal quantity;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private List<ProductionTaskDto> tasks;
}
