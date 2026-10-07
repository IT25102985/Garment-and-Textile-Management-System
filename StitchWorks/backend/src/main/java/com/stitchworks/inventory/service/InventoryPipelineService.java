package com.stitchworks.inventory.service;

import com.stitchworks.inventory.model.FinishedInventory;
import com.stitchworks.inventory.repository.FinishedInventoryRepository;
import com.stitchworks.product.model.BOM;
import com.stitchworks.product.repository.BOMRepository;
import com.stitchworks.production.model.ProductionBatch;
import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.shared.exception.InsufficientStockException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryPipelineService {

    private final RawMaterialRepository rawMaterialRepository;
    private final FinishedInventoryRepository finishedInventoryRepository;
    private final BOMRepository bomRepository;

    @Transactional
    public void deductRawMaterials(ProductionBatch batch) throws InsufficientStockException {
        List<BOM> bomEntries = bomRepository.findByProduct(batch.getProduct());

        for (BOM bom : bomEntries) {
            BigDecimal requiredQuantity = bom.getQuantityRequired()
                            .multiply(BigDecimal.valueOf(batch.getQuantityProduced()));

            RawMaterial material = bom.getMaterial();

            // Check if enough stock exists
            if (material.getCurrentStock().compareTo(requiredQuantity) < 0) {
                throw new InsufficientStockException(
                    "Insufficient stock for raw material: " + material.getName() + 
                    ". Required: " + requiredQuantity + ", Available: " + material.getCurrentStock()
                );
            }

            // Deduct from raw material stock
            BigDecimal newStock = material.getCurrentStock().subtract(requiredQuantity);
            material.setCurrentStock(newStock);
            rawMaterialRepository.save(material);
        }
    }

    @Transactional
    public void addFinishedProductsToInventory(ProductionBatch batch) {
        FinishedInventory inventory = finishedInventoryRepository
            .findByProduct(batch.getProduct())
            .orElseGet(() -> {
                FinishedInventory newInv = new FinishedInventory();
                newInv.setProduct(batch.getProduct());
                newInv.setAvailableStock(0);
                newInv.setReservedStock(0);
                return newInv;
            });

        inventory.setAvailableStock(
            inventory.getAvailableStock() + batch.getQuantityProduced()
        );
        inventory.setLastUpdated(LocalDateTime.now());
        finishedInventoryRepository.save(inventory);
    }

    @Transactional
    public void reserveInventory(FinishedInventory inventory, int quantity) throws InsufficientStockException {
        if (inventory.getAvailableStock() < quantity) {
            throw new InsufficientStockException(
                "Insufficient available stock for " + inventory.getProduct().getName() + 
                ". Available: " + inventory.getAvailableStock() + ", Required: " + quantity
            );
        }

        inventory.setAvailableStock(inventory.getAvailableStock() - quantity);
        inventory.setReservedStock(inventory.getReservedStock() + quantity);
        inventory.setLastUpdated(LocalDateTime.now());
        finishedInventoryRepository.save(inventory);
    }

    @Transactional
    public void releaseReservedInventory(FinishedInventory inventory, int quantity) {
        if (inventory.getReservedStock() >= quantity) {
            inventory.setReservedStock(inventory.getReservedStock() - quantity);
            inventory.setLastUpdated(LocalDateTime.now());
            finishedInventoryRepository.save(inventory);
        }
    }
}
