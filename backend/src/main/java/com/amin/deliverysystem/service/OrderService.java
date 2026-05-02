package com.amin.deliverysystem.service;

import com.amin.deliverysystem.dto.AvailableOrderResponseDto;
import com.amin.deliverysystem.dto.DistanceResponseDto;
import com.amin.deliverysystem.dto.OrderRequestDto;
import com.amin.deliverysystem.dto.OrderResponseDto;
import com.amin.deliverysystem.exception.CourierAlreadyHasActiveOrderException;
import com.amin.deliverysystem.exception.IllegalStatusTransitionException;
import com.amin.deliverysystem.exception.ResourceNotFoundException;
import com.amin.deliverysystem.mapper.OrderMapper;
import com.amin.deliverysystem.model.DeliveryStatusHistory;
import com.amin.deliverysystem.model.Order;
import com.amin.deliverysystem.model.OrderStatus;
import com.amin.deliverysystem.model.User;
import com.amin.deliverysystem.repository.DeliveryStatusHistoryRepository;
import com.amin.deliverysystem.repository.OrderRepository;
import com.amin.deliverysystem.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DeliveryStatusHistoryRepository historyRepository;
    private final GoogleMapsService googleMapsService;
    private final PricingService pricingService;
    private final PriceCalculationService arrivalTimeService;

    private static final List<OrderStatus> ACTIVE_STATUSES = Arrays.asList(
            OrderStatus.ASSIGNED, 
            OrderStatus.PICKED_UP, 
            OrderStatus.IN_TRANSIT
    );

    public OrderService(OrderRepository orderRepository, UserRepository userRepository,
                        DeliveryStatusHistoryRepository historyRepository,
                        GoogleMapsService googleMapsService,
                        PricingService pricingService,
                        PriceCalculationService arrivalTimeService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.googleMapsService = googleMapsService;
        this.pricingService = pricingService;
        this.arrivalTimeService = arrivalTimeService;
    }

    @Transactional
    public OrderResponseDto createOrder(UUID clientId, OrderRequestDto request) {
        logger.info("Creating new order for client: {}", clientId);
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        DistanceResponseDto distanceResponse = googleMapsService.getDistanceAndDuration(
                request.getPickupLat(), request.getPickupLon(),
                request.getDestLat(), request.getDestLon()
        );

        Order order = OrderMapper.toEntity(request);
        order.setClient(client);
        order.setDistanceKm(distanceResponse.getDistanceKm());
        
        Double calculatedPrice = pricingService.calculatePrice(
                distanceResponse.getDistanceKm(), 
                order.getWeight(), 
                order.getUrgency()
        );
        order.setPrice(calculatedPrice);
        order.setEstimatedArrivalTime(arrivalTimeService.calculateEstimatedArrivalTime(distanceResponse.getDurationMinutes()));
        
        Order savedOrder = orderRepository.save(order);

        historyRepository.save(new DeliveryStatusHistory(savedOrder, OrderStatus.CREATED, LocalDateTime.now()));
        logger.info("Order created with ID: {}", savedOrder.getId());

        return OrderMapper.toDto(savedOrder);
    }

    public List<AvailableOrderResponseDto> getAvailableOrdersForCourier(Double courierLat, Double courierLon) {
        List<Order> availableOrders = orderRepository.findByStatus(OrderStatus.CREATED);

        return availableOrders.stream()
                .map(order -> {
                    Double distance = calculateHaversineDistance(courierLat, courierLon, order.getPickupLat(), order.getPickupLon());
                    return OrderMapper.toAvailableDto(order, distance);
                })
                .sorted(Comparator.comparing(AvailableOrderResponseDto::getDistanceFromYou))
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponseDto acceptOrder(UUID orderId, UUID courierId) {
        logger.info("Courier {} attempting to accept order {}", courierId, orderId);
        if (orderRepository.existsByCourierIdAndStatusIn(courierId, ACTIVE_STATUSES)) {
            logger.warn("Courier {} already has an active order", courierId);
            throw new CourierAlreadyHasActiveOrderException("You already have an active delivery in progress.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.CREATED) {
            throw new RuntimeException("Order is no longer available for acceptance");
        }

        User courier = userRepository.findById(courierId)
                .orElseThrow(() -> new ResourceNotFoundException("Courier not found"));

        order.setCourier(courier);
        order.setStatus(OrderStatus.ASSIGNED);
        
        Order savedOrder = orderRepository.save(order);
        historyRepository.save(new DeliveryStatusHistory(savedOrder, OrderStatus.ASSIGNED, LocalDateTime.now()));
        logger.info("Order {} accepted by courier {}", orderId, courierId);

        return OrderMapper.toDto(savedOrder);
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(UUID orderId, OrderStatus newStatus, UUID currentUserId) {
        logger.info("Updating order {} status to {} by user {}", orderId, newStatus, currentUserId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getCourier() == null || !order.getCourier().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not the assigned courier for this order.");
        }

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        
        historyRepository.save(new DeliveryStatusHistory(savedOrder, newStatus, LocalDateTime.now()));
        
        List<DeliveryStatusHistory> history = historyRepository.findByOrderOrderByChangedAtDesc(savedOrder);
        return OrderMapper.toDto(savedOrder, history);
    }

    public OrderResponseDto getActiveCourierOrder(UUID courierId) {
        logger.info("Fetching active order for courier: {}", courierId);
        Order order = orderRepository.findFirstByCourierIdAndStatusInOrderByCreatedAtDesc(courierId, ACTIVE_STATUSES)
                .orElseThrow(() -> new ResourceNotFoundException("No active order found for this courier."));
        
        List<DeliveryStatusHistory> history = historyRepository.findByOrderOrderByChangedAtDesc(order);
        return OrderMapper.toDto(order, history);
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        boolean valid = switch (newStatus) {
            case PICKED_UP -> currentStatus == OrderStatus.ASSIGNED;
            case IN_TRANSIT -> currentStatus == OrderStatus.PICKED_UP;
            case DELIVERED -> currentStatus == OrderStatus.IN_TRANSIT;
            case CANCELLED -> currentStatus != OrderStatus.DELIVERED;
            default -> false;
        };

        if (!valid) {
            logger.warn("Invalid status transition from {} to {}", currentStatus, newStatus);
            throw new IllegalStatusTransitionException("You cannot transition from " + currentStatus + " to " + newStatus);
        }
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public OrderResponseDto getOrderDetails(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        List<DeliveryStatusHistory> history = historyRepository.findByOrderOrderByChangedAtDesc(order);
        return OrderMapper.toDto(order, history);
    }

    public Page<OrderResponseDto> getMyOrders(UUID clientId, Pageable pageable) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        return orderRepository.findByClient(client, pageable)
                .map(order -> {
                    List<DeliveryStatusHistory> history = historyRepository.findByOrderOrderByChangedAtDesc(order);
                    return OrderMapper.toDto(order, history);
                });
    }
}
