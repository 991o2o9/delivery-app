package com.amin.deliverysystem.init;

import com.amin.deliverysystem.model.User;
import com.amin.deliverysystem.model.enums.UserRole;
import com.amin.deliverysystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.firstName}")
    private String adminFirstName;

    @Value("${app.admin.lastName}")
    private String adminLastName;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setFirstName(adminFirstName);
            admin.setLastName(adminLastName);
            admin.setRole(UserRole.ADMIN);
            admin.setRating(5.0);
            admin.setReviewsCount(0);

            userRepository.save(admin);
            System.out.println("Default Admin user initialized successfully.");
        } else {
            System.out.println("Admin user already exists. Skipping initialization.");
        }
    }
}
