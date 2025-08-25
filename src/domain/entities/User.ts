import { BaseEntity, UserRole } from '../../shared/types';

export interface User extends BaseEntity {
  name: string;
  email: string;
  ci?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: UserRole;
  active: boolean;
  passwordChanged: boolean;
  emailVerifiedAt?: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: UserRole;
  ci?: string;
  phone?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  ci?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  active?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  passwordChangeRequired: boolean;
}

export interface ChangePasswordData {
  current_password?: string;
  password: string;
  password_confirmation: string;
}