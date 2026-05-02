package com.amin.deliverysystem.controller;

import com.amin.deliverysystem.config.UserDetailsImpl;
import com.amin.deliverysystem.dto.UserProfileUpdateDto;
import com.amin.deliverysystem.dto.UserResponseDto;
import com.amin.deliverysystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for user profile management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get user profile by ID")
    @GetMapping("/profile/{id}")
    public ResponseEntity<UserResponseDto> getProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @Operation(summary = "Update user profile", description = "User can only update their own profile")
    @PutMapping("/profile/{id}")
    public ResponseEntity<UserResponseDto> updateProfile(
            @PathVariable UUID id,
            @RequestBody UserProfileUpdateDto updateDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        // Security Check: User can only edit their own profile or must be ADMIN
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!userDetails.getId().equals(id) && !isAdmin) {
            throw new AccessDeniedException("You can only update your own profile.");
        }

        return ResponseEntity.ok(userService.updateProfile(id, updateDto));
    }
}
