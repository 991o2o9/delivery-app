package com.amin.deliverysystem.controller;

import com.amin.deliverysystem.config.security.UserDetailsImpl;
import com.amin.deliverysystem.dto.AvailableOrderResponseDto;
import com.amin.deliverysystem.dto.OrderRequestDto;
import com.amin.deliverysystem.dto.OrderResponseDto;
import com.amin.deliverysystem.dto.ReviewRequestDto;
import com.amin.deliverysystem.model.enums.OrderStatus;
import com.amin.deliverysystem.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Endpoints for order management")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Create a new delivery order", description = "Allowed for CLIENT and ADMIN roles")
    @ApiResponse(responseCode = "200", description = "Order created successfully")
    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<OrderResponseDto> createOrder(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                       @Valid @RequestBody OrderRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(userDetails.getId(), request));
    }

    @Operation(summary = "Get order details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrderDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderDetails(id));
    }

    @Operation(summary = "List current client's orders (Paginated)")
    @GetMapping("/my")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Page<OrderResponseDto>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getMyOrders(userDetails.getId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @Operation(summary = "List available orders for couriers", description = "Sorted by proximity to courier's coordinates")
    @GetMapping("/available")
    @PreAuthorize("hasRole('COURIER')")
    public ResponseEntity<List<AvailableOrderResponseDto>> getAvailableOrders(@RequestParam Double lat, @RequestParam Double lon) {
        return ResponseEntity.ok(orderService.getAvailableOrdersForCourier(lat, lon));
    }

    @Operation(summary = "Accept an available order")
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('COURIER')")
    public ResponseEntity<OrderResponseDto> acceptOrder(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.acceptOrder(id, userDetails.getId()));
    }

    @Operation(summary = "Get courier's current active order")
    @GetMapping("/courier/active")
    @PreAuthorize("hasRole('COURIER')")
    public ResponseEntity<OrderResponseDto> getActiveOrder(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        OrderResponseDto activeOrder = orderService.getActiveCourierOrder(userDetails.getId());
        if (activeOrder == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(activeOrder);
    }

    @Operation(summary = "Update status to PICKED_UP", description = "Must be in ASSIGNED status")
    @PatchMapping("/{id}/pickup")
    @PreAuthorize("hasRole('COURIER')")
    public ResponseEntity<OrderResponseDto> pickupOrder(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, OrderStatus.PICKED_UP, userDetails.getId()));
    }

    @Operation(summary = "Update status to IN_TRANSIT", description = "Must be in PICKED_UP status")
    @PatchMapping("/{id}/start-transit")
    @PreAuthorize("hasRole('COURIER')")
    public ResponseEntity<OrderResponseDto> startTransit(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, OrderStatus.IN_TRANSIT, userDetails.getId()));
    }

    @Operation(summary = "Update status to DELIVERED", description = "Must be in IN_TRANSIT status")
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('COURIER')")
    public ResponseEntity<OrderResponseDto> completeDelivery(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, OrderStatus.DELIVERED, userDetails.getId()));
    }

    @Operation(summary = "List courier's past orders (Paginated)")
    @GetMapping("/courier/history")
    @PreAuthorize("hasRole('COURIER')")
    public ResponseEntity<Page<OrderResponseDto>> getCourierHistory(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getCourierOrderHistory(userDetails.getId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }
    @Operation(summary = "Cancel an order as a courier")
    @PatchMapping("/{id}/cancel-courier")
    @PreAuthorize("hasRole('COURIER')")
    public ResponseEntity<OrderResponseDto> cancelOrderByCourier(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.cancelOrderByCourier(id, userDetails.getId()));
    }

    @Operation(summary = "Cancel an order as a client")
    @PatchMapping("/{id}/cancel-client")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<OrderResponseDto> cancelOrderByClient(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.cancelOrderByClient(id, userDetails.getId()));
    }

    @Operation(summary = "Leave a review for a delivered order")
    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<OrderResponseDto> leaveReview(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ReviewRequestDto request) {
        return ResponseEntity.ok(orderService.leaveReview(id, userDetails.getId(), request));
    }
}
