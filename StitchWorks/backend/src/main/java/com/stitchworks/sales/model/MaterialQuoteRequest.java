package com.stitchworks.sales.model;

import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "material_quote_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialQuoteRequest extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "material_id", nullable = false)
    private RawMaterial material;

    @Column(nullable = false)
    private Double quantity;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, RESPONDED
}
