package com.stitchworks.production.controller;

import com.stitchworks.production.dto.ProductionOrderDto;
import com.stitchworks.production.dto.ProductionTaskDto;
import com.stitchworks.production.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.stitchworks.production.dto.QualityControlLogDto;

import java.util.List;

@RestController
@RequestMapping("/api/production")
@PreAuthorize("hasAnyRole('ADMIN', 'PRODUCTION_STAFF')")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;

    @GetMapping("/orders")
    public List<ProductionOrderDto> getAllOrders() {
        return productionService.getAllOrders();
    }

    @GetMapping("/orders/{id}")
    public ProductionOrderDto getOrderById(@PathVariable Long id) {
        return productionService.getOrderById(id);
    }

    @PostMapping("/orders")
    public ProductionOrderDto createOrder(@RequestBody ProductionOrderDto dto) {
        return productionService.createOrder(dto);
    }

    @PutMapping("/orders/{id}/issue-materials")
    public ResponseEntity<?> issueMaterials(@PathVariable Long id) {
        try {
            productionService.issueMaterials(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/orders/{id}/complete")
    public ProductionOrderDto completeOrder(@PathVariable Long id) {
        return productionService.completeOrder(id);
    }

    @PostMapping("/orders/{id}/tasks")
    public ProductionTaskDto addTask(@PathVariable Long id, @RequestBody ProductionTaskDto dto) {
        return productionService.addTask(id, dto);
    }

    @PutMapping("/tasks/{taskId}")
    public ProductionTaskDto updateTask(@PathVariable Long taskId, @RequestBody ProductionTaskDto dto) {
        return productionService.updateTask(taskId, dto);
    }
    @PutMapping("/orders/{id}")
    public ProductionOrderDto updateOrder(@PathVariable Long id, @RequestBody ProductionOrderDto dto) {
        return productionService.updateOrder(id, dto);
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        productionService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            productionService.cancelOrder(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/tasks/{taskId}/qc")
    public QualityControlLogDto addQcLog(@PathVariable Long taskId, @RequestBody QualityControlLogDto dto) {
        return productionService.addQcLog(taskId, dto);
    }
}
