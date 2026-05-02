package com.amin.deliverysystem.dto;

import com.amin.deliverysystem.model.OrderStatus;
import java.time.LocalDateTime;

public class StatusHistoryDto {
    private OrderStatus status;
    private LocalDateTime changedAt;

    public StatusHistoryDto() {
    }

    public StatusHistoryDto(OrderStatus status, LocalDateTime changedAt) {
        this.status = status;
        this.changedAt = changedAt;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}
