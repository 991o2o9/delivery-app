package com.amin.deliverysystem.dto;

import com.amin.deliverysystem.model.enums.OrderStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public class AdminOrderResponseDto {
    private UUID id;
    private String clientEmail;
    private String clientName;
    private String courierEmail;
    private String courierName;
    private OrderStatus status;
    private Double price;
    private LocalDateTime createdAt;
    private String pickupAddress;
    private String destinationAddress;

    public AdminOrderResponseDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getCourierEmail() {
        return courierEmail;
    }

    public void setCourierEmail(String courierEmail) {
        this.courierEmail = courierEmail;
    }

    public String getCourierName() {
        return courierName;
    }

    public void setCourierName(String courierName) {
        this.courierName = courierName;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }
}
