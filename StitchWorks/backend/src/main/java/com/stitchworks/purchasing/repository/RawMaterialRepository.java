package com.stitchworks.purchasing.repository;

import com.stitchworks.purchasing.model.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    Optional<RawMaterial> findByName(String name);
    boolean existsByMaterialCategory_Id(Long categoryId);
    Optional<RawMaterial> findBySku(String sku);
    java.util.List<RawMaterial> findByMaterialCategory_Id(Long categoryId);
}
