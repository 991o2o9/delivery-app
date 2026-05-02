package com.amin.deliverysystem.service;

import com.amin.deliverysystem.dto.AdminOrderResponseDto;
import com.amin.deliverysystem.dto.CourierApplicationResponse;
import com.amin.deliverysystem.dto.CourierSummaryDto;
import com.amin.deliverysystem.exception.ResourceNotFoundException;
import com.amin.deliverysystem.mapper.ApplicationMapper;
import com.amin.deliverysystem.model.*;
import com.amin.deliverysystem.repository.CourierApplicationRepository;
import com.amin.deliverysystem.repository.OrderRepository;
import com.amin.deliverysystem.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final CourierApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminService(CourierApplicationRepository applicationRepository, 
                        UserRepository userRepository,
                        OrderRepository orderRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public List<CourierApplicationResponse> getPendingApplications() {
        return applicationRepository.findByStatus(ApplicationStatus.PENDING)
                .stream()
                .map(ApplicationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourierApplicationResponse approveApplication(Long appId) {
        CourierApplication application = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + appId));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Application is already processed");
        }

        application.setStatus(ApplicationStatus.APPROVED);
        User user = application.getUser();
        user.setRole(UserRole.COURIER);
        userRepository.save(user);

        return ApplicationMapper.toDto(applicationRepository.save(application));
    }

    public Page<AdminOrderResponseDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(order -> {
            AdminOrderResponseDto dto = new AdminOrderResponseDto();
            dto.setId(order.getId());
            dto.setClientEmail(order.getClient().getEmail());
            dto.setClientName(order.getClient().getFirstName() + " " + order.getClient().getLastName());
            if (order.getCourier() != null) {
                dto.setCourierEmail(order.getCourier().getEmail());
                dto.setCourierName(order.getCourier().getFirstName() + " " + order.getCourier().getLastName());
            }
            dto.setStatus(order.getStatus());
            dto.setPrice(order.getPrice());
            dto.setCreatedAt(order.getCreatedAt());
            dto.setPickupAddress(order.getPickupAddress());
            dto.setDestinationAddress(order.getDestinationAddress());
            return dto;
        });
    }

    public List<CourierSummaryDto> getAllCouriers() {
        return userRepository.findByRole(UserRole.COURIER).stream()
                .map(courier -> {
                    CourierSummaryDto dto = new CourierSummaryDto();
                    dto.setId(courier.getId());
                    dto.setEmail(courier.getEmail());
                    dto.setFirstName(courier.getFirstName());
                    dto.setLastName(courier.getLastName());
                    dto.setRating(courier.getRating());
                    dto.setActive(courier.isActive());
                    dto.setCompletedOrdersCount(orderRepository.countCompletedOrdersByCourier(courier.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleUserActiveStatus(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }
}
