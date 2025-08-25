import { Enrollment, Progress, Certificate, StudentStats, StudentActivity } from '../entities/Enrollment';
import { PaginatedResponse } from '../../shared/types';

export interface IEnrollmentRepository {
  // Enrollment management
  enrollInCourse(userId: number, courseId: number): Promise<Enrollment>;
  getEnrollments(userId: number, filters?: EnrollmentFilters): Promise<PaginatedResponse<Enrollment>>;
  getEnrollment(userId: number, courseId: number): Promise<Enrollment>;
  cancelEnrollment(enrollmentId: number): Promise<void>;
  
  // Progress tracking
  updateProgress(data: UpdateProgressData): Promise<Progress>;
  getProgress(userId: number, courseId: number): Promise<Progress[]>;
  getCourseProgress(userId: number, courseId: number): Promise<CourseProgressData>;
  markComponentCompleted(userId: number, componentId: number): Promise<Progress>;
  
  // Student dashboard
  getStudentStats(userId: number): Promise<StudentStats>;
  getStudentActivity(userId: number, limit?: number): Promise<StudentActivity[]>;
  
  // Certificates
  generateCertificate(userId: number, courseId: number): Promise<Certificate>;
  getCertificates(userId: number): Promise<Certificate[]>;
  getCertificate(certificateId: number): Promise<Certificate>;
  
  // Admin/Teacher views
  getCourseEnrollments(courseId: number, filters?: EnrollmentFilters): Promise<PaginatedResponse<Enrollment>>;
  getStudentsByTeacher(teacherId: number): Promise<Enrollment[]>;
}

export interface EnrollmentFilters {
  status?: string;
  courseId?: number;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface UpdateProgressData {
  userId: number;
  courseId: number;
  unitId?: number;
  moduleId?: number;
  componentId?: number;
  progressPercentage: number;
  timeSpent?: number;
}

export interface CourseProgressData {
  courseId: number;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  timeSpent: number;
  lastActivity: string;
  units: UnitProgress[];
}

export interface UnitProgress {
  id: number;
  title: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  modules: ModuleProgress[];
}

export interface ModuleProgress {
  id: number;
  title: string;
  progress: number;
  completedComponents: number;
  totalComponents: number;
}