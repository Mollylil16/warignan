import { create } from 'zustand';

export type AppRole = 'client' | 'vendeuse' | 'admin' | 'livreur' | null;

interface AuthState {
  /** À brancher sur JWT / session backend. */
  token: string | null;
  role: AppRole;
  setDemoRole: (role: AppRole) => void;
  clearSession: () => void;
}

/**
 * Auth minimal pour la démo UI. Remplacer par login réel + persistance sécurisée avec l’API.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  setDemoRole: (role) => set({ role }),
  clearSession: () => set({ token: null, role: null }),
}));
