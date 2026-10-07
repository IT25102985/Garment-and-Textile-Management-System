package com.stitchworks.inventory.repository;

import com.stitchworks.inventory.model.FinishedInventory;
import com.stitchworks.product.model.FinishedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FinishedInventoryRepository extends JpaRepository<FinishedInventory, Long> {
    Optional<FinishedInventory> findByProduct(FinishedProduct product);
}
