import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; cpf: string } | null;
  login: (name: string, cpf: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (name, cpf) => set({ isAuthenticated: true, user: { name, cpf } }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
