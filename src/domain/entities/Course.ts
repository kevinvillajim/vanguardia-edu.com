import { BaseEntity, CourseStatus, CourseDifficulty } from '../../shared/types';

export interface Course extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  teacherId: number;
  teacher?: {
    id: number;
    name: string;
    avatar?: string;
  };
  bannerImage?: string;
  duration_hours: number;
  totalLessons?: number;
  difficulty_level: CourseDifficulty;
  status: CourseStatus;
  isPublished: boolean;
  enrollmentCount: number;
  rating?: number;
  ratingCount?: number;
  isFeatured?: boolean;
  averageProgress?: number;
  tags?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
  units?: CourseUnit[];
}

export interface CourseUnit extends BaseEntity {
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  isPublished: boolean;
  modules?: CourseModule[];
}

export interface CourseModule extends BaseEntity {
  unitId: number;
  title: string;
  description?: string;
  orderIndex: number;
  isPublished: boolean;
  components?: CourseComponent[];
}

export interface CourseComponent extends BaseEntity {
  moduleId: number;
  type: ComponentType;
  title: string;
  content?: string;
  orderIndex: number;
  isPublished: boolean;
  metadata?: ComponentMetadata;
}

export enum ComponentType {
  TEXT = 'text',
  VIDEO = 'video',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  RESOURCE = 'resource'
}

export interface ComponentMetadata {
  duration?: number;
  videoUrl?: string;
  fileUrl?: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  duration_hours: number;
  difficulty_level: CourseDifficulty;
  tags?: string[];
  categoryId?: number;
  teacherId?: number;
  bannerImage?: string;
  learningObjectives?: string[];
  prerequisites?: string[];
}