package com.stitchworks.purchasing.repository;

import com.stitchworks.purchasing.model.MaterialRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRequirementRepository extends JpaRepository<MaterialRequirement, Long> {
    List<MaterialRequirement> findByStatus(String status);
}
