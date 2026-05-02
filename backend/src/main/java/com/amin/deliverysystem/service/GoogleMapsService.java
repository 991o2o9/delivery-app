package com.amin.deliverysystem.service;

import com.amin.deliverysystem.dto.DistanceResponseDto;
import com.amin.deliverysystem.exception.ExternalApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class GoogleMapsService {

    @Value("${google.maps.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GoogleMapsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public DistanceResponseDto getDistanceAndDuration(Double originLat, Double originLon, Double destLat, Double destLon) {
        String url = UriComponentsBuilder.fromHttpUrl("https://maps.googleapis.com/maps/api/distancematrix/json")
                .queryParam("origins", originLat + "," + originLon)
                .queryParam("destinations", destLat + "," + destLon)
                .queryParam("key", apiKey)
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || !"OK".equals(response.get("status"))) {
            throw new ExternalApiException("Google Maps API error: " + (response != null ? response.get("status") : "No response"));
        }

        List<Map<String, Object>> rows = (List<Map<String, Object>>) response.get("rows");
        if (rows == null || rows.isEmpty()) {
            throw new ExternalApiException("No routes found");
        }

        List<Map<String, Object>> elements = (List<Map<String, Object>>) rows.get(0).get("elements");
        if (elements == null || elements.isEmpty() || !"OK".equals(elements.get(0).get("status"))) {
            throw new ExternalApiException("Route not found between locations");
        }

        Map<String, Object> distanceMap = (Map<String, Object>) elements.get(0).get("distance");
        Map<String, Object> durationMap = (Map<String, Object>) elements.get(0).get("duration");

        Double distanceKm = ((Number) distanceMap.get("value")).doubleValue() / 1000.0;
        Integer durationMinutes = (int) Math.ceil(((Number) durationMap.get("value")).doubleValue() / 60.0);

        return new DistanceResponseDto(distanceKm, durationMinutes);
    }
}
