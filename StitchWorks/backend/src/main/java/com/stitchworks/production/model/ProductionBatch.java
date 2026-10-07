package com.stitchworks.production.model;

import com.stitchworks.product.model.FinishedProduct;
import com.stitchworks.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "production_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionBatch extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String batchNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private FinishedProduct product;

    @Column(nullable = false)
    private Integer quantityToProduce;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantityProduced = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductionBatchStatus status;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String notes;
}
