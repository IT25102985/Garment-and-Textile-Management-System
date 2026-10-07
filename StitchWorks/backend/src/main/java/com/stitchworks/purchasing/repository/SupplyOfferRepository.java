package com.stitchworks.purchasing.repository;

import com.stitchworks.purchasing.model.SupplyOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyOfferRepository extends JpaRepository<SupplyOffer, Long> {
    List<SupplyOffer> findBySupplierId(Long supplierId);
    List<SupplyOffer> findByRequirementId(Long requirementId);
}
