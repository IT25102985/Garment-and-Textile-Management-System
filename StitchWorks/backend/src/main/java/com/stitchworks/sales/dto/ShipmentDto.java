package com.stitchworks.sales.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ShipmentDto {
    private Long id;
    private String trackingNumber;
    private LocalDate shippedDate;
}
