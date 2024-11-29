import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/authApi';

interface UserHealthFacility {
  id: number;
  name: string;
  khmerName: string;
  createdAt: string;
  updatedAt: string;
  sign: boolean;
  p2: boolean;
  p3: boolean;
  nss: boolean;
  exchange: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  hf: UserHealthFacility;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      checkAuth: () => {
        try {
          const isAuthenticated = authApi.isAuthenticated();
          const user = authApi.getCurrentUser();
          if (isAuthenticated && user) {
            set({ isAuthenticated, user });
          } else {
            set({ isAuthenticated: false, user: null });
          }
        } catch (error) {
          set({ isAuthenticated: false, user: null });
        }
      },

      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ identifier, password });
          if (response && response.jwt && response.user) {
            set({ 
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error: any) {
          set({ 
            isLoading: false,
            error: error.message || 'Login failed',
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      logout: () => {
        authApi.logout();
        set({ 
          user: null,
          isAuthenticated: false,
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);