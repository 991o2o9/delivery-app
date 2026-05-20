package com.amin.deliverysystem.repository;

import com.amin.deliverysystem.model.enums.ApplicationStatus;
import com.amin.deliverysystem.model.CourierApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourierApplicationRepository extends JpaRepository<CourierApplication, Long> {
    List<CourierApplication> findByStatus(ApplicationStatus status);
}
