package com.stitchworks.product.model;

import com.stitchworks.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCategory extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;
}
