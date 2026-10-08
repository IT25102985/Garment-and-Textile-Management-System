package com.stitchworks.product.repository;

import com.stitchworks.product.model.SizeMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SizeMeasurementRepository extends JpaRepository<SizeMeasurement, Long> {
    List<SizeMeasurement> findBySizeId(Long sizeId);

    void deleteBySizeId(Long sizeId);
}
