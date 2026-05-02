import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/base';
import type { CourierApplicationDto } from '../../../shared/api/types';

export const useApplyForCourier = () => {
  return useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message: string }) => {
      await api.post(`/api/applications/apply/${userId}`, { message });
    },
  });
};

export const usePendingApplications = () => {
  return useQuery({
    queryKey: ['admin', 'applications', 'pending'],
    queryFn: async () => {
      const response = await api.get<CourierApplicationDto[]>('/api/admin/applications/pending');
      return response.data;
    },
  });
};

export const useApproveApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/admin/applications/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'couriers'] });
    },
  });
};
