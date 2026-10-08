package com.stitchworks.product.model;

import com.stitchworks.shared.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "finished_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinishedProduct extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String styleCode;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProductCategory category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BOM> boms = new ArrayList<>();

    @Builder.Default
    private Double weight = 0.5;
}
