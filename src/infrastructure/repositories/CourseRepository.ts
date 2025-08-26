import { ICourseRepository, CourseFilters, CreateUnitData, CreateModuleData, CreateComponentData } from '../../domain/repositories/ICourseRepository';
import { Course, CourseUnit, CourseModule, CourseComponent, CreateCourseData } from '../../domain/entities/Course';
import { PaginatedResponse } from '../../shared/types';
import { apiClient } from '../api/ApiClient';
import { ENDPOINTS, buildUrl } from '../api/endpoints';
import { logger } from '../../shared/utils/logger';
import { mapLegacyPath } from '../../shared/utils/mediaUtils';

export class CourseRepository implements ICourseRepository {
  
  // Método helper para mapear datos del backend al frontend
  private mapBackendToFrontend(backendData: any): Course {
    logger.info('📚 mapBackendToFrontend - Datos recibidos del backend:', {
      hasUnits: !!backendData.units,
      unitsCount: backendData.units?.length || 0,
      hasModules: !!backendData.modules,
      modulesCount: backendData.modules?.length || 0
    });
    
    const mappedData = {
      ...backendData,
      learningObjectives: backendData.learning_objectives || [],
      prerequisites: backendData.prerequisites || [],
      bannerImage: backendData.banner_image ? mapLegacyPath(backendData.banner_image, backendData.id) : null,
      difficultyLevel: backendData.difficulty_level,
      durationHours: backendData.duration_hours,
      isPublished: backendData.is_published,
      isFeatured: backendData.is_featured,
      enrollmentCount: backendData.enrollment_count,
      categoryId: backendData.category?.id,
      // Mapear la estructura completa de units -> modules -> components
      units: backendData.units || [],
      modules: backendData.modules || [] // Mantener compatibilidad
    };
    
    logger.info('📚 mapBackendToFrontend - Datos mapeados:', {
      hasUnits: !!mappedData.units,
      unitsCount: mappedData.units?.length || 0,
      units: mappedData.units
    });
    
    return mappedData;
  }
  
  async getCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
    const url = buildUrl(ENDPOINTS.COURSES.LIST, filters);
    const response = await apiClient.get<PaginatedResponse<any>>(url);
    
    // Mapear los datos de cada curso en la respuesta paginada
    const mappedData = response.data.map((course: any) => this.mapBackendToFrontend(course));
    
    return {
      ...response,
      data: mappedData
    };
  }

  async getCourseById(id: number): Promise<Course> {
    const response = await apiClient.get<{ data: any }>(ENDPOINTS.COURSES.GET(id));
    
    // Mapear datos del backend al formato esperado por el frontend
    const backendData = response.data;
    const frontendData: Course = {
      ...backendData,
      learningObjectives: backendData.learning_objectives || [],
      prerequisites: backendData.prerequisites || [],
      bannerImage: backendData.banner_image,
      difficultyLevel: backendData.difficulty_level,
      durationHours: backendData.duration_hours,
      isPublished: backendData.is_published,
      isFeatured: backendData.is_featured,
      enrollmentCount: backendData.enrollment_count,
      categoryId: backendData.category?.id
    };
    
    return frontendData;
  }

  async getCourseBySlug(slug: string): Promise<Course> {
    const response = await apiClient.get<{ data: any }>(ENDPOINTS.COURSES.GET_BY_SLUG(slug));
    return this.mapBackendToFrontend(response.data);
  }

  async getTeacherCourseById(id: number): Promise<Course> {
    logger.info('📚 CourseRepository.getTeacherCourseById - Solicitando curso:', id);
    const response = await apiClient.get<{ data: any }>(ENDPOINTS.COURSES.TEACHER_GET(id));
    logger.info('📚 CourseRepository.getTeacherCourseById - Respuesta del backend:', response);
    
    const mappedCourse = this.mapBackendToFrontend(response.data);
    logger.info('📚 CourseRepository.getTeacherCourseById - Curso mapeado:', mappedCourse);
    
    return mappedCourse;
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    // Mapear datos del frontend al formato esperado por el backend
    const backendData = {
      title: data.title,
      description: data.description,
      difficulty_level: data.difficulty_level?.toLowerCase() || data.difficulty?.toLowerCase() || 'beginner', // Convertir a minúsculas
      duration_hours: data.duration_hours || data.durationHours,
      category_id: data.categoryId || null,
      banner_image: data.bannerImage || null,
      learning_objectives: data.learningObjectives || [],
      prerequisites: data.prerequisites || [],
      is_featured: false
    };
    
    try {
      logger.info('📚 CourseRepository: Enviando al backend', backendData);
      const response = await apiClient.post<{ data: any }>(ENDPOINTS.COURSES.CREATE, backendData);
      logger.info('📚 CourseRepository: Respuesta del backend', response);
      
      if (!response.data) {
        throw new Error('No se recibió data en la respuesta');
      }
      
      // Mapear respuesta del backend al formato frontend
      return this.mapBackendToFrontend(response.data);
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
    if (data.difficulty_level !== undefined) backendData.difficulty_level = data.difficulty_level.toLowerCase();
    if (data.difficulty !== undefined) backendData.difficulty_level = data.difficulty.toLowerCase(); // Fallback compatibility
    if (data.duration_hours !== undefined) backendData.duration_hours = data.duration_hours;
    if (data.durationHours !== undefined) backendData.duration_hours = data.durationHours; // Fallback compatibility
    if (data.categoryId !== undefined) backendData.category_id = data.categoryId;
    if (data.bannerImage !== undefined) backendData.banner_image = data.bannerImage;
    if (data.learningObjectives !== undefined) backendData.learning_objectives = data.learningObjectives;
    if (data.prerequisites !== undefined) backendData.prerequisites = data.prerequisites;
    
    const response = await apiClient.put<{ data: any }>(ENDPOINTS.COURSES.UPDATE(id), backendData);
    return this.mapBackendToFrontend(response.data);
  }

  async deleteCourse(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.COURSES.DELETE(id));
  }

  async publishCourse(id: number): Promise<Course> {
    const response = await apiClient.put<{ data?: any }>(ENDPOINTS.COURSES.PUBLISH(id));
    
    // Si el backend no devuelve data, obtener el curso actualizado
    if (!response.data) {
      const courseResponse = await this.getCourseById(id);
      return courseResponse;
    }
    
    return this.mapBackendToFrontend(response.data);
  }

  async getTeacherCourses(teacherId: number, filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
    const params = { ...filters, teacher_id: teacherId };
    const url = buildUrl(ENDPOINTS.COURSES.TEACHER_COURSES, params);
    const response = await apiClient.get<PaginatedResponse<any>>(url);
    
    // Mapear los datos de cada curso en la respuesta paginada
    const mappedData = response.data.map((course: any) => this.mapBackendToFrontend(course));
    
    return {
      ...response,
      data: mappedData
    };
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