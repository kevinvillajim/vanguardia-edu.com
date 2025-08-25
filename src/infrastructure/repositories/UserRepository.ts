import { IUserRepository, UserFilters } from '../../domain/repositories/IUserRepository';
import { User, CreateUserData, UpdateUserData, LoginCredentials, AuthResponse, ChangePasswordData } from '../../domain/entities/User';
import { PaginatedResponse } from '../../shared/types';
import { apiClient } from '../api/ApiClient';
import { ENDPOINTS, buildUrl } from '../api/endpoints';
import { STORAGE_KEYS } from '../../shared/constants';

export class UserRepository implements IUserRepository {
  
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Store auth data
    if (response.token || response.access_token) {
      const token = response.access_token || response.token;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(userData: CreateUserData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, userData);
    
    // Store auth data if login after register
    if (response.token || response.access_token) {
      const token = response.access_token || response.token;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Always clear local data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  async refreshToken(): Promise<{ access_token: string }> {
    const response = await apiClient.post<{ access_token: string }>(ENDPOINTS.AUTH.REFRESH);
    
    if (response.access_token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
    }
    
    return response;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>(ENDPOINTS.USERS.PROFILE);
    
    // Update stored user data
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
    
    return response.data;
  }

  async updateProfile(userId: number, data: UpdateUserData): Promise<User> {
    const response = await apiClient.put<{ data: User }>(ENDPOINTS.USERS.UPDATE_PROFILE, data);
    
    // Update stored user data
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
    
    return response.data;
  }

  async changePassword(userId: number, data: ChangePasswordData): Promise<void> {
    await apiClient.put(ENDPOINTS.USERS.CHANGE_PASSWORD, data);
  }

  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const url = buildUrl(ENDPOINTS.USERS.LIST, filters);
    return apiClient.get<PaginatedResponse<User>>(url);
  }

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<{ data: User }>(ENDPOINTS.USERS.GET(id));
    return response.data;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<{ data: User }>(ENDPOINTS.USERS.CREATE, data);
    return response.data;
  }

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await apiClient.put<{ data: User }>(ENDPOINTS.USERS.UPDATE(id), data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.USERS.DELETE(id));
  }

  checkTokenValidity(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  }
}