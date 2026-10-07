package com.stitchworks.production.repository;

import com.stitchworks.production.model.ProductionTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductionTaskRepository extends JpaRepository<ProductionTask, Long> {
}
