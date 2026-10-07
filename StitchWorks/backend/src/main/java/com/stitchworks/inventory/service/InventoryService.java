package com.stitchworks.inventory.service;

import com.stitchworks.inventory.dto.FinishedGoodStockDto;
import com.stitchworks.inventory.dto.RawMaterialStockDto;
import com.stitchworks.inventory.dto.StockLedgerDto;
import com.stitchworks.inventory.model.StockLedger;
import com.stitchworks.inventory.repository.StockLedgerRepository;
import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.product.model.FinishedProduct;
import com.stitchworks.product.repository.FinishedProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final StockLedgerRepository stockLedgerRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final FinishedProductRepository finishedProductRepository;

    @Transactional
    public void recordStock(Long materialId, Long productId, String type, BigDecimal quantity, String refType, Long refId) {
        StockLedger ledger = StockLedger.builder()
                .transactionType(type.toUpperCase())
                .materialId(materialId)
                .productId(productId)
                .quantity(quantity)
                .referenceType(refType.toUpperCase())
                .referenceId(refId)
                .transactionDate(LocalDateTime.now())
                .build();
        stockLedgerRepository.save(ledger);
    }

    public List<RawMaterialStockDto> getRawMaterialStock() {
        List<Object[]> aggregated = stockLedgerRepository.getAggregatedMaterialStock();
        Map<Long, BigDecimal> stockMap = aggregated.stream()
                .collect(Collectors.toMap(
                        obj -> (Long) obj[0],
                        obj -> (BigDecimal) obj[1]
                ));

        List<RawMaterial> materials = rawMaterialRepository.findAll();
        List<RawMaterialStockDto> result = new ArrayList<>();

        for (RawMaterial mat : materials) {
            RawMaterialStockDto dto = new RawMaterialStockDto();
            dto.setMaterialId(mat.getId());
            dto.setMaterialName(mat.getName());
            dto.setCategory(mat.getCategory());
            dto.setUnit(mat.getUnit());
            dto.setReorderLevel(mat.getReorderLevel());
            dto.setCurrentStock(stockMap.getOrDefault(mat.getId(), BigDecimal.ZERO));
            result.add(dto);
        }

        return result;
    }

    public List<FinishedGoodStockDto> getFinishedGoodsStock() {
        List<Object[]> aggregated = stockLedgerRepository.getAggregatedProductStock();
        Map<Long, BigDecimal> stockMap = aggregated.stream()
                .collect(Collectors.toMap(
                        obj -> (Long) obj[0],
                        obj -> (BigDecimal) obj[1]
                ));

        List<FinishedProduct> products = finishedProductRepository.findAll();
        List<FinishedGoodStockDto> result = new ArrayList<>();

        for (FinishedProduct prod : products) {
            FinishedGoodStockDto dto = new FinishedGoodStockDto();
            dto.setProductId(prod.getId());
            dto.setStyleCode(prod.getStyleCode());
            dto.setProductName(prod.getName());
            if (prod.getCategory() != null) {
                dto.setCategoryName(prod.getCategory().getName());
            }
            dto.setCurrentStock(stockMap.getOrDefault(prod.getId(), BigDecimal.ZERO));
            result.add(dto);
        }

        return result;
    }

    public List<RawMaterialStockDto> getLowStockMaterials() {
        return getRawMaterialStock().stream()
                .filter(dto -> dto.getCurrentStock().compareTo(dto.getReorderLevel() == null ? BigDecimal.ZERO : dto.getReorderLevel()) <= 0)
                .collect(Collectors.toList());
    }

    public List<StockLedgerDto> getTransactionHistory(Long materialId, Long productId) {
        List<StockLedger> ledgers;
        if (materialId != null) {
            ledgers = stockLedgerRepository.findByMaterialId(materialId);
        } else if (productId != null) {
            ledgers = stockLedgerRepository.findByProductId(productId);
        } else {
            ledgers = stockLedgerRepository.findAll();
        }

        return ledgers.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private StockLedgerDto mapToDto(StockLedger ledger) {
        StockLedgerDto dto = new StockLedgerDto();
        dto.setId(ledger.getId());
        dto.setTransactionType(ledger.getTransactionType());
        dto.setMaterialId(ledger.getMaterialId());
        dto.setProductId(ledger.getProductId());
        dto.setQuantity(ledger.getQuantity());
        dto.setReferenceType(ledger.getReferenceType());
        dto.setReferenceId(ledger.getReferenceId());
        dto.setTransactionDate(ledger.getTransactionDate());
        return dto;
    }
}
