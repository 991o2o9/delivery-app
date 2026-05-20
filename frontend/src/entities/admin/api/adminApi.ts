import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/base';
import type { DashboardStatsDto, OrderResponseDto, CourierSummaryDto, Page, ReviewResponseDto } from '../../../shared/api/types';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStatsDto>('/api/admin/dashboard/summary');
      return response.data;
    },
  });
};

export const useAllOrders = (page: number, size: number) => {
  return useQuery({
    queryKey: ['admin', 'orders', page, size],
    queryFn: async () => {
      const response = await api.get<Page<OrderResponseDto>>('/api/admin/orders', {
        params: { page, size },
      });
      return response.data;
    },
  });
};

export const useCouriers = () => {
  return useQuery({
    queryKey: ['admin', 'couriers'],
    queryFn: async () => {
      const response = await api.get<CourierSummaryDto[]>('/api/admin/couriers');
      return response.data;
    },
  });
};

export const useBlockCourier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/admin/couriers/${id}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'couriers'] });
    },
  });
};

export const useCourierReviews = (courierId: string | null) => {
  return useQuery({
    queryKey: ['admin', 'couriers', courierId, 'reviews'],
    queryFn: async () => {
      if (!courierId) return [];
      const response = await api.get<ReviewResponseDto[]>(`/api/admin/couriers/${courierId}/reviews`);
      return response.data;
    },
    enabled: !!courierId,
  });
};
