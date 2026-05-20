package com.amin.deliverysystem.dto;

import com.amin.deliverysystem.model.enums.ApplicationStatus;
import java.time.LocalDateTime;

public class CourierApplicationResponse {
    private Long id;
    private String userEmail;
    private ApplicationStatus status;
    private String message;
    private LocalDateTime createdAt;

    public CourierApplicationResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
