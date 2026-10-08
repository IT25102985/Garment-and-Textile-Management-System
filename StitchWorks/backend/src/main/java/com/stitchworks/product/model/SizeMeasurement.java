package com.stitchworks.product.model;

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
@Table(name = "size_measurements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SizeMeasurement extends BaseEntity {

    @Column(nullable = false)
    private String topicName;

    @Column(nullable = false)
    private String measurementValue;

    @ManyToOne
    @JoinColumn(name = "size_id", nullable = false)
    private Size size;
}
