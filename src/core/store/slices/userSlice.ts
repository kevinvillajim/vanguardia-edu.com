import { StateCreator } from 'zustand';
import { User, PaginatedResponse, ApiResponse } from '../../types';
import { userService } from '../../../features/user-management/services/userService';

export interface UserState {
  users: User[];
  selectedUser: User | null;
  usersLoading: boolean;
  usersError: string | null;
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  searchQuery: string;
  filters: {
    role?: number;
    active?: boolean;
    dateRange?: { from: string; to: string };
  };
}

export interface UserActions {
  fetchUsers: (page?: number, filters?: any) => Promise<void>;
  createUser: (userData: any) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: number, userData: any) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: number) => Promise<{ success: boolean; error?: string }>;
  resetUserPassword: (id: number) => Promise<{ success: boolean; error?: string; tempPassword?: string }>;
  setUserActive: (id: number, active: boolean) => Promise<{ success: boolean; error?: string }>;
  searchUsers: (query: string) => Promise<void>;
  selectUser: (user: User | null) => void;
  setFilters: (filters: any) => void;
  clearUsersError: () => void;
  importUsers: (file: File) => Promise<{ success: boolean; error?: string; results?: any }>;
}

export interface UserSlice extends UserState, UserActions {}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  usersLoading: false,
  usersError: null,
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  searchQuery: '',
  filters: {},
};

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set, get) => ({
  // Initial state
  ...initialState,

  // Actions
  fetchUsers: async (page = 1, filters = {}) => {
    set({ usersLoading: true, usersError: null });

    try {
      const response = await userService.getUsers({
        page,
        per_page: 15,
        ...filters,
      });

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<User>;
        
        set({
          users: paginatedData.data,
          currentPage: paginatedData.pagination.current_page,
          totalPages: paginatedData.pagination.last_page,
          totalUsers: paginatedData.pagination.total,
          usersLoading: false,
          usersError: null,
        });
      } else {
        set({
          usersLoading: false,
          usersError: response.message || 'Failed to fetch users',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        usersLoading: false,
        usersError: errorMessage,
      });
    }
  },

  createUser: async (userData) => {
    set({ usersLoading: true, usersError: null });

    try {
      const response = await userService.createUser(userData);
      
      if (response.success && response.data) {
        // Refresh users list
        await get().fetchUsers(get().currentPage, get().filters);
        
        set({
          usersLoading: false,
          usersError: null,
        });

        return { success: true };
      } else {
        set({
          usersLoading: false,
          usersError: response.message || 'Failed to create user',
        });
        
        return { success: false, error: response.message || 'Failed to create user' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        usersLoading: false,
        usersError: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  updateUser: async (id, userData) => {
    set({ usersLoading: true, usersError: null });

    try {
      const response = await userService.updateUser(id, userData);
      
      if (response.success && response.data) {
        // Update user in the list
        set((state) => {
          const updatedUsers = [...state.users];
          const userIndex = updatedUsers.findIndex(u => u.id === id);
          if (userIndex !== -1) {
            updatedUsers[userIndex] = response.data.user;
          }
          
          return {
            users: updatedUsers,
            selectedUser: state.selectedUser?.id === id ? response.data.user : state.selectedUser,
            usersLoading: false,
            usersError: null,
          };
        });

        return { success: true };
      } else {
        set({
          usersLoading: false,
          usersError: response.message || 'Failed to update user',
        });
        
        return { success: false, error: response.message || 'Failed to update user' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        usersLoading: false,
        usersError: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  deleteUser: async (id) => {
    set({ usersLoading: true, usersError: null });

    try {
      const response = await userService.deleteUser(id);
      
      if (response.success) {
        // Remove user from the list
        set((state) => ({
          users: state.users.filter(u => u.id !== id),
          selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
          totalUsers: Math.max(0, state.totalUsers - 1),
          usersLoading: false,
          usersError: null,
        }));

        return { success: true };
      } else {
        set({
          usersLoading: false,
          usersError: response.message || 'Failed to delete user',
        });
        
        return { success: false, error: response.message || 'Failed to delete user' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        usersLoading: false,
        usersError: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  resetUserPassword: async (id) => {
    try {
      const response = await userService.resetPassword(id);
      
      if (response.success && response.data) {
        return { 
          success: true, 
          tempPassword: response.data.temporary_password 
        };
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to reset password' 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return { success: false, error: errorMessage };
    }
  },

  setUserActive: async (id, active) => {
    try {
      const response = await userService.setUserActive(id, active);
      
      if (response.success) {
        // Update user in the list
        set((state) => {
          const updatedUsers = [...state.users];
          const userIndex = updatedUsers.findIndex(u => u.id === id);
          if (userIndex !== -1) {
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], active: active ? 1 : 0 };
          }
          
          return {
            users: updatedUsers,
            selectedUser: state.selectedUser?.id === id 
              ? { ...state.selectedUser, active: active ? 1 : 0 }
              : state.selectedUser,
          };
        });

        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to update user status' 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return { success: false, error: errorMessage };
    }
  },

  searchUsers: async (query) => {
    set({ 
      searchQuery: query,
      usersLoading: true,
      usersError: null,
    });

    try {
      if (query.trim() === '') {
        // If search is empty, fetch all users
        await get().fetchUsers(1, get().filters);
        return;
      }

      const response = await userService.searchUsers(query);
      
      if (response.success && response.data) {
        set({
          users: response.data.users,
          totalUsers: response.data.total,
          currentPage: 1,
          totalPages: 1,
          usersLoading: false,
          usersError: null,
        });
      } else {
        set({
          usersLoading: false,
          usersError: response.message || 'Search failed',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        usersLoading: false,
        usersError: errorMessage,
      });
    }
  },

  selectUser: (user) => {
    set({ selectedUser: user });
  },

  setFilters: (filters) => {
    set((state) => ({ 
      filters: { ...state.filters, ...filters } 
    }));
    
    // Automatically refetch with new filters
    get().fetchUsers(1, get().filters);
  },

  clearUsersError: () => {
    set({ usersError: null });
  },

  importUsers: async (file) => {
    set({ usersLoading: true, usersError: null });

    try {
      const response = await userService.importUsers(file);
      
      if (response.success) {
        // Refresh users list after import
        await get().fetchUsers(get().currentPage, get().filters);
        
        set({
          usersLoading: false,
          usersError: null,
        });

        return { success: true, results: response.data };
      } else {
        set({
          usersLoading: false,
          usersError: response.message || 'Import failed',
        });
        
        return { success: false, error: response.message || 'Import failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      set({
        usersLoading: false,
        usersError: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },
});