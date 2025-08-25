import { Course, CourseUnit, CourseModule, CourseComponent, CreateCourseData } from '../entities/Course';
import { PaginatedResponse } from '../../shared/types';

export interface ICourseRepository {
  // Course management
  getCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>>;
  getCourseById(id: number): Promise<Course>;
  getCourseBySlug(slug: string): Promise<Course>;
  createCourse(data: CreateCourseData): Promise<Course>;
  updateCourse(id: number, data: Partial<CreateCourseData>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  publishCourse(id: number): Promise<Course>;
  
  // Teacher specific
  getTeacherCourses(teacherId: number, filters?: CourseFilters): Promise<PaginatedResponse<Course>>;
  
  // Course structure
  getCourseUnits(courseId: number): Promise<CourseUnit[]>;
  createUnit(courseId: number, data: CreateUnitData): Promise<CourseUnit>;
  updateUnit(unitId: number, data: Partial<CreateUnitData>): Promise<CourseUnit>;
  deleteUnit(unitId: number): Promise<void>;
  
  getUnitModules(unitId: number): Promise<CourseModule[]>;
  createModule(unitId: number, data: CreateModuleData): Promise<CourseModule>;
  updateModule(moduleId: number, data: Partial<CreateModuleData>): Promise<CourseModule>;
  deleteModule(moduleId: number): Promise<void>;
  
  getModuleComponents(moduleId: number): Promise<CourseComponent[]>;
  createComponent(moduleId: number, data: CreateComponentData): Promise<CourseComponent>;
  updateComponent(componentId: number, data: Partial<CreateComponentData>): Promise<CourseComponent>;
  deleteComponent(componentId: number): Promise<void>;
  
  // File uploads
  uploadBanner(courseId: number, file: File): Promise<{ bannerUrl: string }>;
  uploadFile(file: File): Promise<{ fileUrl: string }>;
}

export interface CourseFilters {
  teacherId?: number;
  difficulty?: string;
  status?: string;
  isPublished?: boolean;
  search?: string;
  tags?: string[];
  page?: number;
  perPage?: number;
}

export interface CreateUnitData {
  title: string;
  description?: string;
  orderIndex: number;
}

export interface CreateModuleData {
  title: string;
  description?: string;
  orderIndex: number;
}

export interface CreateComponentData {
  type: string;
  title: string;
  content: any;
  orderIndex: number;
  metadata?: any;
}