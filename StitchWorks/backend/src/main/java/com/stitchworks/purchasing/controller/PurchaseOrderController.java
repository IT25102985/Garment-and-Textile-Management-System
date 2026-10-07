package com.stitchworks.purchasing.controller;

import com.stitchworks.purchasing.dto.PurchaseOrderDto;
import com.stitchworks.purchasing.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase-orders")
@PreAuthorize("hasAnyRole('ADMIN', 'PURCHASING_OFFICER', 'STOREKEEPER')")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public List<PurchaseOrderDto> getAllPurchaseOrders() {
        return purchaseOrderService.getAllPurchaseOrders();
    }

    @PostMapping
    public PurchaseOrderDto createPurchaseOrder(@RequestBody PurchaseOrderDto dto) {
        return purchaseOrderService.createPurchaseOrder(dto);
    }

    @PutMapping("/{id}/status")
    public PurchaseOrderDto updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return purchaseOrderService.updateStatus(id, body.get("status"));
    }

    @PostMapping("/{id}/receive")
    public PurchaseOrderDto receiveShipment(@PathVariable Long id, @RequestBody Map<Long, java.math.BigDecimal> receivedQuantities) {
        return purchaseOrderService.receiveShipment(id, receivedQuantities);
    }

    @PostMapping("/{id}/pay")
    public PurchaseOrderDto recordPayment(@PathVariable Long id, @RequestBody Map<String, java.math.BigDecimal> body) {
        return purchaseOrderService.recordPayment(id, body.get("amount"));
    }
}
