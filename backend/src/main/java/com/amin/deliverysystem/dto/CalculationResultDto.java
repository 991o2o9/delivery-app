package com.amin.deliverysystem.dto;

import java.time.LocalDateTime;

public class CalculationResultDto {
    private Double distanceKm;
    private Double price;
    private LocalDateTime estimatedArrivalTime;

    public CalculationResultDto() {
    }

    public CalculationResultDto(Double distanceKm, Double price, LocalDateTime estimatedArrivalTime) {
        this.distanceKm = distanceKm;
        this.price = price;
        this.estimatedArrivalTime = estimatedArrivalTime;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public LocalDateTime getEstimatedArrivalTime() {
        return estimatedArrivalTime;
    }

    public void setEstimatedArrivalTime(LocalDateTime estimatedArrivalTime) {
        this.estimatedArrivalTime = estimatedArrivalTime;
    }
}
