package com.amin.deliverysystem.controller;

import com.amin.deliverysystem.dto.AdminOrderResponseDto;
import com.amin.deliverysystem.dto.CourierApplicationResponse;
import com.amin.deliverysystem.dto.CourierSummaryDto;
import com.amin.deliverysystem.dto.DashboardStatsDto;
import com.amin.deliverysystem.service.AdminService;
import com.amin.deliverysystem.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Endpoints for administrative tasks and analytics")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {
    private final AdminService adminService;
    private final StatisticsService statisticsService;

    public AdminController(AdminService adminService, StatisticsService statisticsService) {
        this.adminService = adminService;
        this.statisticsService = statisticsService;
    }

    @Operation(summary = "List all pending courier applications")
    @GetMapping("/applications/pending")
    public ResponseEntity<List<CourierApplicationResponse>> getPendingApplications() {
        return ResponseEntity.ok(adminService.getPendingApplications());
    }

    @Operation(summary = "Approve a courier application", description = "Changes user role to COURIER")
    @PostMapping("/applications/{id}/approve")
    public ResponseEntity<CourierApplicationResponse> approveApplication(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveApplication(id));
    }

    @Operation(summary = "Get system-wide summary for dashboard")
    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardStatsDto> getDashboardSummary() {
        return ResponseEntity.ok(statisticsService.getDashboardSummary());
    }

    @Operation(summary = "List all orders in the system (Paginated)")
    @GetMapping("/orders")
    public ResponseEntity<Page<AdminOrderResponseDto>> getAllOrders(Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllOrders(pageable));
    }

    @Operation(summary = "List all couriers with stats")
    @GetMapping("/couriers")
    public ResponseEntity<List<CourierSummaryDto>> getAllCouriers() {
        return ResponseEntity.ok(adminService.getAllCouriers());
    }

    @Operation(summary = "Toggle user active status (Block/Unblock)")
    @PostMapping("/couriers/{id}/block")
    public ResponseEntity<Void> toggleCourierBlock(@PathVariable UUID id) {
        adminService.toggleUserActiveStatus(id);
        return ResponseEntity.ok().build();
    }
}
