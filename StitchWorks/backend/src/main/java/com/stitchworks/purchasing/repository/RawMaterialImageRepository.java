package com.stitchworks.purchasing.repository;

import com.stitchworks.purchasing.model.RawMaterialImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RawMaterialImageRepository extends JpaRepository<RawMaterialImage, Long> {
}
