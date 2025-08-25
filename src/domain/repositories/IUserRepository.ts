import { User, CreateUserData, UpdateUserData, LoginCredentials, AuthResponse, ChangePasswordData } from '../entities/User';
import { PaginatedResponse } from '../../shared/types';

export interface IUserRepository {
  // Authentication
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(userData: CreateUserData): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<{ access_token: string }>;
  
  // Profile management
  getCurrentUser(): Promise<User>;
  updateProfile(userId: number, data: UpdateUserData): Promise<User>;
  changePassword(userId: number, data: ChangePasswordData): Promise<void>;
  
  // User management (Admin)
  getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>>;
  getUserById(id: number): Promise<User>;
  createUser(data: CreateUserData): Promise<User>;
  updateUser(id: number, data: UpdateUserData): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Utility
  checkTokenValidity(token: string): boolean;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
}

export interface UserFilters {
  role?: number;
  active?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
}