import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { Enrollment } from '../../domain/entities/Enrollment';

export class EnrollInCourseUseCase {
  constructor(
    private enrollmentRepository: IEnrollmentRepository,
    private courseRepository: ICourseRepository
  ) {}

  async execute(userId: number, courseId: number): Promise<Enrollment> {
    // Validaciones de negocio
    await this.validateEnrollment(userId, courseId);
    
    try {
      // Ejecutar inscripción
      const enrollment = await this.enrollmentRepository.enrollInCourse(userId, courseId);
      
      return enrollment;
      
    } catch (error) {
      throw this.handleEnrollmentError(error);
    }
  }

  private async validateEnrollment(userId: number, courseId: number): Promise<void> {
    // Verificar que el curso existe y está publicado
    const course = await this.courseRepository.getCourseById(courseId);
    
    if (!course) {
      throw new Error('Curso no encontrada');
    }

    if (!course.isPublished) {
      throw new Error('Esta curso no está disponible para inscripción');
    }

    // Verificar si ya está inscrito
    try {
      const existingEnrollment = await this.enrollmentRepository.getEnrollment(userId, courseId);
      if (existingEnrollment) {
        throw new Error('Ya estás inscrito en esta curso');
      }
    } catch (error) {
      // Si no existe la inscripción, continuamos
      if (!error.message.includes('ya estás inscrito')) {
        // Solo lanzamos error si no es por que no existe la inscripción
      }
    }
  }

  private handleEnrollmentError(error: any): Error {
    if (error.status === 409) {
      return new Error('Ya estás inscrito en esta curso');
    }
    
    if (error.status === 402) {
    }
    
    if (error.status === 404) {
      return new Error('Curso no encontrada');
    }
    
    return new Error(error.message || 'Error inesperado al inscribirse');
  }
}