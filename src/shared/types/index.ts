// Tipos base del sistema
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enums principales
export enum UserRole {
  ADMIN = 1,
  STUDENT = 2, 
  TEACHER = 3
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Course types
export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  banner_image?: string;
  duration_hours: number;
  total_lessons: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  enrollment_count: number;
  is_featured: boolean;
  teacher: {
    id: number;
    name: string;
    avatar?: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

export interface CourseFilters {
  difficulty_level?: string;
  sort_by?: string;
  per_page?: number;
  page?: number;
}