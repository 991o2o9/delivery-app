package com.amin.deliverysystem.dto;

import jakarta.validation.constraints.NotBlank;

public class CourierApplicationRequest {
    @NotBlank
    private String message;

    public CourierApplicationRequest() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
