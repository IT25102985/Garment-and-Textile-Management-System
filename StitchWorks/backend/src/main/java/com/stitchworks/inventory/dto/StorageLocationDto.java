package com.stitchworks.inventory.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StorageLocationDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
