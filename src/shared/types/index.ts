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

// Import Course types from domain (eliminamos duplicación)
// Los tipos de Course ahora se importan desde domain/entities/Course.ts

export interface CourseFilters {
  difficulty?: CourseDifficulty;
  sortBy?: string;
  perPage?: number;
  page?: number;
  categoryId?: number;
}