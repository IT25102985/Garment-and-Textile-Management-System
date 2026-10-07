package com.stitchworks.production.repository;

import com.stitchworks.production.model.QualityControlLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QualityControlLogRepository extends JpaRepository<QualityControlLog, Long> {
}
