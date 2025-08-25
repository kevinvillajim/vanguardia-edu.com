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

  // Admin specific endpoints
  ADMIN: {
    USERS: '/admin/users',
    COURSES: '/admin/courses',
    REPORTS: {
      USERS: '/admin/reports/users',
      COURSES: '/admin/reports/courses',
      ENROLLMENTS: '/admin/reports/enrollments'
    },
    SYSTEM: {
      HEALTH: '/admin/system/health',
      STATS: '/admin/system/stats'
    }
  },

  // File upload
  FILES: {
    UPLOAD: '/files/upload',
    DELETE: (filename: string) => `/files/${filename}`
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