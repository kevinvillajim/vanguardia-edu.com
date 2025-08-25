import { IEnrollmentRepository, EnrollmentFilters } from '../../domain/repositories/IEnrollmentRepository';
import { Enrollment } from '../../domain/entities/Enrollment';
import { PaginatedResponse } from '../../shared/types';

export class GetStudentCoursesUseCase {
  constructor(
    private enrollmentRepository: IEnrollmentRepository
  ) {}

  async execute(userId: number, filters?: EnrollmentFilters): Promise<PaginatedResponse<Enrollment>> {
    try {
      const enrollments = await this.enrollmentRepository.getEnrollments(userId, filters);
      return enrollments;
    } catch (error) {
      throw new Error(`Error obteniendo cursos del estudiante: ${error.message}`);
    }
  }
}