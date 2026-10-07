package com.stitchworks.sales.repository;

import com.stitchworks.sales.model.SalesOrder;
import com.stitchworks.sales.model.SalesOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesOrderItemRepository extends JpaRepository<SalesOrderItem, Long> {
    List<SalesOrderItem> findBySalesOrder(SalesOrder salesOrder);
}
