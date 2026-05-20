import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/base';
import type { AvailableOrderResponseDto, OrderResponseDto, Page } from '../../../shared/api/types';

export const useAvailableOrders = (lat: number | undefined, lon: number | undefined) => {
  return useQuery({
    queryKey: ['orders', 'available', lat, lon],
    queryFn: async () => {
      const response = await api.get<AvailableOrderResponseDto[]>('/api/orders/available', {
        params: { lat, lon },
      });
      return response.data;
    },
    enabled: !!lat && !!lon,
  });
};

export const useCurrentActiveOrder = () => {
  return useQuery({
    queryKey: ['orders', 'active'],
    queryFn: async () => {
      const response = await api.get<OrderResponseDto | null>('/api/orders/courier/active');
      return response.data;
    },
  });
};

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/orders/${id}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const usePickupOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/orders/${id}/pickup`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useInTransitOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/orders/${id}/start-transit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/orders/${id}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCourierHistory = (page: number, size: number) => {
  return useQuery({
    queryKey: ['orders', 'courier', 'history', page, size],
    queryFn: async () => {
      const response = await api.get<Page<OrderResponseDto>>('/api/orders/courier/history', {
        params: { page, size },
      });
      return response.data;
    },
  });
};
