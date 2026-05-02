package com.amin.deliverysystem.service;

import com.amin.deliverysystem.dto.DashboardStatsDto;
import com.amin.deliverysystem.model.OrderStatus;
import com.amin.deliverysystem.model.UserRole;
import com.amin.deliverysystem.repository.OrderRepository;
import com.amin.deliverysystem.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatisticsService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public StatisticsService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public DashboardStatsDto getDashboardSummary() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        Double revenue = orderRepository.calculateTotalRevenue();
        stats.setTotalRevenue(revenue != null ? revenue : 0.0);
        
        stats.setTotalOrders(orderRepository.count());
        stats.setActiveCouriers(userRepository.countByRole(UserRole.COURIER));
        
        List<Object[]> statusCounts = orderRepository.countOrdersByStatus();
        Map<OrderStatus, Long> orderMap = new HashMap<>();
        for (Object[] row : statusCounts) {
            orderMap.put((OrderStatus) row[0], (Long) row[1]);
        }
        stats.setOrdersByStatus(orderMap);
        
        Double avgTime = orderRepository.calculateAverageDeliveryTimeMinutes();
        stats.setAverageDeliveryTimeMinutes(avgTime != null ? Math.round(avgTime * 100.0) / 100.0 : 0.0);
        
        return stats;
    }
}
