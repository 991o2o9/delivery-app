package com.amin.deliverysystem.service;

import com.amin.deliverysystem.dto.UserProfileUpdateDto;
import com.amin.deliverysystem.dto.UserResponseDto;
import com.amin.deliverysystem.exception.ResourceNotFoundException;
import com.amin.deliverysystem.mapper.UserMapper;
import com.amin.deliverysystem.model.User;
import com.amin.deliverysystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponseDto getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserMapper.toDto(user);
    }

    @Transactional
    public UserResponseDto updateProfile(UUID userId, UserProfileUpdateDto updateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (updateDto.getFirstName() != null) {
            user.setFirstName(updateDto.getFirstName());
        }
        if (updateDto.getLastName() != null) {
            user.setLastName(updateDto.getLastName());
        }
        if (updateDto.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(updateDto.getProfilePictureUrl());
        }
        if (updateDto.getDefaultAddress() != null) {
            user.setDefaultAddress(updateDto.getDefaultAddress());
        }

        User savedUser = userRepository.save(user);
        return UserMapper.toDto(savedUser);
    }
}
