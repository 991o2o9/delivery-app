package com.amin.deliverysystem.controller;

import com.amin.deliverysystem.dto.CalculationResultDto;
import com.amin.deliverysystem.dto.DistanceResponseDto;
import com.amin.deliverysystem.service.GoogleMapsService;
import com.amin.deliverysystem.service.PriceCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Tools", description = "Internal tools for calculation preview")
@SecurityRequirement(name = "bearerAuth")
public class InternalToolsController {

    private final GoogleMapsService googleMapsService;
    private final PriceCalculationService priceCalculationService;

    public InternalToolsController(GoogleMapsService googleMapsService, PriceCalculationService priceCalculationService) {
        this.googleMapsService = googleMapsService;
        this.priceCalculationService = priceCalculationService;
    }

    @Operation(summary = "Preview delivery price and arrival time", description = "Admin only tool for testing logic")
    @PostMapping("/calculate-preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CalculationResultDto> calculatePreview(@RequestBody Map<String, Double> coordinates) {
        Double originLat = coordinates.get("originLat");
        Double originLon = coordinates.get("originLon");
        Double destLat = coordinates.get("destLat");
        Double destLon = coordinates.get("destLon");

        DistanceResponseDto distanceResponse = googleMapsService.getDistanceAndDuration(originLat, originLon, destLat, destLon);
        
        Double price = priceCalculationService.calculatePrice(distanceResponse.getDistanceKm());
        var arrivalTime = priceCalculationService.calculateEstimatedArrivalTime(distanceResponse.getDurationMinutes());

        CalculationResultDto result = new CalculationResultDto(
                distanceResponse.getDistanceKm(),
                price,
                arrivalTime
        );

        return ResponseEntity.ok(result);
    }
}
