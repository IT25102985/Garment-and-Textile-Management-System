package com.stitchworks.product.dto;

import lombok.Data;

import java.util.List;

@Data
public class SizeDto {
    private Long id;
    private String name;
    private String code;
    private String patternBlockFilePath;
    private List<SizeMeasurementDto> measurements;
}
