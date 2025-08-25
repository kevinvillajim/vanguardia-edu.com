import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse, LoginCredentials, CreateUserData } from '../../domain/entities/User';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { LoginUseCase } from '../../application/auth/LoginUseCase';
import { RegisterUseCase } from '../../application/auth/RegisterUseCase';
import { LogoutUseCase } from '../../application/auth/LogoutUseCase';
import { STORAGE_KEYS } from '../constants';
import { UserRole } from '../types';
import { logger } from '../utils/logger';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: CreateUserData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Temporary mock login for testing
  mockTeacherLogin: () => void;
  
  // Internal actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

// Initialize repositories and use cases
const userRepository = new UserRepository();
const loginUseCase = new LoginUseCase(userRepository);
const registerUseCase = new RegisterUseCase(userRepository);
const logoutUseCase = new LogoutUseCase(userRepository);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await loginUseCase.execute(credentials);
          
          if (response.user && (response.token || response.access_token)) {
            const token = response.access_token || response.token!;
            get().setAuth(response.user, token);
          }
          
          return response;
        } catch (error: any) {
          set({ error: error.message || 'Error al iniciar sesión' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData: CreateUserData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await registerUseCase.execute(userData);
          
          if (response.user && (response.token || response.access_token)) {
            const token = response.access_token || response.token!;
            get().setAuth(response.user, token);
          }
          
          return response;
        } catch (error: any) {
          set({ error: error.message || 'Error al registrarse' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await logoutUseCase.execute();
        } catch (error) {
          console.warn('Error during logout:', error);
        } finally {
          get().clearAuth();
          set({ isLoading: false });
        }
      },

      refreshUser: async () => {
        try {
          const { token } = get();
          if (!token) {
            console.warn('No token available for refresh');
            get().clearAuth();
            return;
          }

          // No verificar validez del token aquí, dejar que el ApiClient maneje la renovación
          set({ isLoading: true, error: null });
          
          // Intentar obtener información actualizada del usuario
          const user = await userRepository.getCurrentUser();
          set({ user, error: null });
          
          logger.auth('✅ User refreshed successfully');
        } catch (error: any) {
          console.error('❌ Error refreshing user:', error);
          
          // Solo limpiar auth si el error es de autenticación, no de red
          if (error.status === 401 || error.message?.includes('token') || error.message?.includes('expired')) {
            logger.auth('🔒 Token expired or invalid, clearing auth');
            get().clearAuth();
            set({ error: error.message || 'Sesión expirada' });
          } else {
            // Error de red u otro, mantener sesión pero mostrar error
            set({ error: 'Error de conexión. Reintentando...' });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Temporary mock login for testing
      mockTeacherLogin: () => {
        const mockUser: User = {
          id: 1,
          name: 'Profesor Test',
          email: 'profesor@test.com',
          role: UserRole.TEACHER,
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const mockToken = 'mock-teacher-token-123';
        
        get().setAuth(mockUser, mockToken);
      },

      // Internal actions
      setAuth: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Validate token on rehydration
        if (state?.token && !userRepository.checkTokenValidity(state.token)) {
          state.clearAuth();
        }
      },
    }
  )
);