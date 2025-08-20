// Application-wide constants

export const APP_NAME = 'Vanguardia';
export const APP_DESCRIPTION = 'Plataforma de Educación en Ciberseguridad';
export const APP_VERSION = '2.0.0';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const API_TIMEOUT = 30000; // 30 seconds

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'vanguardia_access_token',
  REFRESH_TOKEN: 'vanguardia_refresh_token',
  USER_PREFERENCES: 'vanguardia_user_preferences',
  THEME: 'vanguardia_theme',
  LANGUAGE: 'vanguardia_language',
  LAST_VISITED_COURSE: 'vanguardia_last_course',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Course Status
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type CourseStatus = typeof COURSE_STATUS[keyof typeof COURSE_STATUS];

// Lesson Types
export const LESSON_TYPES = {
  VIDEO: 'video',
  TEXT: 'text',
  QUIZ: 'quiz',
  INTERACTIVE: 'interactive',
  ASSIGNMENT: 'assignment',
} as const;

export type LessonType = typeof LESSON_TYPES[keyof typeof LESSON_TYPES];

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// File Upload Constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss',
} as const;

// Security
export const SECURITY = {
  PASSWORD_MIN_LENGTH: 8,
  LOGIN_ATTEMPTS_LIMIT: 5,
  SESSION_TIMEOUT_MINUTES: 60,
  REFRESH_TOKEN_THRESHOLD_MINUTES: 10,
} as const;

// UI Constants
export const UI = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;

// Animation Durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 300,
  NOTIFICATION_AUTO_DISMISS: 5000,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  FORBIDDEN: 'Acceso denegado.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error interno del servidor. Inténtalo de nuevo más tarde.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Has iniciado sesión correctamente.',
  LOGOUT: 'Has cerrado sesión correctamente.',
  REGISTRATION: 'Tu cuenta ha sido creada exitosamente.',
  PASSWORD_RESET: 'Se han enviado las instrucciones para restablecer tu contraseña.',
  PROFILE_UPDATED: 'Tu perfil ha sido actualizado correctamente.',
  COURSE_ENROLLED: 'Te has inscrito al curso exitosamente.',
  COURSE_COMPLETED: '¡Felicitaciones! Has completado el curso.',
  CERTIFICATE_GENERATED: 'Tu certificado ha sido generado correctamente.',
} as const;

// Regular Expressions
export const REGEX = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

// Course Difficulties
export const COURSE_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

export type CourseDifficulty = typeof COURSE_DIFFICULTY[keyof typeof COURSE_DIFFICULTY];

// Course Categories
export const COURSE_CATEGORIES = {
  NETWORK_SECURITY: 'network_security',
  WEB_SECURITY: 'web_security',
  MOBILE_SECURITY: 'mobile_security',
  CLOUD_SECURITY: 'cloud_security',
  INCIDENT_RESPONSE: 'incident_response',
  PENETRATION_TESTING: 'penetration_testing',
  DIGITAL_FORENSICS: 'digital_forensics',
  CRYPTOGRAPHY: 'cryptography',
  COMPLIANCE: 'compliance',
  AWARENESS: 'awareness',
} as const;

export type CourseCategory = typeof COURSE_CATEGORIES[keyof typeof COURSE_CATEGORIES];