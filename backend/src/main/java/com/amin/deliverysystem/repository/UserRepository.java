package com.amin.deliverysystem.repository;

import com.amin.deliverysystem.model.User;
import com.amin.deliverysystem.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    long countByRole(UserRole role);
    
    @Modifying
    @Query("UPDATE User u SET u.isActive = :isActive WHERE u.id = :id")
    void setUserActiveStatus(@Param("id") UUID id, @Param("isActive") boolean isActive);
}
