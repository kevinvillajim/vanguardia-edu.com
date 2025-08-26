import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { Course, CreateCourseData } from '../../domain/entities/Course';
import { UserRole } from '../../shared/types';
import { CourseValidator } from '../../shared/validation';
import { logger } from '../../shared/utils/logger';

export class CreateCourseUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(teacherId: number, teacherRole: UserRole, courseData: CreateCourseData): Promise<Course> {
    // Validaciones de negocio
    this.validateTeacherPermissions(teacherRole);
    this.validateCourseData(courseData);
    
    try {
      // Crear el curso
      const course = await this.courseRepository.createCourse({
        ...courseData,
        teacherId
      });
      
      return course;
      
    } catch (error) {
      throw this.handleCreateCourseError(error);
    }
  }

  private validateTeacherPermissions(role: UserRole): void {
    if (role !== UserRole.TEACHER && role !== UserRole.ADMIN) {
      throw new Error('No tienes permisos para crear cursos');
    }
  }

  private validateCourseData(courseData: CreateCourseData): void {
    logger.debug('🔍 Validating course data:', courseData);
    
    // Usar validación de creación (sin objetivos obligatorios)
    const validationResult = CourseValidator.validateCreation(courseData);
    
    if (!validationResult.isValid) {
      const firstError = validationResult.errors[0];
      logger.warn('❌ Course validation failed:', {
        errors: validationResult.errors,
        fieldErrors: validationResult.fieldErrors
      });
      throw new Error(firstError);
    }
    
    logger.success('✅ Course data validation passed');
  }

  private handleCreateCourseError(error: any): Error {
    if (error.status === 422) {
      return new Error('Datos de la curso inválidos');
    }
    
    if (error.status === 403) {
      return new Error('No tienes permisos para crear cursos');
    }
    
    return new Error(error.message || 'Error inesperado al crear curso');
  }
}