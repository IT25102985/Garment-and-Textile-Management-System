package com.stitchworks.sales.repository;

import com.stitchworks.sales.model.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    List<SalesOrder> findByCustomerId(Long customerId);
    
    Optional<SalesOrder> findByOrderNumber(String orderNumber);
}
