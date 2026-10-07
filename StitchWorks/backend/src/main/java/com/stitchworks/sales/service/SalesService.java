package com.stitchworks.sales.service;

import com.stitchworks.inventory.model.FinishedInventory;
import com.stitchworks.inventory.repository.FinishedInventoryRepository;
import com.stitchworks.inventory.service.InventoryService;
import com.stitchworks.product.model.FinishedProduct;
import com.stitchworks.product.repository.FinishedProductRepository;
import com.stitchworks.sales.dto.InvoiceDto;
import com.stitchworks.sales.dto.SalesOrderDto;
import com.stitchworks.sales.dto.SalesOrderItemDto;
import com.stitchworks.sales.dto.ShipmentDto;
import com.stitchworks.sales.model.Customer;
import com.stitchworks.sales.model.Invoice;
import com.stitchworks.sales.model.InvoiceStatus;
import com.stitchworks.sales.model.SalesOrder;
import com.stitchworks.sales.model.SalesOrderItem;
import com.stitchworks.sales.model.SalesOrderStatus;
import com.stitchworks.sales.model.Shipment;
import com.stitchworks.sales.repository.CustomerRepository;
import com.stitchworks.sales.repository.InvoiceRepository;
import com.stitchworks.sales.repository.SalesOrderRepository;
import com.stitchworks.sales.repository.ShipmentRepository;
import com.stitchworks.inventory.repository.StockLedgerRepository;
import com.stitchworks.shared.exception.InsufficientStockException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesService {

    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    private final FinishedProductRepository finishedProductRepository;
    private final FinishedInventoryRepository finishedInventoryRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final InvoiceRepository invoiceRepository;
    private final ShipmentRepository shipmentRepository;
    private final InventoryService inventoryService;

    public List<SalesOrderDto> getAllOrders() {
        return salesOrderRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<SalesOrderDto> getOrdersByCustomerId(Long customerId) {
        return salesOrderRepository.findByCustomerId(customerId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<InvoiceDto> getInvoicesByCustomerId(Long customerId) {
        return invoiceRepository.findBySalesOrderCustomerId(customerId).stream().map(this::mapInvoiceToDto).collect(Collectors.toList());
    }

    public SalesOrderDto getOrderById(Long id) {
        SalesOrder order = salesOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToDto(order);
    }

    public boolean checkStockAvailability(SalesOrder order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return true;
        }

        // Build a live net-stock map from the ledger (always up-to-date)
        Map<Long, BigDecimal> ledgerStock = new java.util.HashMap<>();
        for (Object[] row : stockLedgerRepository.getAggregatedProductStock()) {
            Long productId = ((Number) row[0]).longValue();
            BigDecimal netStock = (BigDecimal) row[1];
            ledgerStock.put(productId, netStock);
        }

        for (SalesOrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Long productId = item.getProduct().getId();
                int requested = item.getQuantity() != null ? item.getQuantity().intValue() : 0;

                int available;
                if (ledgerStock.containsKey(productId)) {
                    // Use ledger (source of truth)
                    available = ledgerStock.get(productId).intValue();
                } else {
                    // Fall back to finished_inventory; if neither exists assume sufficient
                    available = finishedInventoryRepository.findByProduct(item.getProduct())
                            .map(FinishedInventory::getAvailableStock)
                            .orElse(Integer.MAX_VALUE);
                }

                if (available < requested) {
                    return false;
                }
            }
        }
        return true;
    }

    @Transactional
    public SalesOrderDto createOrder(SalesOrderDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        boolean requiresProduction = false;
        if (dto.getItems() != null) {
            for (SalesOrderItemDto itemDto : dto.getItems()) {
                FinishedProduct product = finishedProductRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                int available = finishedInventoryRepository.findByProduct(product)
                        .map(FinishedInventory::getAvailableStock)
                        .orElse(0);
                int requested = itemDto.getQuantity() != null ? itemDto.getQuantity().intValue() : 0;
                if (available < requested) {
                    requiresProduction = true;
                }
            }
        }

        SalesOrderStatus initialStatus = requiresProduction ? SalesOrderStatus.PENDING_PRODUCTION : SalesOrderStatus.READY_TO_DISPATCH;

        SalesOrder order = SalesOrder.builder()
                .orderNumber("SO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customer(customer)
                .orderDate(dto.getOrderDate() != null ? dto.getOrderDate() : LocalDate.now())
                .deliveryDate(dto.getDeliveryDate())
                .status(initialStatus)
                .deliveryAddress(dto.getDeliveryAddress())
                .deliveryCity(dto.getDeliveryCity())
                .deliveryPostalCode(dto.getDeliveryPostalCode())
                .deliveryCountry(dto.getDeliveryCountry())
                .shippingMethod(dto.getShippingMethod())
                .shippingCost(dto.getShippingCost())
                .build();

        if (dto.getItems() != null) {
            for (SalesOrderItemDto itemDto : dto.getItems()) {
                FinishedProduct product = finishedProductRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                SalesOrderItem item = SalesOrderItem.builder()
                        .salesOrder(order)
                        .product(product)
                        .quantity(itemDto.getQuantity())
                        .unitPrice(itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : product.getBasePrice())
                        .size(itemDto.getSize())
                        .color(itemDto.getColor())
                        .build();
                order.getItems().add(item);
            }
        }

        SalesOrder saved = salesOrderRepository.save(order);
        return mapToDto(saved);
    }

    @Transactional
    public SalesOrderDto updateStatus(Long id, String statusStr) {
        SalesOrder order = salesOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        SalesOrderStatus targetStatus = SalesOrderStatus.valueOf(statusStr.toUpperCase());

        // Validate stock before moving to dispatch or shipped
        if (targetStatus == SalesOrderStatus.READY_TO_DISPATCH || targetStatus == SalesOrderStatus.DISPATCHED || targetStatus == SalesOrderStatus.SHIPPED) {
            if (!checkStockAvailability(order)) {
                throw new InsufficientStockException("Insufficient inventory. This order cannot be marked for dispatch until sufficient stock is available.");
            }
        }

        order.setStatus(targetStatus);
        return mapToDto(salesOrderRepository.save(order));
    }

    @Transactional
    public InvoiceDto createInvoice(Long orderId, LocalDate dueDate) {
        SalesOrder order = salesOrderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (invoiceRepository.findBySalesOrderId(orderId).isPresent()) {
            throw new RuntimeException("Invoice already exists for this order");
        }

        BigDecimal total = BigDecimal.ZERO;
        for (SalesOrderItem item : order.getItems()) {
            total = total.add(item.getQuantity().multiply(item.getUnitPrice()));
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .salesOrder(order)
                .totalAmount(total)
                .paidAmount(BigDecimal.ZERO)
                .dueDate(dueDate)
                .status(InvoiceStatus.UNPAID)
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        return mapInvoiceToDto(saved);
    }

    @Transactional
    public ShipmentDto shipOrder(Long orderId, String trackingNumber) {
        SalesOrder order = salesOrderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));

        if (!checkStockAvailability(order)) {
            throw new InsufficientStockException("Insufficient inventory. This order cannot be marked for dispatch until sufficient stock is available.");
        }

        order.setStatus(SalesOrderStatus.DISPATCHED);
        salesOrderRepository.save(order);

        Shipment shipment = shipmentRepository.findBySalesOrderId(orderId).orElse(null);
        if (shipment != null) {
            shipment.setTrackingNumber(trackingNumber);
            shipment.setShippedDate(LocalDate.now());
        } else {
            shipment = Shipment.builder()
                    .salesOrder(order)
                    .trackingNumber(trackingNumber)
                    .shippedDate(LocalDate.now())
                    .build();
        }
        Shipment saved = shipmentRepository.save(shipment);

        // Deduct inventory
        for (SalesOrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                finishedInventoryRepository.findByProduct(item.getProduct()).ifPresent(inv -> {
                    int current = inv.getAvailableStock() != null ? inv.getAvailableStock() : 0;
                    int qty = item.getQuantity() != null ? item.getQuantity().intValue() : 0;
                    inv.setAvailableStock(Math.max(0, current - qty));
                    inv.setLastUpdated(java.time.LocalDateTime.now());
                    finishedInventoryRepository.save(inv);
                });

                inventoryService.recordStock(
                        null,
                        item.getProduct().getId(),
                        "OUT",
                        item.getQuantity(),
                        "SALES_DISPATCH",
                        item.getId()
                );
            }
        }

        return mapShipmentToDto(saved);
    }

    @Transactional
    public ShipmentDto updateTracking(Long orderId, String trackingNumber) {
        SalesOrder order = salesOrderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        Shipment shipment = shipmentRepository.findBySalesOrderId(orderId).orElse(null);
        if (shipment != null) {
            shipment.setTrackingNumber(trackingNumber);
            shipment.setShippedDate(LocalDate.now());
        } else {
            shipment = Shipment.builder()
                    .salesOrder(order)
                    .trackingNumber(trackingNumber)
                    .shippedDate(LocalDate.now())
                    .build();
        }
        return mapShipmentToDto(shipmentRepository.save(shipment));
    }

    @Transactional
    public InvoiceDto makePayment(Long invoiceId, BigDecimal amount) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero.");
        }

        BigDecimal currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal total = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal newPaid = currentPaid.add(amount);

        if (newPaid.compareTo(total) >= 0) {
            invoice.setPaidAmount(total);
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setPaidAmount(newPaid);
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }

        Invoice saved = invoiceRepository.save(invoice);
        return mapInvoiceToDto(saved);
    }

    public SalesOrderDto mapToDto(SalesOrder order) {
        SalesOrderDto dto = new SalesOrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getId());
            dto.setCustomerName(order.getCustomer().getName());
        }
        dto.setOrderDate(order.getOrderDate());
        dto.setDeliveryDate(order.getDeliveryDate());
        dto.setStatus(order.getStatus().name());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setDeliveryCity(order.getDeliveryCity());
        dto.setDeliveryPostalCode(order.getDeliveryPostalCode());
        dto.setDeliveryCountry(order.getDeliveryCountry());
        dto.setShippingMethod(order.getShippingMethod());
        dto.setShippingCost(order.getShippingCost());

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(item -> {
                SalesOrderItemDto iDto = new SalesOrderItemDto();
                iDto.setId(item.getId());
                if (item.getProduct() != null) {
                    iDto.setProductId(item.getProduct().getId());
                    iDto.setProductName(item.getProduct().getName());
                    iDto.setStyleCode(item.getProduct().getStyleCode());
                }
                iDto.setQuantity(item.getQuantity());
                iDto.setUnitPrice(item.getUnitPrice());
                iDto.setSize(item.getSize());
                iDto.setColor(item.getColor());
                return iDto;
            }).collect(Collectors.toList()));
        }

        invoiceRepository.findBySalesOrderId(order.getId()).ifPresent(inv -> dto.setInvoice(mapInvoiceToDto(inv)));
        shipmentRepository.findBySalesOrderId(order.getId()).ifPresent(ship -> dto.setShipment(mapShipmentToDto(ship)));

        return dto;
    }

    public InvoiceDto mapInvoiceToDto(Invoice inv) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(inv.getId());
        dto.setInvoiceNumber(inv.getInvoiceNumber());
        if (inv.getSalesOrder() != null) {
            dto.setOrderId(inv.getSalesOrder().getId());
            dto.setOrderNumber(inv.getSalesOrder().getOrderNumber());
            if (inv.getSalesOrder().getCustomer() != null) {
                dto.setCustomerId(inv.getSalesOrder().getCustomer().getId());
                dto.setCustomerName(inv.getSalesOrder().getCustomer().getName());
            }
        }
        dto.setTotalAmount(inv.getTotalAmount());
        BigDecimal paid = inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO;
        dto.setPaidAmount(paid);
        dto.setRemainingAmount(inv.getTotalAmount().subtract(paid).max(BigDecimal.ZERO));
        dto.setDueDate(inv.getDueDate());
        dto.setStatus(inv.getStatus().name());
        return dto;
    }

    public ShipmentDto mapShipmentToDto(Shipment ship) {
        ShipmentDto dto = new ShipmentDto();
        dto.setId(ship.getId());
        dto.setTrackingNumber(ship.getTrackingNumber());
        dto.setShippedDate(ship.getShippedDate());
        return dto;
    }
}
