import { ICourseRepository, CourseFilters, CreateUnitData, CreateModuleData, CreateComponentData } from '../../domain/repositories/ICourseRepository';
import { Course, CourseUnit, CourseModule, CourseComponent, CreateCourseData } from '../../domain/entities/Course';
import { PaginatedResponse } from '../../shared/types';
import { apiClient } from '../api/ApiClient';
import { ENDPOINTS, buildUrl } from '../api/endpoints';
import { logger } from '../../shared/utils/logger';

export class CourseRepository implements ICourseRepository {
  
  async getCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
    const url = buildUrl(ENDPOINTS.COURSES.LIST, filters);
    return apiClient.get<PaginatedResponse<Course>>(url);
  }

  async getCourseById(id: number): Promise<Course> {
    const response = await apiClient.get<{ data: Course }>(ENDPOINTS.COURSES.GET(id));
    return response.data;
  }

  async getCourseBySlug(slug: string): Promise<Course> {
    const response = await apiClient.get<{ data: Course }>(ENDPOINTS.COURSES.GET_BY_SLUG(slug));
    return response.data;
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    // Mapear datos del frontend al formato esperado por el backend
    const backendData = {
      title: data.title,
      description: data.description,
      difficulty_level: data.difficulty?.toLowerCase() || 'beginner', // Convertir a minúsculas
      duration_hours: data.durationHours,
      category_id: data.categoryId || null,
      is_featured: false
    };
    
    try {
      logger.info('📚 CourseRepository: Enviando al backend', backendData);
      const response = await apiClient.post<{ data: Course }>(ENDPOINTS.COURSES.CREATE, backendData);
      logger.info('📚 CourseRepository: Respuesta del backend', response);
      
      if (!response.data) {
        throw new Error('No se recibió data en la respuesta');
      }
      return response.data;
    } catch (error) {
      logger.error('❌ Error en createCourse:', error);
      throw error;
    }
  }

  async updateCourse(id: number, data: Partial<CreateCourseData>): Promise<Course> {
    // Mapear datos del frontend al formato esperado por el backend
    const backendData: any = {};
    
    if (data.title !== undefined) backendData.title = data.title;
    if (data.description !== undefined) backendData.description = data.description;
    if (data.difficulty !== undefined) backendData.difficulty_level = data.difficulty.toLowerCase();
    if (data.durationHours !== undefined) backendData.duration_hours = data.durationHours;
    if (data.categoryId !== undefined) backendData.category_id = data.categoryId;
    
    const response = await apiClient.put<{ data: Course }>(ENDPOINTS.COURSES.UPDATE(id), backendData);
    return response.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.COURSES.DELETE(id));
  }

  async publishCourse(id: number): Promise<Course> {
    const response = await apiClient.post<{ data: Course }>(ENDPOINTS.COURSES.PUBLISH(id));
    return response.data;
  }

  async getTeacherCourses(teacherId: number, filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
    const params = { ...filters, teacher_id: teacherId };
    const url = buildUrl(ENDPOINTS.COURSES.TEACHER_COURSES, params);
    return apiClient.get<PaginatedResponse<Course>>(url);
  }

  async getCourseUnits(courseId: number): Promise<CourseUnit[]> {
    const response = await apiClient.get<{ data: CourseUnit[] }>(ENDPOINTS.COURSES.UNITS.LIST(courseId));
    return response.data;
  }

  async createUnit(courseId: number, data: CreateUnitData): Promise<CourseUnit> {
    try {
      logger.info('📚 CourseRepository.createUnit - enviando:', { courseId, data });
      const response = await apiClient.post<any>(ENDPOINTS.COURSES.UNITS.CREATE(courseId), data);
      logger.info('📚 CourseRepository.createUnit - respuesta completa:', response);
      
      // El backend devuelve { success, message, data }
      if (response.success && response.data) {
        logger.info('📚 CourseRepository.createUnit - data extraída:', response.data);
        return response.data;
      } else if (response.data) {
        // Fallback si la estructura es diferente
        return response.data;
      } else {
        throw new Error('No se recibió data válida en la respuesta');
      }
    } catch (error) {
      logger.error('❌ Error en createUnit:', error);
      throw error;
    }
  }

  async updateUnit(unitId: number, data: Partial<CreateUnitData>): Promise<CourseUnit> {
    const response = await apiClient.put<{ data: CourseUnit }>(ENDPOINTS.COURSES.UNITS.UPDATE(unitId), data);
    return response.data;
  }

  async deleteUnit(unitId: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.COURSES.UNITS.DELETE(unitId));
  }

  async getUnitModules(unitId: number): Promise<CourseModule[]> {
    const response = await apiClient.get<{ data: CourseModule[] }>(ENDPOINTS.COURSES.MODULES.LIST(unitId));
    return response.data;
  }

  async createModule(unitId: number, data: CreateModuleData): Promise<CourseModule> {
    const response = await apiClient.post<{ data: CourseModule }>(ENDPOINTS.COURSES.MODULES.CREATE(unitId), data);
    return response.data;
  }

  async updateModule(moduleId: number, data: Partial<CreateModuleData>): Promise<CourseModule> {
    const response = await apiClient.put<{ data: CourseModule }>(ENDPOINTS.COURSES.MODULES.UPDATE(moduleId), data);
    return response.data;
  }

  async deleteModule(moduleId: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.COURSES.MODULES.DELETE(moduleId));
  }

  async getModuleComponents(moduleId: number): Promise<CourseComponent[]> {
    const response = await apiClient.get<{ data: CourseComponent[] }>(ENDPOINTS.COURSES.COMPONENTS.LIST(moduleId));
    return response.data;
  }

  async createComponent(moduleId: number, data: CreateComponentData): Promise<CourseComponent> {
    const response = await apiClient.post<{ data: CourseComponent }>(ENDPOINTS.COURSES.COMPONENTS.CREATE(moduleId), data);
    return response.data;
  }

  async updateComponent(componentId: number, data: Partial<CreateComponentData>): Promise<CourseComponent> {
    const response = await apiClient.put<{ data: CourseComponent }>(ENDPOINTS.COURSES.COMPONENTS.UPDATE(componentId), data);
    return response.data;
  }

  async deleteComponent(componentId: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.COURSES.COMPONENTS.DELETE(componentId));
  }

  async uploadBanner(courseId: number, file: File): Promise<{ bannerUrl: string }> {
    const response = await apiClient.upload<{ banner_url: string }>(ENDPOINTS.COURSES.UPLOAD_BANNER(courseId), file);
    return { bannerUrl: response.banner_url };
  }

  async uploadFile(file: File): Promise<{ fileUrl: string }> {
    const response = await apiClient.upload<{ file_url: string }>(ENDPOINTS.FILES.UPLOAD, file);
    return { fileUrl: response.file_url };
  }
}