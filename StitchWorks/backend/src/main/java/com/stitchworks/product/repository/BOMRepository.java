package com.stitchworks.product.repository;

import com.stitchworks.product.model.BOM;
import com.stitchworks.product.model.FinishedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BOMRepository extends JpaRepository<BOM, Long> {
    List<BOM> findByProductId(Long productId);
    
    List<BOM> findByProduct(FinishedProduct product);
    
    void deleteByProduct(FinishedProduct product);

    void deleteByMaterial_Id(Long rawMaterialId);
}
