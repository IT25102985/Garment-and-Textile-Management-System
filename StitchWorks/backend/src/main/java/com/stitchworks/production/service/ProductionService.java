package com.stitchworks.production.service;

import com.stitchworks.inventory.dto.RawMaterialStockDto;
import com.stitchworks.inventory.service.InventoryService;
import com.stitchworks.product.model.BOM;
import com.stitchworks.product.model.FinishedProduct;
import com.stitchworks.product.repository.FinishedProductRepository;
import com.stitchworks.production.dto.ProductionOrderDto;
import com.stitchworks.production.dto.ProductionTaskDto;
import com.stitchworks.production.model.ProductionOrder;
import com.stitchworks.production.model.ProductionOrderStatus;
import com.stitchworks.production.model.ProductionProcess;
import com.stitchworks.production.model.ProductionTask;
import com.stitchworks.production.repository.ProductionOrderRepository;
import com.stitchworks.production.repository.ProductionTaskRepository;
import com.stitchworks.sales.model.SalesOrder;
import com.stitchworks.sales.repository.SalesOrderRepository;
import com.stitchworks.production.dto.QualityControlLogDto;
import com.stitchworks.production.model.DefectAction;
import com.stitchworks.production.model.DefectType;
import com.stitchworks.production.model.QualityControlLog;
import com.stitchworks.production.repository.QualityControlLogRepository;
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
public class ProductionService {

    private final ProductionOrderRepository productionOrderRepository;
    private final ProductionTaskRepository productionTaskRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final FinishedProductRepository finishedProductRepository;
    private final InventoryService inventoryService;
    private final QualityControlLogRepository qcLogRepository;

    public List<ProductionOrderDto> getAllOrders() {
        return productionOrderRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ProductionOrderDto getOrderById(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToDto(order);
    }

    @Transactional
    public ProductionOrderDto createOrder(ProductionOrderDto dto) {
        FinishedProduct product = finishedProductRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        SalesOrder salesOrder = null;
        if (dto.getSalesOrderId() != null) {
            salesOrder = salesOrderRepository.findById(dto.getSalesOrderId()).orElse(null);
        }

        ProductionOrder order = ProductionOrder.builder()
                .orderNumber("PRD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .salesOrder(salesOrder)
                .product(product)
                .quantity(dto.getQuantity())
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .status(ProductionOrderStatus.PLANNED)
                .build();

        ProductionOrder saved = productionOrderRepository.save(order);
        return mapToDto(saved);
    }

    @Transactional
    public void issueMaterials(Long orderId) {
        ProductionOrder order = productionOrderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() != ProductionOrderStatus.PLANNED) {
            throw new RuntimeException("Materials can only be issued for PLANNED orders");
        }

        List<BOM> bomItems = order.getProduct().getBoms();
        
        // 1. Check stock sufficiency
        List<RawMaterialStockDto> currentStockList = inventoryService.getRawMaterialStock();
        Map<Long, BigDecimal> stockMap = currentStockList.stream()
                .collect(Collectors.toMap(RawMaterialStockDto::getMaterialId, RawMaterialStockDto::getCurrentStock));

        for (BOM bom : bomItems) {
            BigDecimal requiredQty = bom.getQuantityRequired().multiply(order.getQuantity());
            BigDecimal availableQty = stockMap.getOrDefault(bom.getMaterial().getId(), BigDecimal.ZERO);
            
            if (availableQty.compareTo(requiredQty) < 0) {
                throw new RuntimeException("Insufficient stock for material: " + bom.getMaterial().getName() + ". Required: " + requiredQty + ", Available: " + availableQty);
            }
        }

        // 2. Issue materials (Deduct from inventory)
        for (BOM bom : bomItems) {
            BigDecimal requiredQty = bom.getQuantityRequired().multiply(order.getQuantity());
            inventoryService.recordStock(
                    bom.getMaterial().getId(),
                    null,
                    "OUT",
                    requiredQty,
                    "PRODUCTION_ISSUE",
                    order.getId()
            );
        }

        // 3. Update status
        order.setStatus(ProductionOrderStatus.IN_PROGRESS);
        productionOrderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        ProductionOrder order = productionOrderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() != ProductionOrderStatus.IN_PROGRESS) {
            throw new RuntimeException("Only IN_PROGRESS orders can be cancelled");
        }
        order.setStatus(ProductionOrderStatus.CANCELLED);
        productionOrderRepository.save(order);

        List<BOM> bomItems = order.getProduct().getBoms();
        for (BOM bom : bomItems) {
            BigDecimal requiredQty = bom.getQuantityRequired().multiply(order.getQuantity());
            inventoryService.recordStock(
                    bom.getMaterial().getId(),
                    null,
                    "IN",
                    requiredQty,
                    "PRODUCTION_RETURN",
                    order.getId()
            );
        }
    }

    @Transactional
    public ProductionOrderDto updateOrder(Long id, ProductionOrderDto dto) {
        ProductionOrder order = productionOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() != ProductionOrderStatus.PLANNED) {
            throw new RuntimeException("Can only update PLANNED orders");
        }
        order.setQuantity(dto.getQuantity());
        order.setStartDate(dto.getStartDate() != null ? dto.getStartDate() : order.getStartDate());
        if (dto.getSalesOrderId() != null) {
            SalesOrder so = salesOrderRepository.findById(dto.getSalesOrderId()).orElse(null);
            order.setSalesOrder(so);
        } else {
            order.setSalesOrder(null);
        }
        return mapToDto(productionOrderRepository.save(order));
    }

    @Transactional
    public void deleteOrder(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() != ProductionOrderStatus.PLANNED) {
            throw new RuntimeException("Can only delete PLANNED orders");
        }
        productionOrderRepository.delete(order);
    }

    @Transactional
    public QualityControlLogDto addQcLog(Long taskId, QualityControlLogDto dto) {
        ProductionTask task = productionTaskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        QualityControlLog log = QualityControlLog.builder()
                .productionTask(task)
                .defectType(DefectType.valueOf(dto.getDefectType()))
                .action(DefectAction.valueOf(dto.getAction()))
                .quantity(dto.getQuantity())
                .notes(dto.getNotes())
                .logDate(LocalDate.now())
                .build();
        return mapQcToDto(qcLogRepository.save(log));
    }

    public BigDecimal getAvailableQuantityForProcess(ProductionOrder order, ProductionProcess process) {
        if (process == ProductionProcess.CUTTING) {
            BigDecimal totalCut = order.getTasks().stream()
                    .filter(t -> t.getProcessName() == ProductionProcess.CUTTING)
                    .map(t -> t.getQuantityCompleted().add(getScrapQuantity(t)))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return order.getQuantity().subtract(totalCut);
        } else if (process == ProductionProcess.STITCHING) {
            BigDecimal totalCut = order.getTasks().stream()
                    .filter(t -> t.getProcessName() == ProductionProcess.CUTTING)
                    .map(ProductionTask::getQuantityCompleted)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalStitched = order.getTasks().stream()
                    .filter(t -> t.getProcessName() == ProductionProcess.STITCHING)
                    .map(t -> t.getQuantityCompleted().add(getScrapQuantity(t)))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return totalCut.subtract(totalStitched);
        } else if (process == ProductionProcess.FINISHING) {
            BigDecimal totalStitched = order.getTasks().stream()
                    .filter(t -> t.getProcessName() == ProductionProcess.STITCHING)
                    .map(ProductionTask::getQuantityCompleted)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalFinished = order.getTasks().stream()
                    .filter(t -> t.getProcessName() == ProductionProcess.FINISHING)
                    .map(t -> t.getQuantityCompleted().add(getScrapQuantity(t)))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return totalStitched.subtract(totalFinished);
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal getScrapQuantity(ProductionTask task) {
        if (task.getQcLogs() == null) return BigDecimal.ZERO;
        return task.getQcLogs().stream()
                .filter(qc -> qc.getAction() == DefectAction.SCRAP)
                .map(QualityControlLog::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public ProductionTaskDto addTask(Long orderId, ProductionTaskDto dto) {
        ProductionOrder order = productionOrderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        
        ProductionProcess process = ProductionProcess.valueOf(dto.getProcessName().toUpperCase());
        BigDecimal availableQty = getAvailableQuantityForProcess(order, process);
        
        if (dto.getQuantityPlanned().compareTo(availableQty) > 0) {
            throw new RuntimeException("Cannot plan more than available quantity (" + availableQty + ") for process " + process);
        }

        ProductionTask task = ProductionTask.builder()
                .productionOrder(order)
                .processName(process)
                .quantityPlanned(dto.getQuantityPlanned())
                .quantityCompleted(dto.getQuantityCompleted() != null ? dto.getQuantityCompleted() : BigDecimal.ZERO)
                .defectQuantity(dto.getDefectQuantity() != null ? dto.getDefectQuantity() : BigDecimal.ZERO)
                .taskDate(dto.getTaskDate() != null ? dto.getTaskDate() : LocalDate.now())
                .build();
                
        ProductionTask saved = productionTaskRepository.save(task);
        return mapTaskToDto(saved);
    }

    @Transactional
    public ProductionTaskDto updateTask(Long taskId, ProductionTaskDto dto) {
        ProductionTask task = productionTaskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (dto.getQuantityCompleted() != null) {
            BigDecimal qtyDiff = dto.getQuantityCompleted().subtract(task.getQuantityCompleted());
            if (qtyDiff.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal availableQty = getAvailableQuantityForProcess(task.getProductionOrder(), task.getProcessName());
                if (qtyDiff.compareTo(availableQty) > 0) {
                    throw new RuntimeException("Cannot complete more than available quantity (" + availableQty + ")");
                }
            }
            task.setQuantityCompleted(dto.getQuantityCompleted());
        }
        if (dto.getDefectQuantity() != null) task.setDefectQuantity(dto.getDefectQuantity());
        return mapTaskToDto(productionTaskRepository.save(task));
    }

    @Transactional
    public ProductionOrderDto completeOrder(Long orderId) {
        ProductionOrder order = productionOrderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() != ProductionOrderStatus.IN_PROGRESS) {
            throw new RuntimeException("Order must be IN_PROGRESS to complete");
        }

        order.setStatus(ProductionOrderStatus.COMPLETED);
        order.setEndDate(LocalDate.now());
        productionOrderRepository.save(order);

        // Receive finished goods into inventory
        inventoryService.recordStock(
                null,
                order.getProduct().getId(),
                "IN",
                order.getQuantity(),
                "PRODUCTION_RECEIPT",
                order.getId()
        );

        return mapToDto(order);
    }

    private ProductionOrderDto mapToDto(ProductionOrder order) {
        ProductionOrderDto dto = new ProductionOrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        if (order.getSalesOrder() != null) {
            dto.setSalesOrderId(order.getSalesOrder().getId());
            dto.setSalesOrderNumber(order.getSalesOrder().getOrderNumber());
        }
        dto.setProductId(order.getProduct().getId());
        dto.setProductName(order.getProduct().getName());
        dto.setStyleCode(order.getProduct().getStyleCode());
        dto.setQuantity(order.getQuantity());
        dto.setStartDate(order.getStartDate());
        dto.setEndDate(order.getEndDate());
        dto.setStatus(order.getStatus().name());

        if (order.getTasks() != null) {
            dto.setTasks(order.getTasks().stream().map(this::mapTaskToDto).collect(Collectors.toList()));
        }

        return dto;
    }

    private ProductionTaskDto mapTaskToDto(ProductionTask task) {
        ProductionTaskDto dto = new ProductionTaskDto();
        dto.setId(task.getId());
        dto.setProcessName(task.getProcessName().name());
        dto.setQuantityPlanned(task.getQuantityPlanned());
        dto.setQuantityCompleted(task.getQuantityCompleted());
        dto.setDefectQuantity(task.getDefectQuantity());
        dto.setTaskDate(task.getTaskDate());
        if (task.getQcLogs() != null) {
            dto.setQcLogs(task.getQcLogs().stream().map(this::mapQcToDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private QualityControlLogDto mapQcToDto(QualityControlLog log) {
        QualityControlLogDto dto = new QualityControlLogDto();
        dto.setId(log.getId());
        dto.setProductionTaskId(log.getProductionTask().getId());
        dto.setDefectType(log.getDefectType().name());
        dto.setAction(log.getAction().name());
        dto.setQuantity(log.getQuantity());
        dto.setNotes(log.getNotes());
        dto.setLogDate(log.getLogDate());
        return dto;
    }
}
