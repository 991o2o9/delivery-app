package com.amin.deliverysystem.mapper;

import com.amin.deliverysystem.dto.AvailableOrderResponseDto;
import com.amin.deliverysystem.dto.OrderRequestDto;
import com.amin.deliverysystem.dto.OrderResponseDto;
import com.amin.deliverysystem.dto.StatusHistoryDto;
import com.amin.deliverysystem.model.DeliveryStatusHistory;
import com.amin.deliverysystem.model.Order;
import com.amin.deliverysystem.model.OrderStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    public static Order toEntity(OrderRequestDto dto) {
        if (dto == null) return null;
        Order order = new Order();
        order.setPickupAddress(dto.getPickupAddress());
        order.setDestinationAddress(dto.getDestinationAddress());
        order.setPickupLat(dto.getPickupLat());
        order.setPickupLon(dto.getPickupLon());
        order.setDestLat(dto.getDestLat());
        order.setDestLon(dto.getDestLon());
        order.setStatus(OrderStatus.CREATED);
        order.setCreatedAt(LocalDateTime.now());

        // New fields with null checks and defaults
        if (dto.getCargoType() != null) order.setCargoType(dto.getCargoType());
        if (dto.getWeight() != null) order.setWeight(dto.getWeight());
        if (dto.getDescription() != null) order.setDescription(dto.getDescription());
        if (dto.getSenderPhone() != null) order.setSenderPhone(dto.getSenderPhone());
        if (dto.getReceiverName() != null) order.setReceiverName(dto.getReceiverName());
        if (dto.getReceiverPhone() != null) order.setReceiverPhone(dto.getReceiverPhone());
        if (dto.getPickupComment() != null) order.setPickupComment(dto.getPickupComment());
        if (dto.getDeliveryComment() != null) order.setDeliveryComment(dto.getDeliveryComment());
        if (dto.getUrgency() != null) order.setUrgency(dto.getUrgency());
        if (dto.getPaymentMethod() != null) order.setPaymentMethod(dto.getPaymentMethod());

        return order;
    }

    public static OrderResponseDto toDto(Order order) {
        return toDto(order, null);
    }

    public static OrderResponseDto toDto(Order order, List<DeliveryStatusHistory> history) {
        if (order == null) return null;
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setClientEmail(order.getClient().getEmail());
        if (order.getCourier() != null) {
            dto.setCourierEmail(order.getCourier().getEmail());
        }
        dto.setStatus(order.getStatus());
        dto.setPickupAddress(order.getPickupAddress());
        dto.setDestinationAddress(order.getDestinationAddress());
        dto.setPickupLat(order.getPickupLat());
        dto.setPickupLon(order.getPickupLon());
        dto.setDestLat(order.getDestLat());
        dto.setDestLon(order.getDestLon());
        dto.setDistanceKm(order.getDistanceKm());
        dto.setPrice(order.getPrice());
        dto.setEstimatedArrivalTime(order.getEstimatedArrivalTime());
        dto.setCreatedAt(order.getCreatedAt());

        // Expanded fields
        dto.setCargoType(order.getCargoType());
        dto.setWeight(order.getWeight());
        dto.setDescription(order.getDescription());
        dto.setSenderPhone(order.getSenderPhone());
        dto.setReceiverName(order.getReceiverName());
        dto.setReceiverPhone(order.getReceiverPhone());
        dto.setPickupComment(order.getPickupComment());
        dto.setDeliveryComment(order.getDeliveryComment());
        dto.setUrgency(order.getUrgency());
        dto.setPaymentMethod(order.getPaymentMethod());

        if (history != null) {
            dto.setHistory(history.stream()
                    .map(h -> new StatusHistoryDto(h.getStatus(), h.getChangedAt()))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public static AvailableOrderResponseDto toAvailableDto(Order order, Double distanceFromYou) {
        if (order == null) return null;
        AvailableOrderResponseDto dto = new AvailableOrderResponseDto();
        dto.setId(order.getId());
        dto.setClientEmail(order.getClient().getEmail());
        dto.setStatus(order.getStatus());
        dto.setPickupAddress(order.getPickupAddress());
        dto.setDestinationAddress(order.getDestinationAddress());
        dto.setPickupLat(order.getPickupLat());
        dto.setPickupLon(order.getPickupLon());
        dto.setDestLat(order.getDestLat());
        dto.setDestLon(order.getDestLon());
        dto.setDistanceKm(order.getDistanceKm());
        dto.setPrice(order.getPrice());
        dto.setEstimatedArrivalTime(order.getEstimatedArrivalTime());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setCargoType(order.getCargoType());
        dto.setWeight(order.getWeight());
        dto.setReceiverName(order.getReceiverName());
        dto.setUrgency(order.getUrgency());
        dto.setPaymentMethod(order.getPaymentMethod());
        
        dto.setDistanceFromYou(Math.round(distanceFromYou * 100.0) / 100.0);
        
        return dto;
    }
}
