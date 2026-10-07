package com.stitchworks.production.service;

import com.stitchworks.inventory.service.InventoryPipelineService;
import com.stitchworks.production.dto.ProductionBatchDto;
import com.stitchworks.production.model.ProductionBatch;
import com.stitchworks.production.model.ProductionBatchStatus;
import com.stitchworks.production.repository.ProductionBatchRepository;
import com.stitchworks.product.model.FinishedProduct;
import com.stitchworks.product.repository.FinishedProductRepository;
import com.stitchworks.shared.exception.InsufficientStockException;
import com.stitchworks.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProductionBatchService {

    private final ProductionBatchRepository batchRepository;
    private final FinishedProductRepository productRepository;
    private final InventoryPipelineService inventoryPipelineService;

    @Transactional
    public ProductionBatchDto createBatch(ProductionBatchDto dto) {
        FinishedProduct product = productRepository.findById(dto.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));

        ProductionBatch batch = ProductionBatch.builder()
            .batchNumber(dto.getBatchNumber())
            .product(product)
            .quantityToProduce(dto.getQuantityToProduce())
            .quantityProduced(0)
            .status(ProductionBatchStatus.PENDING)
            .notes(dto.getNotes())
            .build();

        ProductionBatch saved = batchRepository.save(batch);
        return convertToDto(saved);
    }

    public ProductionBatchDto getBatch(Long batchId) {
        ProductionBatch batch = batchRepository.findById(batchId)
            .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + batchId));
        return convertToDto(batch);
    }

    @Transactional
    public void updateBatchStatus(Long batchId, String newStatusStr) throws InsufficientStockException {
        ProductionBatch batch = batchRepository.findById(batchId)
            .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + batchId));

        ProductionBatchStatus newStatus = ProductionBatchStatus.valueOf(newStatusStr.toUpperCase());

        // Core logic: When batch is completed
        if (newStatus == ProductionBatchStatus.COMPLETED) {
            // 1. Deduct raw materials from stock
            inventoryPipelineService.deductRawMaterials(batch);

            // 2. Add finished products to inventory
            inventoryPipelineService.addFinishedProductsToInventory(batch);

            batch.setEndDate(LocalDateTime.now());
        } else if (newStatus == ProductionBatchStatus.IN_PROGRESS) {
            batch.setStartDate(LocalDateTime.now());
        }

        batch.setStatus(newStatus);
        batchRepository.save(batch);
    }

    @Transactional
    public void updateQuantityProduced(Long batchId, Integer quantityProduced) {
        ProductionBatch batch = batchRepository.findById(batchId)
            .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + batchId));

        if (quantityProduced > batch.getQuantityToProduce()) {
            throw new IllegalArgumentException(
                "Quantity produced cannot exceed quantity to produce. Max: " + batch.getQuantityToProduce()
            );
        }

        batch.setQuantityProduced(quantityProduced);
        batchRepository.save(batch);
    }

    private ProductionBatchDto convertToDto(ProductionBatch batch) {
        ProductionBatchDto dto = new ProductionBatchDto();
        dto.setId(batch.getId());
        dto.setBatchNumber(batch.getBatchNumber());
        dto.setProductId(batch.getProduct().getId());
        dto.setProductName(batch.getProduct().getName());
        dto.setQuantityToProduce(batch.getQuantityToProduce());
        dto.setQuantityProduced(batch.getQuantityProduced());
        dto.setStatus(batch.getStatus().toString());
        dto.setStartDate(batch.getStartDate());
        dto.setEndDate(batch.getEndDate());
        dto.setNotes(batch.getNotes());
        return dto;
    }
}
