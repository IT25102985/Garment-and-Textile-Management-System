package com.stitchworks.inventory.controller;

import com.stitchworks.inventory.dto.FinishedGoodStockDto;
import com.stitchworks.inventory.dto.FinishedInventoryDto;
import com.stitchworks.inventory.dto.RawMaterialStockDto;
import com.stitchworks.inventory.dto.StockLedgerDto;
import com.stitchworks.inventory.model.FinishedInventory;
import com.stitchworks.inventory.repository.FinishedInventoryRepository;
import com.stitchworks.inventory.service.InventoryService;
import com.stitchworks.product.model.FinishedProduct;
import com.stitchworks.product.repository.FinishedProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER')")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final FinishedInventoryRepository finishedInventoryRepository;
    private final FinishedProductRepository finishedProductRepository;

    @GetMapping("/raw-materials")
    public List<RawMaterialStockDto> getRawMaterialStock() {
        return inventoryService.getRawMaterialStock();
    }

    @GetMapping("/finished-goods")
    public List<FinishedGoodStockDto> getFinishedGoodsStock() {
        return inventoryService.getFinishedGoodsStock();
    }

    @GetMapping("/finished-inventory")
    public List<FinishedInventoryDto> getFinishedInventory() {
        return finishedInventoryRepository.findAll()
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @GetMapping("/finished-inventory/{productId}")
    public ResponseEntity<FinishedInventoryDto> getFinishedInventoryByProduct(@PathVariable Long productId) {
        FinishedProduct product = finishedProductRepository.findById(productId)
            .orElse(null);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        return finishedInventoryRepository.findByProduct(product)
            .map(inv -> ResponseEntity.ok(convertToDto(inv)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/low-stock")
    public List<RawMaterialStockDto> getLowStockMaterials() {
        return inventoryService.getLowStockMaterials();
    }

    @GetMapping("/transactions")
    public List<StockLedgerDto> getTransactionHistory(
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Long productId) {
        return inventoryService.getTransactionHistory(materialId, productId);
    }

    private FinishedInventoryDto convertToDto(FinishedInventory inventory) {
        FinishedInventoryDto dto = new FinishedInventoryDto();
        dto.setId(inventory.getId());
        dto.setProductId(inventory.getProduct().getId());
        dto.setProductName(inventory.getProduct().getName());
        dto.setAvailableStock(inventory.getAvailableStock());
        dto.setReservedStock(inventory.getReservedStock());
        dto.setLastUpdated(inventory.getLastUpdated());
        return dto;
    }
}
