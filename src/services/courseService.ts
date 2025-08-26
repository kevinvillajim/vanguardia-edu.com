import { CourseRepository } from '../infrastructure/repositories/CourseRepository';
import { CreateCourseUseCase } from '../application/teacher/CreateCourseUseCase';
import { useAuthStore } from '../shared/store/authStore';
import { CreateCourseData, Course, CourseUnit, CourseModule, CourseComponent } from '../domain/entities/Course';
import { CreateUnitData, CreateModuleData, CreateComponentData } from '../domain/repositories/ICourseRepository';
import { logger } from '../shared/utils/logger';

export class CourseService {
  private courseRepository: CourseRepository;
  private createCourseUseCase: CreateCourseUseCase;

  constructor() {
    this.courseRepository = new CourseRepository();
    this.createCourseUseCase = new CreateCourseUseCase(this.courseRepository);
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: CreateCourseData): Promise<{ success: boolean; course?: Course; error?: string }> {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const course = await this.createCourseUseCase.execute(user.id, user.role, courseData);
      
      return { success: true, course };
    } catch (error: any) {
      logger.error('❌ Error creating course:', error);
      return { success: false, error: error.message || 'Error al crear el curso' };
    }
  }

  /**
   * Update an existing course
   */
  async updateCourse(courseId: number, courseData: Partial<CreateCourseData>): Promise<{ success: boolean; course?: Course; error?: string }> {
    try {
      const course = await this.courseRepository.updateCourse(courseId, courseData);
      return { success: true, course };
    } catch (error: any) {
      logger.error('❌ Error updating course:', error);
      return { success: false, error: error.message || 'Error al actualizar el curso' };
    }
  }

  /**
   * Publish a course
   */
  async publishCourse(courseId: number): Promise<{ success: boolean; course?: Course; error?: string }> {
    try {
      const course = await this.courseRepository.publishCourse(courseId);
      return { success: true, course };
    } catch (error: any) {
      logger.error('❌ Error publishing course:', error);
      return { success: false, error: error.message || 'Error al publicar el curso' };
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(courseId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.courseRepository.deleteCourse(courseId);
      return { success: true };
    } catch (error: any) {
      logger.error('❌ Error deleting course:', error);
      return { success: false, error: error.message || 'Error al eliminar el curso' };
    }
  }

  /**
   * Get course by ID
   */
  async getCourse(courseId: number): Promise<{ success: boolean; course?: Course; error?: string }> {
    try {
      const course = await this.courseRepository.getCourseById(courseId);
      return { success: true, course };
    } catch (error: any) {
      logger.error('❌ Error getting course:', error);
      return { success: false, error: error.message || 'Error al obtener el curso' };
    }
  }

  async getTeacherCourse(courseId: number): Promise<{ success: boolean; course?: Course; error?: string }> {
    try {
      const course = await this.courseRepository.getTeacherCourseById(courseId);
      return { success: true, course };
    } catch (error: any) {
      logger.error('❌ Error getting teacher course:', error);
      return { success: false, error: error.message || 'Error al obtener el curso del profesor' };
    }
  }

  /**
   * Create a new unit in a course
   */
  async createUnit(courseId: number, unitData: CreateUnitData): Promise<{ success: boolean; unit?: CourseUnit; error?: string }> {
    try {
      logger.info('📚 CourseService createUnit:', { courseId, unitData });
      const unit = await this.courseRepository.createUnit(courseId, unitData);
      logger.info('📚 CourseService createUnit - unit received:', unit);
      
      // Verificar si unit es un objeto válido
      if (unit && typeof unit === 'object' && unit.id) {
        return { success: true, unit };
      } else {
        logger.error('❌ Unit recibido no es válido:', unit);
        return { success: false, error: 'Respuesta del servidor inválida' };
      }
    } catch (error: any) {
      logger.error('❌ Error creating unit:', error);
      return { success: false, error: error.message || 'Error al crear la unidad' };
    }
  }

  /**
   * Update a unit
   */
  async updateUnit(unitId: number, unitData: Partial<CreateUnitData>): Promise<{ success: boolean; unit?: CourseUnit; error?: string }> {
    try {
      const unit = await this.courseRepository.updateUnit(unitId, unitData);
      return { success: true, unit };
    } catch (error: any) {
      logger.error('❌ Error updating unit:', error);
      return { success: false, error: error.message || 'Error al actualizar la unidad' };
    }
  }

  /**
   * Delete a unit
   */
  async deleteUnit(unitId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.courseRepository.deleteUnit(unitId);
      return { success: true };
    } catch (error: any) {
      logger.error('❌ Error deleting unit:', error);
      return { success: false, error: error.message || 'Error al eliminar la unidad' };
    }
  }

  /**
   * Create a new module in a unit
   */
  async createModule(unitId: number, moduleData: CreateModuleData): Promise<{ success: boolean; module?: CourseModule; error?: string }> {
    try {
      const module = await this.courseRepository.createModule(unitId, moduleData);
      return { success: true, module };
    } catch (error: any) {
      logger.error('❌ Error creating module:', error);
      return { success: false, error: error.message || 'Error al crear el módulo' };
    }
  }

  /**
   * Update a module
   */
  async updateModule(moduleId: number, moduleData: Partial<CreateModuleData>): Promise<{ success: boolean; module?: CourseModule; error?: string }> {
    try {
      const module = await this.courseRepository.updateModule(moduleId, moduleData);
      return { success: true, module };
    } catch (error: any) {
      logger.error('❌ Error updating module:', error);
      return { success: false, error: error.message || 'Error al actualizar el módulo' };
    }
  }

  /**
   * Delete a module
   */
  async deleteModule(moduleId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.courseRepository.deleteModule(moduleId);
      return { success: true };
    } catch (error: any) {
      logger.error('❌ Error deleting module:', error);
      return { success: false, error: error.message || 'Error al eliminar el módulo' };
    }
  }

  /**
   * Create a new component in a module
   */
  async createComponent(moduleId: number, componentData: CreateComponentData): Promise<{ success: boolean; component?: CourseComponent; error?: string }> {
    try {
      const component = await this.courseRepository.createComponent(moduleId, componentData);
      return { success: true, component };
    } catch (error: any) {
      logger.error('❌ Error creating component:', error);
      return { success: false, error: error.message || 'Error al crear el componente' };
    }
  }

  /**
   * Update a component
   */
  async updateComponent(componentId: number, componentData: Partial<CreateComponentData>): Promise<{ success: boolean; component?: CourseComponent; error?: string }> {
    try {
      const component = await this.courseRepository.updateComponent(componentId, componentData);
      return { success: true, component };
    } catch (error: any) {
      logger.error('❌ Error updating component:', error);
      return { success: false, error: error.message || 'Error al actualizar el componente' };
    }
  }

  /**
   * Delete a component
   */
  async deleteComponent(componentId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.courseRepository.deleteComponent(componentId);
      return { success: true };
    } catch (error: any) {
      logger.error('❌ Error deleting component:', error);
      return { success: false, error: error.message || 'Error al eliminar el componente' };
    }
  }

  /**
   * Upload course banner
   */
  async uploadBanner(courseId: number, file: File): Promise<{ success: boolean; bannerUrl?: string; error?: string }> {
    try {
      const result = await this.courseRepository.uploadBanner(courseId, file);
      return { success: true, bannerUrl: result.bannerUrl };
    } catch (error: any) {
      logger.error('❌ Error uploading banner:', error);
      return { success: false, error: error.message || 'Error al subir la imagen' };
    }
  }

  /**
   * Upload a file
   */
  async uploadFile(file: File): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
    try {
      const result = await this.courseRepository.uploadFile(file);
      return { success: true, fileUrl: result.fileUrl };
    } catch (error: any) {
      logger.error('❌ Error uploading file:', error);
      return { success: false, error: error.message || 'Error al subir el archivo' };
    }
  }

  /**
   * Get teacher courses
   */
  async getTeacherCourses(filters?: any): Promise<{ success: boolean; courses?: Course[]; error?: string }> {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const response = await this.courseRepository.getTeacherCourses(user.id, filters);
      return { success: true, courses: response.data };
    } catch (error: any) {
      logger.error('❌ Error getting teacher courses:', error);
      return { success: false, error: error.message || 'Error al obtener los cursos' };
    }
  }
}

// Export singleton instance
export const courseService = new CourseService();