package com.stitchworks.production.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProductionTaskDto {
    private Long id;
    private String processName;
    private BigDecimal quantityPlanned;
    private BigDecimal quantityCompleted;
    private BigDecimal defectQuantity;
    private LocalDate taskDate;
    private List<QualityControlLogDto> qcLogs;
}
