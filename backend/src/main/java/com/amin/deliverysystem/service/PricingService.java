package com.amin.deliverysystem.service;

import com.amin.deliverysystem.model.Urgency;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PricingService {

    @Value("${app.delivery.base-price}")
    private Double basePrice;

    @Value("${app.delivery.price-per-km}")
    private Double pricePerKm;

    @Value("${app.delivery.price-per-kg}")
    private Double pricePerKg;

    @Value("${app.delivery.urgency-multiplier}")
    private Double urgencyMultiplier;

    public Double calculatePrice(Double distanceKm, Double weightKg, Urgency urgency) {
        Double multiplier = (urgency == Urgency.EXPRESS) ? urgencyMultiplier : 1.0;
        Double price = (basePrice + (distanceKm * pricePerKm)) * multiplier + (weightKg * pricePerKg);
        return Math.round(price * 100.0) / 100.0; // Round to 2 decimal places
    }
}
