package com.amin.deliverysystem.repository;

import com.amin.deliverysystem.model.Order;
import com.amin.deliverysystem.model.OrderStatus;
import com.amin.deliverysystem.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByClient(User client, Pageable pageable);
    List<Order> findByStatus(OrderStatus status);
    boolean existsByCourierIdAndStatusIn(UUID courierId, List<OrderStatus> activeStatuses);
    Optional<Order> findFirstByCourierIdAndStatusInOrderByCreatedAtDesc(UUID courierId, List<OrderStatus> activeStatuses);
    
    @Query("SELECT SUM(o.price) FROM Order o WHERE o.status = 'DELIVERED'")
    Double calculateTotalRevenue();
    
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.courier.id = :courierId AND o.status = 'DELIVERED'")
    Long countCompletedOrdersByCourier(@Param("courierId") UUID courierId);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (h.changed_at - o.created_at)) / 60) " +
           "FROM orders o JOIN delivery_status_history h ON o.id = h.order_id " +
           "WHERE o.status = 'DELIVERED' AND h.status = 'DELIVERED'", nativeQuery = true)
    Double calculateAverageDeliveryTimeMinutes();
}
