package com.amin.deliverysystem.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PriceCalculationService {

    @Value("${app.delivery.base-price}")
    private Double basePrice;

    @Value("${app.delivery.price-per-km}")
    private Double pricePerKm;

    private static final int PICKUP_BUFFER_MINUTES = 10;

    public Double calculatePrice(Double distanceKm) {
        return basePrice + (distanceKm * pricePerKm);
    }

    public LocalDateTime calculateEstimatedArrivalTime(Integer durationMinutes) {
        return LocalDateTime.now().plusMinutes(durationMinutes + PICKUP_BUFFER_MINUTES);
    }
}
