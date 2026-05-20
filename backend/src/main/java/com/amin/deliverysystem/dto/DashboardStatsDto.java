package com.amin.deliverysystem.dto;

import com.amin.deliverysystem.model.enums.OrderStatus;
import java.util.Map;

public class DashboardStatsDto {
    private Double totalRevenue;
    private Long totalOrders;
    private Long activeCouriers;
    private Map<OrderStatus, Long> ordersByStatus;
    private Double averageDeliveryTimeMinutes;

    public DashboardStatsDto() {
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getActiveCouriers() {
        return activeCouriers;
    }

    public void setActiveCouriers(Long activeCouriers) {
        this.activeCouriers = activeCouriers;
    }

    public Map<OrderStatus, Long> getOrdersByStatus() {
        return ordersByStatus;
    }

    public void setOrdersByStatus(Map<OrderStatus, Long> ordersByStatus) {
        this.ordersByStatus = ordersByStatus;
    }

    public Double getAverageDeliveryTimeMinutes() {
        return averageDeliveryTimeMinutes;
    }

    public void setAverageDeliveryTimeMinutes(Double averageDeliveryTimeMinutes) {
        this.averageDeliveryTimeMinutes = averageDeliveryTimeMinutes;
    }
}
