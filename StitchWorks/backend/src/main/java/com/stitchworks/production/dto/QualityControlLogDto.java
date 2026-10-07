package com.stitchworks.production.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class QualityControlLogDto {
    private Long id;
    private Long productionTaskId;
    private String defectType;
    private String action;
    private BigDecimal quantity;
    private String notes;
    private LocalDate logDate;
}
