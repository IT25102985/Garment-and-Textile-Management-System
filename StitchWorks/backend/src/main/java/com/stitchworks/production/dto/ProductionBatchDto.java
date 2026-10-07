package com.stitchworks.production.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProductionBatchDto {
    private Long id;
    private String batchNumber;
    private Long productId;
    private String productName;
    private Integer quantityToProduce;
    private Integer quantityProduced;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String notes;
}
