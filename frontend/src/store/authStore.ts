import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, AUTH_STORAGE_KEY } from '../services/api';

export type AppRole = 'client' | 'vendeuse' | 'admin' | 'livreur';

export type UserBrief = {
  id: string;
  email: string;
  role: AppRole;
  displayName: string;
};

interface AuthState {
  token: string | null;
  user: UserBrief | null;
  login: (email: string, password: string) => Promise<UserBrief>;
  logout: () => void;
  fetchMe: () => Promise<UserBrief | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: async (email, password) => {
        const { data } = await api.post<{ token: string; user: UserBrief }>('/auth/login', {
          email,
          password,
        });
        set({ token: data.token, user: data.user });
        return data.user;
      },

      logout: () => set({ token: null, user: null }),

      fetchMe: async () => {
        const token = get().token;
        if (!token) return null;
        try {
          const { data } = await api.get<UserBrief>('/auth/me');
          set({ user: data });
          return data;
        } catch {
          set({ token: null, user: null });
          return null;
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);
