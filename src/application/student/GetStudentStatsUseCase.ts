import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';
import { StudentStats } from '../../domain/entities/Enrollment';

export class GetStudentStatsUseCase {
  constructor(
    private enrollmentRepository: IEnrollmentRepository
  ) {}

  async execute(userId: number): Promise<StudentStats> {
    try {
      const stats = await this.enrollmentRepository.getStudentStats(userId);
      return stats;
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas del estudiante: ${error.message}`);
    }
  }
}