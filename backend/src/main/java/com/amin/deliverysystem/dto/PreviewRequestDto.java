package com.amin.deliverysystem.dto;

import jakarta.validation.constraints.NotNull;

public record PreviewRequestDto(
        @NotNull(message = "originLat is required") Double originLat,
        @NotNull(message = "originLon is required") Double originLon,
        @NotNull(message = "destLat is required") Double destLat,
        @NotNull(message = "destLon is required") Double destLon
) {}
