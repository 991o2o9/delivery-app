package com.amin.deliverysystem.dto;

import java.util.UUID;

public class JwtResponse {
    private String token;
    private String email;
    private String role;
    private UUID id;

    public JwtResponse(String token, String email, String role, UUID id) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }
}
