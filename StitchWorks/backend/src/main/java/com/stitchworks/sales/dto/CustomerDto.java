package com.stitchworks.sales.dto;

import lombok.Data;

@Data
public class CustomerDto {
    private Long id;
    private String name;
    private String brand;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
}
