package com.stitchworks.inventory.model;

import com.stitchworks.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_ledger")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLedger extends BaseEntity {

    @Column(nullable = false)
    private String transactionType; // "IN" or "OUT"

    private Long materialId; // nullable

    private Long productId; // nullable

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false)
    private String referenceType; // PURCHASE, PRODUCTION_ISSUE, PRODUCTION_RECEIPT, SALES_DISPATCH, ADJUSTMENT

    private Long referenceId;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime transactionDate = LocalDateTime.now();
}
