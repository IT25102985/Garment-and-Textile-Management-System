package com.stitchworks.production.repository;

import com.stitchworks.production.model.ProductionBatch;
import com.stitchworks.production.model.ProductionBatchStatus;
import com.stitchworks.product.model.FinishedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionBatchRepository extends JpaRepository<ProductionBatch, Long> {
    Optional<ProductionBatch> findByBatchNumber(String batchNumber);
    
    List<ProductionBatch> findByStatus(ProductionBatchStatus status);
    
    List<ProductionBatch> findByProduct(FinishedProduct product);
}
