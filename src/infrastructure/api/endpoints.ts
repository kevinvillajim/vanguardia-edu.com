// Centralized API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register', 
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },

  // User endpoints
  USERS: {
    PROFILE: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    LIST: '/admin/users',
    CREATE: '/admin/users',
    UPDATE: (id: number) => `/admin/users/${id}`,
    DELETE: (id: number) => `/admin/users/${id}`,
    GET: (id: number) => `/admin/users/${id}`
  },

  // Course endpoints
  COURSES: {
    LIST: '/courses',
    GET: (id: number) => `/courses/${id}`,
    GET_BY_SLUG: (slug: string) => `/courses/slug/${slug}`,
    CREATE: '/teacher/courses',
    UPDATE: (id: number) => `/teacher/courses/${id}`,
    DELETE: (id: number) => `/teacher/courses/${id}`,
    PUBLISH: (id: number) => `/teacher/courses/${id}/publish`,
    UPLOAD_BANNER: (id: number) => `/teacher/courses/${id}/banner`,
    
    // Teacher specific
    TEACHER_COURSES: '/teacher/courses',
    TEACHER_GET: (id: number) => `/teacher/courses/${id}`, // Endpoint para obtener curso completo del teacher
    
    // Structure
    UNITS: {
      LIST: (courseId: number) => `/teacher/courses/${courseId}/units`,
      CREATE: (courseId: number) => `/teacher/courses/${courseId}/units`,
      UPDATE: (unitId: number) => `/teacher/units/${unitId}`,
      DELETE: (unitId: number) => `/teacher/units/${unitId}`
    },
    
    MODULES: {
      LIST: (unitId: number) => `/teacher/units/${unitId}/modules`,
      CREATE: (unitId: number) => `/teacher/units/${unitId}/modules`,
      UPDATE: (moduleId: number) => `/teacher/modules/${moduleId}`,
      DELETE: (moduleId: number) => `/teacher/modules/${moduleId}`
    },
    
    COMPONENTS: {
      LIST: (moduleId: number) => `/teacher/modules/${moduleId}/components`,
      CREATE: (moduleId: number) => `/teacher/modules/${moduleId}/components`,
      UPDATE: (componentId: number) => `/teacher/components/${componentId}`,
      DELETE: (componentId: number) => `/teacher/components/${componentId}`
    }
  },

  // Enrollment endpoints
  ENROLLMENTS: {
    ENROLL: '/student/courses/enroll',
    LIST: '/student/enrollments',
    GET: (courseId: number) => `/student/courses/${courseId}`,
    CANCEL: (enrollmentId: number) => `/student/enrollments/${enrollmentId}/cancel`,
    
    // Progress
    PROGRESS: '/student/progress',
    COURSE_PROGRESS: (courseId: number) => `/student/courses/${courseId}/progress`,
    COMPLETE_COMPONENT: '/student/components/complete',
    
    // Activity
    ACTIVITY: '/student/activity',
    
    // Course viewing
    COURSE_VIEW: (courseId: number) => `/student/courses/${courseId}/view`,
    
    // Teacher view
    COURSE_ENROLLMENTS: (courseId: number) => `/teacher/courses/${courseId}/enrollments`,
    STUDENTS: '/teacher/students'
  },

  // Certificate endpoints
  CERTIFICATES: {
    GENERATE: '/student/certificates/generate',
    LIST: '/student/certificates',
    GET: (id: number) => `/student/certificates/${id}`,
    DOWNLOAD: (id: number) => `/student/certificates/${id}/download`
  },

  // Dashboard endpoints
  DASHBOARD: {
    STUDENT: '/student/dashboard',
    TEACHER: '/teacher/dashboard', 
    ADMIN: '/admin/dashboard'
  },

  // Category endpoints
  CATEGORIES: {
    LIST: '/categories',
    GET: (id: number) => `/categories/${id}`,
    TREE: '/categories/tree', // Para obtener estructura jerárquica
    
    // Teacher-specific category endpoints
    TEACHER_CREATE: '/teacher/categories',
    
    // Admin-specific category endpoints
    ADMIN_CREATE: '/admin/categories',
    ADMIN_UPDATE: (id: number) => `/admin/categories/${id}`,
    ADMIN_DELETE: (id: number) => `/admin/categories/${id}`,
    ADMIN_REORDER: '/admin/categories/reorder',
    ADMIN_STATS: (id: number) => `/admin/categories/${id}/stats`
  },

  // Admin specific endpoints
  ADMIN: {
    USERS: '/admin/users',
    COURSES: '/admin/courses',
    CATEGORIES: '/admin/categories', // Administración de categorías
    REPORTS: {
      USERS: '/admin/reports/users',
      COURSES: '/admin/reports/courses',
      ENROLLMENTS: '/admin/reports/enrollments',
      CATEGORIES: '/admin/reports/categories'
    },
    SYSTEM: {
      HEALTH: '/admin/system/health',
      STATS: '/admin/system/stats'
    }
  },

  // File upload
  FILES: {
    UPLOAD: '/files/upload',
    DELETE: (filename: string) => `/files/${filename}`,
    
    // Chunked upload endpoints
    CHUNKED_INIT: '/files/chunked/init',
    CHUNKED_UPLOAD: '/files/chunked/upload',
    CHUNKED_STATUS: '/files/chunked/status',
    CHUNKED_FINALIZE: '/files/chunked/finalize',
    CHUNKED_ABORT: '/files/chunked/abort',
    
    // File processing
    PROCESS_IMAGE: '/files/process/image',
    GENERATE_THUMBNAIL: '/files/process/thumbnail',
    EXTRACT_METADATA: '/files/metadata',
    
    // File management
    LIST: '/files',
    INFO: (fileId: string) => `/files/${fileId}/info`,
    DOWNLOAD: (fileId: string) => `/files/${fileId}/download`
  },

  // Health check
  HEALTH: '/health'
} as const;

// Helper function to build URLs with query parameters
export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  if (!params) return endpoint;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};