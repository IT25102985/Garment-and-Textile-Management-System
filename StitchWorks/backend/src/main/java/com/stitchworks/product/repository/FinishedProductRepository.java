package com.stitchworks.product.repository;

import com.stitchworks.product.model.FinishedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinishedProductRepository extends JpaRepository<FinishedProduct, Long> {
    Optional<FinishedProduct> findByStyleCode(String styleCode);
    List<FinishedProduct> findByPublishedTrue();
}
