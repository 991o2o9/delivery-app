package com.amin.deliverysystem.controller;

import com.amin.deliverysystem.dto.CourierApplicationRequest;
import com.amin.deliverysystem.dto.CourierApplicationResponse;
import com.amin.deliverysystem.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications", description = "Endpoints for courier role applications")
@SecurityRequirement(name = "bearerAuth")
public class ApplicationController {
    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @Operation(summary = "Submit an application for COURIER role")
    @PostMapping("/apply/{userId}")
    public ResponseEntity<CourierApplicationResponse> apply(@PathVariable UUID userId, @Valid @RequestBody CourierApplicationRequest request) {
        return ResponseEntity.ok(applicationService.applyForCourier(userId, request));
    }
}
