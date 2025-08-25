import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { Course, CreateCourseData } from '../../domain/entities/Course';
import { UserRole } from '../../shared/types';

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
    // Validar título
    if (!courseData.title || courseData.title.trim().length < 5) {
      throw new Error('El título de la curso debe tener al menos 5 caracteres');
    }

    if (courseData.title.length > 100) {
      throw new Error('El título de la curso no puede exceder 100 caracteres');
    }

    // Validar descripción
    if (!courseData.description || courseData.description.trim().length < 20) {
      throw new Error('La descripción de la curso debe tener al menos 20 caracteres');
    }

    if (courseData.description.length > 5000) {
      throw new Error('La descripción de la curso no puede exceder 5000 caracteres');
    }


    // Validar duración
    if (courseData.durationHours <= 0) {
      throw new Error('La duración debe ser mayor a 0 horas');
    }

    if (courseData.durationHours > 1000) {
      throw new Error('La duración no puede exceder 1000 horas');
    }

    // Validar dificultad
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(courseData.difficulty)) {
      throw new Error('Nivel de dificultad inválido');
    }
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