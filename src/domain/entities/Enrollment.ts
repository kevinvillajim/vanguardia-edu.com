import { BaseEntity, EnrollmentStatus } from '../../shared/types';
import { Course } from './Course';
import { User } from './User';

export interface Enrollment extends BaseEntity {
  userId: number;
  courseId: number;
  status: EnrollmentStatus;
  progressPercentage: number;
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt?: Date;
  course?: Course;
  user?: User;
}

export interface Progress extends BaseEntity {
  enrollmentId: number;
  courseId: number;
  unitId: number;
  moduleId?: number;
  componentId?: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent?: number; // in seconds
}

export interface Certificate extends BaseEntity {
  enrollmentId: number;
  userId: number;
  courseId: number;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  courseDurationHours: number;
  grade: string;
  issuedAt: Date;
  downloadUrl?: string;
}

export interface StudentStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  certificatesEarned: number;
  totalStudyTime: number;
  averageProgress: number;
  completedActivities: number;
  currentStreak: number;
}

export interface StudentActivity {
  id: number;
  type: 'enrollment' | 'completion' | 'achievement' | 'quiz';
  title: string;
  description: string;
  courseName: string;
  date: string;
  progress?: number;
  score?: number;
}