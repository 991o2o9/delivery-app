package com.amin.deliverysystem.exception;

public class CourierAlreadyHasActiveOrderException extends RuntimeException {
    public CourierAlreadyHasActiveOrderException(String message) {
        super(message);
    }
}
