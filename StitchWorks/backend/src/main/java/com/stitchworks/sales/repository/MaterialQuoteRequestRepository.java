package com.stitchworks.sales.repository;

import com.stitchworks.sales.model.MaterialQuoteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialQuoteRequestRepository extends JpaRepository<MaterialQuoteRequest, Long> {
    List<MaterialQuoteRequest> findByCustomerId(Long customerId);
}
