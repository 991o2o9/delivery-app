package com.amin.deliverysystem.mapper;

import com.amin.deliverysystem.dto.UserRegistrationRequest;
import com.amin.deliverysystem.dto.UserResponseDto;
import com.amin.deliverysystem.model.User;
import com.amin.deliverysystem.model.enums.UserRole;

public class UserMapper {

    public static User toEntity(UserRegistrationRequest request) {
        if (request == null) return null;
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(UserRole.CLIENT);
        user.setRating(0.0);
        user.setReviewsCount(0);
        return user;
    }

    public static UserResponseDto toDto(User user) {
        if (user == null) return null;
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setRating(user.getRating());
        dto.setDefaultAddress(user.getDefaultAddress());
        return dto;
    }
}
