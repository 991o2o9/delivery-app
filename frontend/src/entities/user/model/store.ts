import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JwtResponse } from '../../../shared/api/types';

interface UserInfo {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuth: boolean;
  setAuth: (data: JwtResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuth: false,
      setAuth: (data) => {
        localStorage.setItem('token', data.token);
        set({ 
          user: { id: data.id, email: data.email, role: data.role }, 
          token: data.token, 
          isAuth: true 
        });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuth: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
