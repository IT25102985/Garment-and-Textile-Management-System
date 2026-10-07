package com.stitchworks.purchasing.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "raw_material_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawMaterialImage extends BaseEntity {

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "raw_material_id", nullable = false)
    @JsonIgnore
    private RawMaterial rawMaterial;
}
