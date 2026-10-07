package com.stitchworks.purchasing.model;

import com.stitchworks.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.MapKeyColumn;

@Entity
@Table(name = "raw_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawMaterial extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String sku;

    private String category; // Legacy string field

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "material_category_id")
    private MaterialCategory materialCategory;
    private String unit;
    
    @Column(length = 1000)
    private String imageUrl;

    @Column(precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    private String unitForSale;

    @Builder.Default
    private Integer minimumOrderQuantity = 1;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String specifications;

    @Column(precision = 10, scale = 2)
    private BigDecimal reorderLevel;

    @Column(name = "current_stock", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal currentStock = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @OneToMany(mappedBy = "rawMaterial", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RawMaterialImage> images = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "raw_material_custom_fields", joinColumns = @JoinColumn(name = "raw_material_id"))
    @MapKeyColumn(name = "field_key")
    @Column(name = "field_value")
    @Builder.Default
    private Map<String, String> customFields = new HashMap<>();

    @PrePersist
    @PreUpdate
    public void syncCategoryAndSku() {
        if (this.materialCategory != null) {
            this.category = this.materialCategory.getName();
        }
        if (this.sku == null || this.sku.trim().isEmpty()) {
            this.sku = "RM-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }

    public String getCategory() {
        if (this.materialCategory != null) {
            return this.materialCategory.getName();
        }
        return this.category;
    }
}
