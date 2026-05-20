package com.amin.deliverysystem.controller;

import com.amin.deliverysystem.dto.CalculationResultDto;
import com.amin.deliverysystem.dto.DistanceResponseDto;
import com.amin.deliverysystem.service.GoogleMapsService;
import com.amin.deliverysystem.service.PricingService;
import com.amin.deliverysystem.dto.PreviewRequestDto;
import jakarta.validation.Valid;
import com.amin.deliverysystem.model.enums.Urgency;
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
    private final PricingService pricingService;

    public InternalToolsController(GoogleMapsService googleMapsService, PricingService pricingService) {
        this.googleMapsService = googleMapsService;
        this.pricingService = pricingService;
    }

    @Operation(summary = "Preview delivery price and arrival time", description = "Admin only tool for testing logic")
    @PostMapping("/calculate-preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CalculationResultDto> calculatePreview(@Valid @RequestBody PreviewRequestDto request) {
        DistanceResponseDto distanceResponse = googleMapsService.getDistanceAndDuration(
                request.originLat(), request.originLon(), request.destLat(), request.destLon()
        );
        
        Double price = pricingService.calculatePrice(distanceResponse.getDistanceKm(), 1.0, Urgency.STANDARD);
        var arrivalTime = pricingService.calculateEstimatedArrivalTime(distanceResponse.getDurationMinutes());

        CalculationResultDto result = new CalculationResultDto(
                distanceResponse.getDistanceKm(),
                price,
                arrivalTime
        );

        return ResponseEntity.ok(result);
    }
}
