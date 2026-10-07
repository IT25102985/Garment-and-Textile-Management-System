package com.stitchworks.sales.service;

import com.stitchworks.inventory.model.FinishedInventory;
import com.stitchworks.inventory.repository.FinishedInventoryRepository;
import com.stitchworks.sales.model.SalesOrder;
import com.stitchworks.sales.model.SalesOrderItem;
import com.stitchworks.sales.model.SalesOrderStatus;
import com.stitchworks.sales.repository.SalesOrderRepository;
import com.stitchworks.shared.exception.InsufficientStockException;
import com.stitchworks.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SalesOrderPipelineService {

    private final SalesOrderRepository salesOrderRepository;
    private final FinishedInventoryRepository finishedInventoryRepository;

    @Transactional
    public void finalizeSalesOrder(Long orderId) throws InsufficientStockException {
        SalesOrder order = salesOrderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Sales order not found with id: " + orderId));

        // Core logic: When order is finalized
        for (SalesOrderItem item : order.getItems()) {
            FinishedInventory inventory = finishedInventoryRepository
                .findByProduct(item.getProduct())
                .orElseThrow(() -> new InsufficientStockException(
                    "No inventory record for product: " + item.getProduct().getName()
                ));

            // Check available stock
            if (inventory.getAvailableStock() < item.getQuantity().intValue()) {
                throw new InsufficientStockException(
                    "Insufficient stock for " + item.getProduct().getName() + 
                    ". Available: " + inventory.getAvailableStock() + 
                    ", Required: " + item.getQuantity()
                );
            }

            // Deduct from available inventory
            inventory.setAvailableStock(
                inventory.getAvailableStock() - item.getQuantity().intValue()
            );
            inventory.setLastUpdated(LocalDateTime.now());
            finishedInventoryRepository.save(inventory);
        }

        order.setStatus(SalesOrderStatus.FINALIZED);
        salesOrderRepository.save(order);
    }

    @Transactional
    public void cancelSalesOrder(Long orderId) {
        SalesOrder order = salesOrderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Sales order not found with id: " + orderId));

        // Restore inventory if order was finalized
        if (order.getStatus() == SalesOrderStatus.FINALIZED) {
            for (SalesOrderItem item : order.getItems()) {
                FinishedInventory inventory = finishedInventoryRepository
                    .findByProduct(item.getProduct())
                    .orElse(null);

                if (inventory != null) {
                    inventory.setAvailableStock(
                        inventory.getAvailableStock() + item.getQuantity().intValue()
                    );
                    inventory.setLastUpdated(LocalDateTime.now());
                    finishedInventoryRepository.save(inventory);
                }
            }
        }

        order.setStatus(SalesOrderStatus.CANCELLED);
        salesOrderRepository.save(order);
    }
}
