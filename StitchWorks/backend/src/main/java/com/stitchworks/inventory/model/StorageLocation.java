package com.stitchworks.inventory.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "storage_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. "WA-S3"

    @Column(nullable = false)
    private String name; // e.g. "Warehouse A - Shelf 3"

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
