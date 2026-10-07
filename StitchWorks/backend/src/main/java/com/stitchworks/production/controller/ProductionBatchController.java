package com.stitchworks.production.controller;

import com.stitchworks.production.dto.ProductionBatchDto;
import com.stitchworks.production.service.ProductionBatchService;
import com.stitchworks.shared.exception.InsufficientStockException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/production/batches")
@PreAuthorize("hasAnyRole('ADMIN', 'PRODUCTION_STAFF')")
@RequiredArgsConstructor
public class ProductionBatchController {

    private final ProductionBatchService service;

    @PostMapping
    public ResponseEntity<ProductionBatchDto> createBatch(@RequestBody ProductionBatchDto dto) {
        ProductionBatchDto created = service.createBatch(dto);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductionBatchDto> getBatch(@PathVariable Long id) {
        ProductionBatchDto batch = service.getBatch(id);
        return ResponseEntity.ok(batch);
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<?> updateBatchStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            service.updateBatchStatus(id, status);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Batch status updated successfully to: " + status);
            return ResponseEntity.ok(response);
        } catch (InsufficientStockException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            response.put("type", "INSUFFICIENT_STOCK");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to update batch status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/quantity")
    public ResponseEntity<?> updateQuantityProduced(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        try {
            service.updateQuantityProduced(id, quantity);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Quantity produced updated successfully to: " + quantity);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to update quantity: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
