package com.stitchworks.product.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class FinishedProductDto {
    private Long id;
    private String styleCode;
    private String name;
    private String description;
    private BigDecimal basePrice;
    private Long categoryId;
    private String categoryName;
    private String imageUrl;
    private boolean published;
    private List<BOMDto> boms;
}
