// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'vanguardia_auth_token',
  USER_DATA: 'vanguardia_user_data',
  THEME: 'vanguardia_theme',
  LANGUAGE: 'vanguardia_language'
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  PROFILE: '/profile',
  
  // Student routes
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    COURSES: '/student/courses',
    CERTIFICATES: '/student/certificates',
    PROGRESS: '/student/progress'
  },
  
  // Teacher routes  
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    COURSES: '/teacher/courses',
    CREATE_COURSE: '/teacher/courses/create',
    STUDENTS: '/teacher/students',
    ANALYTICS: '/teacher/analytics'
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    COURSES: '/admin/courses',
    REPORTS: '/admin/reports',
    SYSTEM: '/admin/system'
  }
} as const;

// Business Rules
export const BUSINESS_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  COURSE_COMPLETION_THRESHOLD: 100,
  CERTIFICATE_GENERATION_THRESHOLD: 100,
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
} as const;