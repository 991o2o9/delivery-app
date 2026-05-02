import { api } from '../../../shared/api/base';
import type { JwtResponse, LoginRequest, UserRegistrationRequest } from '../../../shared/api/types';

export const authService = {
  async login(data: LoginRequest): Promise<JwtResponse> {
    const response = await api.post<JwtResponse>('/api/auth/login', data);
    return response.data;
  },

  async register(data: UserRegistrationRequest): Promise<void> {
    await api.post('/api/auth/register', data);
  },
};
