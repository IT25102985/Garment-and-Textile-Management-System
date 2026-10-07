package com.stitchworks.purchasing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialCategoryDto {
    private Long id;
    private String name;
    private String description;
    private String coverImageUrl;
}
