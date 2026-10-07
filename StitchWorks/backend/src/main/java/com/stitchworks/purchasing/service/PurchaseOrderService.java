package com.stitchworks.purchasing.service;

import com.stitchworks.inventory.service.InventoryService;
import com.stitchworks.purchasing.dto.PurchaseOrderDto;
import com.stitchworks.purchasing.dto.PurchaseOrderItemDto;
import com.stitchworks.purchasing.model.PurchaseOrder;
import com.stitchworks.purchasing.model.PurchaseOrderItem;
import com.stitchworks.purchasing.model.PurchaseOrderStatus;
import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.purchasing.model.Supplier;
import com.stitchworks.purchasing.repository.PurchaseOrderRepository;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.purchasing.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final InventoryService inventoryService;

    public List<PurchaseOrderDto> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public PurchaseOrderDto createPurchaseOrder(PurchaseOrderDto dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        String poNumber = dto.getPoNumber() != null && !dto.getPoNumber().isEmpty() 
                ? dto.getPoNumber() 
                : "PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(poNumber)
                .supplier(supplier)
                .orderDate(dto.getOrderDate())
                .expectedDate(dto.getExpectedDate())
                .status(PurchaseOrderStatus.SENT)
                .items(new ArrayList<>())
                .build();

        if (dto.getItems() != null) {
            for (PurchaseOrderItemDto itemDto : dto.getItems()) {
                RawMaterial material = rawMaterialRepository.findById(itemDto.getRawMaterialId())
                        .orElseThrow(() -> new RuntimeException("Material not found: " + itemDto.getRawMaterialId()));
                
                PurchaseOrderItem item = PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .rawMaterial(material)
                        .quantity(itemDto.getQuantity())
                        .unitPrice(itemDto.getUnitPrice())
                        .build();
                po.getItems().add(item);
                
                BigDecimal itemTotal = itemDto.getQuantity().multiply(itemDto.getUnitPrice());
                po.setTotalAmount(po.getTotalAmount().add(itemTotal));
            }
        }

        return mapToDto(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDto updateStatus(Long id, String statusStr) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        po.setStatus(PurchaseOrderStatus.valueOf(statusStr.toUpperCase()));
        return mapToDto(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDto receiveShipment(Long id, Map<Long, BigDecimal> receivedQuantities) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));

        if (po.getStatus() == PurchaseOrderStatus.CLOSED) {
            throw new RuntimeException("Purchase Order is already closed");
        }

        boolean allReceived = true;

        for (PurchaseOrderItem item : po.getItems()) {
            if (receivedQuantities.containsKey(item.getId())) {
                BigDecimal qtyReceivedNow = receivedQuantities.get(item.getId());
                
                // Update item received quantity
                item.setQuantityReceived(item.getQuantityReceived().add(qtyReceivedNow));
                
                // Increment material stock
                RawMaterial material = item.getRawMaterial();
                if (material.getCurrentStock() == null) {
                    material.setCurrentStock(BigDecimal.ZERO);
                }
                material.setCurrentStock(material.getCurrentStock().add(qtyReceivedNow));
                rawMaterialRepository.save(material);
                
                // Also record in inventory service for ledger history
                inventoryService.recordStock(
                        material.getId(),
                        null,
                        "IN",
                        qtyReceivedNow,
                        "PURCHASE_ORDER",
                        po.getId()
                );
            }
            
            if (item.getQuantityReceived().compareTo(item.getQuantity()) < 0) {
                allReceived = false;
            }
        }

        if (allReceived) {
            po.setStatus(PurchaseOrderStatus.FULLY_RECEIVED);
        } else {
            po.setStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED);
        }

        // Close if fully received and fully paid
        if (allReceived && po.getAmountPaid().compareTo(po.getTotalAmount()) >= 0) {
            po.setStatus(PurchaseOrderStatus.CLOSED);
        }

        return mapToDto(purchaseOrderRepository.save(po));
    }
    
    @Transactional
    public PurchaseOrderDto recordPayment(Long id, BigDecimal amount) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
                
        po.setAmountPaid(po.getAmountPaid().add(amount));
        
        if (po.getStatus() == PurchaseOrderStatus.FULLY_RECEIVED && po.getAmountPaid().compareTo(po.getTotalAmount()) >= 0) {
            po.setStatus(PurchaseOrderStatus.CLOSED);
        }
        
        return mapToDto(purchaseOrderRepository.save(po));
    }

    public PurchaseOrderDto mapToDto(PurchaseOrder po) {
        PurchaseOrderDto dto = new PurchaseOrderDto();
        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        dto.setSupplierId(po.getSupplier().getId());
        dto.setSupplierName(po.getSupplier().getName());
        dto.setOrderDate(po.getOrderDate());
        dto.setExpectedDate(po.getExpectedDate());
        dto.setStatus(po.getStatus().name());
        dto.setTotalAmount(po.getTotalAmount());
        dto.setAmountPaid(po.getAmountPaid());
        
        List<PurchaseOrderItemDto> itemDtos = po.getItems().stream().map(item -> {
            PurchaseOrderItemDto itemDto = new PurchaseOrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setRawMaterialId(item.getRawMaterial().getId());
            itemDto.setRawMaterialName(item.getRawMaterial().getName());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setQuantityReceived(item.getQuantityReceived());
            itemDto.setUnitPrice(item.getUnitPrice());
            return itemDto;
        }).collect(Collectors.toList());
        dto.setItems(itemDtos);

        return dto;
    }
}
