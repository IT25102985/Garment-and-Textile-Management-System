package com.stitchworks.inventory.model;

import com.stitchworks.product.model.FinishedProduct;
import com.stitchworks.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "finished_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinishedInventory extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private FinishedProduct product;

    @Column(nullable = false)
    @Builder.Default
    private Integer availableStock = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer reservedStock = 0;

    private LocalDateTime lastUpdated;
}
