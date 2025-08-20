import { StateCreator } from 'zustand';
import { 
  User, 
  LoginForm, 
  RegisterForm, 
  ChangePasswordForm, 
  UpdateProfileForm, 
  ApiResponse, 
  AuthResponse 
} from '../../types';
import { authService } from '../../../features/auth/services/authService';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  passwordChangeRequired: boolean;
  lastActivity: number;
}

export interface AuthActions {
  // Actions
  login: (credentials: LoginForm) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterForm) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (data: { email: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: ChangePasswordForm) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: UpdateProfileForm) => Promise<{ success: boolean; error?: string }>;
  initialize: () => Promise<void>;
  checkAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  updateLastActivity: () => void;
}

export interface AuthSlice extends AuthState, AuthActions {}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  passwordChangeRequired: false,
  lastActivity: Date.now(),
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
  // Initial state
  ...initialState,

  // Actions
  login: async (credentials) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        const authData = response.data as AuthResponse;
        
        // Store token
        localStorage.setItem('vanguardia_auth_token', authData.access_token);
        
        set((state) => {
          state.user = authData.user;
          state.token = authData.access_token;
          state.isAuthenticated = true;
          state.passwordChangeRequired = authData.password_change_required;
          state.lastActivity = Date.now();
          state.isLoading = false;
          state.error = null;
        });

        return { success: true };
      } else {
        set((state) => {
          state.isLoading = false;
          state.error = response.message || 'Login failed';
        });
        
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout error (continuing anyway):', error);
    } finally {
      // Clear local storage and state regardless of API response
      localStorage.removeItem('vanguardia_auth_token');
      localStorage.removeItem('vanguardia_user_data');
      
      set(initialState);
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        const authData = response.data as AuthResponse;
        
        // Store token
        localStorage.setItem('vanguardia_auth_token', authData.access_token);
        
        set({
          user: authData.user,
          token: authData.access_token,
          isAuthenticated: true,
          passwordChangeRequired: false, // New registrations don't need password change
          lastActivity: Date.now(),
          isLoading: false,
          error: null,
        });

        return { success: true };
      } else {
        set({
          isLoading: false,
          error: response.message || 'Registration failed',
        });
        
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  changePassword: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.changePassword(data);
      
      if (response.success) {
        set({
          passwordChangeRequired: false,
          isLoading: false,
          error: null,
          lastActivity: Date.now(),
        });

        return { success: true };
      } else {
        set({
          isLoading: false,
          error: response.message || 'Password change failed',
        });
        
        return { success: false, error: response.message || 'Password change failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.updateProfile(data);
      
      if (response.success && response.data) {
        set((state) => ({
          user: { ...state.user, ...response.data.user },
          isLoading: false,
          error: null,
          lastActivity: Date.now(),
        }));

        return { success: true };
      } else {
        set({
          isLoading: false,
          error: response.message || 'Profile update failed',
        });
        
        return { success: false, error: response.message || 'Profile update failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  checkAuthStatus: async () => {
    const token = localStorage.getItem('vanguardia_auth_token');
    
    if (!token) {
      set(initialState);
      return;
    }

    set((state) => {
      state.isLoading = true;
    });

    try {
      const response = await authService.getCurrentUser();
      
      if (response.success && response.data) {
        set({
          user: response.data,
          token: token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          lastActivity: Date.now(),
        });
      } else {
        // Invalid token, clear auth
        localStorage.removeItem('vanguardia_auth_token');
        set(initialState);
      }
    } catch (error) {
      localStorage.removeItem('vanguardia_auth_token');
      set(initialState);
    }
  },

  refreshToken: async () => {
    try {
      const response = await authService.refreshToken();
      
      if (response.success && response.data) {
        localStorage.setItem('vanguardia_auth_token', response.data.access_token);
        
        set({
          token: response.data.access_token,
          lastActivity: Date.now(),
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().logout();
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  initialize: async () => {
    set({ isLoading: true });

    const token = localStorage.getItem('vanguardia_auth_token');
    if (token) {
      await get().checkAuthStatus();
    } else {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    return get().checkAuthStatus();
  },

  forgotPassword: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.forgotPassword(data);
      
      set({ isLoading: false });

      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to send reset email' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  updateLastActivity: () => {
    set({ lastActivity: Date.now() });
  },
});