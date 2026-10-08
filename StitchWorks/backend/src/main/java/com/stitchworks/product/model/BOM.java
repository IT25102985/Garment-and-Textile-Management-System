package com.stitchworks.product.model;

import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "bill_of_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BOM extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_product_id", nullable = false)
    private FinishedProduct product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id", nullable = false)
    private RawMaterial material;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityRequired;
}
