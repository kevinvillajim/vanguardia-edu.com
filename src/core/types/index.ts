// Core types for the application

export interface User {
  id: number;
  name: string;
  email: string;
  ci: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: number;
  active: number;
  password_changed: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
  password_change_required: boolean;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  error?: string;
  timestamp?: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Course related types
export interface Course {
  id: number;
  title: string;
  description: string;
  units: CourseUnit[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseUnit {
  id: number;
  course_id: number;
  title: string;
  description: string;
  content_type: 'video' | 'text' | 'quiz' | 'document';
  content_data: any;
  order: number;
  is_required: boolean;
}

export interface Progress {
  id: number;
  user_id: number;
  course_id: number;
  unit_id?: number;
  progress_percentage: number;
  completed_at?: string;
  certificate_downloaded?: boolean;
  created_at: string;
  updated_at: string;
}

// UI State types
export interface UIState {
  isLoading: boolean;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  timestamp: Date;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: Record<string, any>;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  ci: string;
  phone?: string;
  bio?: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

export interface UpdateProfileForm {
  name: string;
  email: string;
  ci: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordForm {
  current_password?: string;
  password: string;
  password_confirmation: string;
}

// User roles enum
export enum UserRole {
  ADMIN = 1,
  STUDENT = 2,
  TEACHER = 3,
}

// Route types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiresAuth?: boolean;
  allowedRoles?: UserRole[];
  title?: string;
  isPublic?: boolean;
}

// Feature flags
export interface FeatureFlags {
  enableNewCourseUI: boolean;
  enableRealTimeNotifications: boolean;
  enableAdvancedAnalytics: boolean;
  enableBetaFeatures: boolean;
}

// Application configuration
export interface AppConfig {
  apiBaseUrl: string;
  apiVersion: string;
  environment: 'development' | 'staging' | 'production';
  features: FeatureFlags;
  cache: {
    ttl: number;
    maxSize: number;
  };
  security: {
    tokenRefreshThreshold: number;
    maxLoginAttempts: number;
  };
}