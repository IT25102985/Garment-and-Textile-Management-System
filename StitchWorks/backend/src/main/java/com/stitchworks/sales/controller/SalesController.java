package com.stitchworks.sales.controller;

import com.stitchworks.sales.dto.InvoiceDto;
import com.stitchworks.sales.dto.SalesOrderDto;
import com.stitchworks.sales.dto.ShipmentDto;
import com.stitchworks.sales.service.SalesService;
import com.stitchworks.sales.service.SalesOrderPipelineService;
import com.stitchworks.shared.exception.InsufficientStockException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales-orders")
@PreAuthorize("hasAnyRole('ADMIN', 'SALES_OFFICER')")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;
    private final SalesOrderPipelineService salesOrderPipelineService;

    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_OFFICER', 'PRODUCTION_STAFF')")
    @GetMapping
    public List<SalesOrderDto> getAll() {
        return salesService.getAllOrders();
    }

    @GetMapping("/{id}")
    public SalesOrderDto getById(@PathVariable Long id) {
        return salesService.getOrderById(id);
    }

    @PostMapping
    public SalesOrderDto create(@RequestBody SalesOrderDto dto) {
        return salesService.createOrder(dto);
    }

    @PutMapping("/{id}/status")
    public SalesOrderDto updateStatus(@PathVariable Long id, @RequestParam String status) {
        return salesService.updateStatus(id, status);
    }

    @PostMapping("/{id}/invoice")
    public InvoiceDto createInvoice(@PathVariable Long id, @RequestParam String dueDate) {
        return salesService.createInvoice(id, LocalDate.parse(dueDate));
    }

    @PostMapping("/{id}/ship")
    public ShipmentDto shipOrder(@PathVariable Long id, @RequestParam String trackingNumber) {
        return salesService.shipOrder(id, trackingNumber);
    }

    @PutMapping("/{id}/tracking")
    public ShipmentDto updateTracking(@PathVariable Long id, @RequestParam String trackingNumber) {
        return salesService.updateTracking(id, trackingNumber);
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<?> finalizeSalesOrder(@PathVariable Long id) {
        try {
            salesOrderPipelineService.finalizeSalesOrder(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Sales order finalized successfully");
            return ResponseEntity.ok(response);
        } catch (InsufficientStockException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            response.put("type", "INSUFFICIENT_STOCK");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to finalize order: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelSalesOrder(@PathVariable Long id) {
        try {
            salesOrderPipelineService.cancelSalesOrder(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Sales order cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to cancel order: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
