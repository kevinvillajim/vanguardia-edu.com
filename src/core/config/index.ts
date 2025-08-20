import { AppConfig } from '../types';

const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_APP_ENV === 'staging' ? 'staging' : 'production';
  }
  return 'development';
};

export const appConfig: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiVersion: import.meta.env.VITE_API_VERSION || 'v2',
  environment: getEnvironment(),
  
  features: {
    enableNewCourseUI: import.meta.env.VITE_FEATURE_NEW_COURSE_UI === 'true',
    enableRealTimeNotifications: import.meta.env.VITE_FEATURE_REALTIME_NOTIFICATIONS === 'true',
    enableAdvancedAnalytics: import.meta.env.VITE_FEATURE_ADVANCED_ANALYTICS === 'true',
    enableBetaFeatures: import.meta.env.VITE_FEATURE_BETA === 'true',
  },

  cache: {
    ttl: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutes
    maxSize: parseInt(import.meta.env.VITE_CACHE_MAX_SIZE) || 100,
  },

  security: {
    tokenRefreshThreshold: parseInt(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD) || 300000, // 5 minutes
    maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 3,
  },
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    changePassword: '/auth/change-password',
    updateProfile: '/auth/profile',
  },
  users: {
    list: '/users',
    create: '/users',
    show: (id: number) => `/users/${id}`,
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
    resetPassword: (id: number) => `/users/${id}/reset-password`,
    setActive: (id: number) => `/users/${id}/set-active`,
    search: '/users/search',
    byRole: (role: number) => `/users/role/${role}`,
    import: '/users/import',
  },
  progress: {
    list: '/progress',
    user: '/user-progress',
    upsert: '/progress/upsert',
    updateCertificate: '/progress/update-certificate',
  },
  statistics: {
    users: '/statistics/users',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'vanguardia_auth_token',
  USER_DATA: 'vanguardia_user_data',
  THEME: 'vanguardia_theme',
  PREFERENCES: 'vanguardia_preferences',
} as const;

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ABOUT: '/about',
    COURSES: '/courses',
    CONTACT: '/contact',
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    EDIT_PROFILE: '/profile/edit',
    CHANGE_PASSWORD: '/change-password',
    CERTIFICATES: '/certificates',
    COURSE: (id: number) => `/course/${id}`,
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
    COURSES: '/admin/courses',
    STUDENTS: '/admin/students',
  },
} as const;

export const USER_ROLES = {
  ADMIN: 1,
  STUDENT: 2,
  TEACHER: 3,
} as const;

export const THEME = {
  COLORS: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    info: '#0288d1',
  },
  BREAKPOINTS: {
    xs: '0px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px',
  },
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  CI_REGEX: /^[0-9]{10,13}$/,
  PHONE_REGEX: /^[0-9+\-\s]{10,15}$/,
  NAME_REGEX: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,255}$/,
} as const;