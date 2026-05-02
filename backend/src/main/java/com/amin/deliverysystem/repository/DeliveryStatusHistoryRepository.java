package com.amin.deliverysystem.repository;

import com.amin.deliverysystem.model.DeliveryStatusHistory;
import com.amin.deliverysystem.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeliveryStatusHistoryRepository extends JpaRepository<DeliveryStatusHistory, Long> {
    List<DeliveryStatusHistory> findByOrderOrderByChangedAtDesc(Order order);
}
