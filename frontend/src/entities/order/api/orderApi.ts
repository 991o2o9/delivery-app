import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/base';
import type { OrderRequestDto, OrderResponseDto, Page, ReviewRequest } from '../../../shared/api/types';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: OrderRequestDto) => {
      const response = await api.post<OrderResponseDto>('/api/orders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
    },
  });
};

export const useMyOrders = (page: number, size: number) => {
  return useQuery({
    queryKey: ['orders', 'my', page, size],
    queryFn: async () => {
      const response = await api.get<Page<OrderResponseDto>>('/api/orders/my', {
        params: { page, size },
      });
      return response.data;
    },
  });
};

export const useOrderDetails = (id: string | undefined) => {
  return useQuery({
    queryKey: ['orders', 'details', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<OrderResponseDto>(`/api/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const usePickupOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/orders/${id}/pickup`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'details', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
    },
  });
};

export const useStartTransitOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/orders/${id}/start-transit`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'details', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
    },
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/orders/${id}/complete`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'details', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
    },
  });
};
export const useCancelOrderCourier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/orders/${id}/cancel-courier`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'details', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'available'] });
    },
  });
};

export const useCancelOrderClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/orders/${id}/cancel-client`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'details', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
    },
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReviewRequest }) => {
      const response = await api.post<OrderResponseDto>(`/api/orders/${id}/review`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'details', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
    },
  });
};
