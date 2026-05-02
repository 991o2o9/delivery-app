package com.amin.deliverysystem.service;

import com.amin.deliverysystem.dto.CourierApplicationRequest;
import com.amin.deliverysystem.dto.CourierApplicationResponse;
import com.amin.deliverysystem.exception.ResourceNotFoundException;
import com.amin.deliverysystem.mapper.ApplicationMapper;
import com.amin.deliverysystem.model.ApplicationStatus;
import com.amin.deliverysystem.model.CourierApplication;
import com.amin.deliverysystem.model.User;
import com.amin.deliverysystem.repository.CourierApplicationRepository;
import com.amin.deliverysystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ApplicationService {
    private final CourierApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public ApplicationService(CourierApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CourierApplicationResponse applyForCourier(UUID userId, CourierApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        CourierApplication application = new CourierApplication();
        application.setUser(user);
        application.setMessage(request.getMessage());
        application.setStatus(ApplicationStatus.PENDING);
        application.setCreatedAt(LocalDateTime.now());

        CourierApplication savedApplication = applicationRepository.save(application);
        return ApplicationMapper.toDto(savedApplication);
    }
}
