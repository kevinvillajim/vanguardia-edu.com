import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';
import { StudentStats, StudentActivity } from '../../domain/entities/Enrollment';

export interface StudentDashboardData {
  stats: StudentStats;
  recentActivity: StudentActivity[];
  recommendations?: any[];
}

export class GetStudentDashboardUseCase {
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async execute(userId: number): Promise<StudentDashboardData> {
    try {
      // Obtener estadísticas del estudiante
      const stats = await this.enrollmentRepository.getStudentStats(userId);
      
      // Obtener actividad reciente
      const recentActivity = await this.enrollmentRepository.getStudentActivity(userId, 10);
      
      // Procesar y validar datos
      const processedStats = this.processStats(stats);
      const processedActivity = this.processActivity(recentActivity);
      
      return {
        stats: processedStats,
        recentActivity: processedActivity,
        recommendations: [] // TODO: Implementar sistema de recomendaciones
      };
      
    } catch (error) {
      throw new Error(`Error obteniendo dashboard del estudiante: ${error.message}`);
    }
  }

  private processStats(stats: StudentStats): StudentStats {
    return {
      ...stats,
      averageProgress: Math.round(stats.averageProgress * 100) / 100,
      totalStudyTime: Math.max(0, stats.totalStudyTime),
      currentStreak: Math.max(0, stats.currentStreak)
    };
  }

  private processActivity(activities: StudentActivity[]): StudentActivity[] {
    return activities
      .filter(activity => activity && activity.type)
      .map(activity => ({
        ...activity,
        progress: activity.progress ? Math.min(100, Math.max(0, activity.progress)) : undefined,
        score: activity.score ? Math.min(100, Math.max(0, activity.score)) : undefined
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}