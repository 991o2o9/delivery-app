package com.amin.deliverysystem.mapper;

import com.amin.deliverysystem.dto.CourierApplicationResponse;
import com.amin.deliverysystem.model.CourierApplication;

public class ApplicationMapper {

    public static CourierApplicationResponse toDto(CourierApplication application) {
        if (application == null) return null;
        CourierApplicationResponse dto = new CourierApplicationResponse();
        dto.setId(application.getId());
        dto.setUserEmail(application.getUser().getEmail());
        dto.setStatus(application.getStatus());
        dto.setMessage(application.getMessage());
        dto.setCreatedAt(application.getCreatedAt());
        return dto;
    }
}
