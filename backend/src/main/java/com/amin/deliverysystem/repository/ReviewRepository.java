package com.amin.deliverysystem.repository;

import com.amin.deliverysystem.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    boolean existsByOrderId(UUID orderId);
    
    java.util.List<Review> findByCourierIdOrderByCreatedAtDesc(UUID courierId);
}
