import { BaseEntity } from './Base';
import { Course } from './Course';

export interface Teacher extends BaseEntity {
  userId: number;
  bio?: string;
  expertise: string[];
  rating?: number;
  totalStudents: number;
  totalCourses: number;
  isVerified: boolean;
}

export interface TeacherStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  averageProgress: number;
  recentActivity: TeacherActivity[];
}

export interface TeacherActivity {
  type: 'enrollment' | 'completion' | 'progress' | 'review';
  description: string;
  courseTitle: string;
  studentName?: string;
  createdAt: string;
}