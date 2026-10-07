package com.stitchworks.production.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "quality_control_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityControlLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "production_task_id")
    private ProductionTask productionTask;

    @Enumerated(EnumType.STRING)
    private DefectType defectType;

    @Enumerated(EnumType.STRING)
    private DefectAction action;

    private BigDecimal quantity;
    
    private String notes;
    
    private LocalDate logDate;
}
