package com.stitchworks.inventory.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FinishedInventoryDto {
    private Long id;
    private Long productId;
    private String productName;
    private Integer availableStock;
    private Integer reservedStock;
    private LocalDateTime lastUpdated;

    public Integer getTotalStock() {
        return (availableStock != null ? availableStock : 0) + 
               (reservedStock != null ? reservedStock : 0);
    }
}
