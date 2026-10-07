package com.stitchworks.inventory.repository;

import com.stitchworks.inventory.model.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface StockLedgerRepository extends JpaRepository<StockLedger, Long> {

    List<StockLedger> findByMaterialId(Long materialId);
    
    List<StockLedger> findByProductId(Long productId);

    @Query("SELECT s.materialId, SUM(CASE WHEN s.transactionType = 'IN' THEN s.quantity ELSE -s.quantity END) " +
           "FROM StockLedger s WHERE s.materialId IS NOT NULL GROUP BY s.materialId")
    List<Object[]> getAggregatedMaterialStock();

    @Query("SELECT s.productId, SUM(CASE WHEN s.transactionType = 'IN' THEN s.quantity ELSE -s.quantity END) " +
           "FROM StockLedger s WHERE s.productId IS NOT NULL GROUP BY s.productId")
    List<Object[]> getAggregatedProductStock();
}
