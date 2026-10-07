package com.stitchworks.sales.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class SalesOrderDto {
    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private LocalDate orderDate;
    private LocalDate deliveryDate;
    private String status;
    private List<SalesOrderItemDto> items;
    private InvoiceDto invoice;
    private ShipmentDto shipment;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryPostalCode;
    private String deliveryCountry;
    private String shippingMethod;
    private java.math.BigDecimal shippingCost;
}
