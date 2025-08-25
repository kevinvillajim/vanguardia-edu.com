import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';
import { Course } from '../../domain/entities/Course';

export interface TeacherStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  averageProgress: number;
  totalRevenue?: number;
}

export interface TeacherDashboardData {
  stats: TeacherStats;
  courses: Course[];
  recentActivity: any[];
  students: any[];
}

export class GetTeacherDashboardUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private enrollmentRepository: IEnrollmentRepository
  ) {}

  async execute(teacherId: number): Promise<TeacherDashboardData> {
    try {
      // Obtener cursos del profesor
      const coursesResponse = await this.courseRepository.getTeacherCourses(teacherId);
      const courses = coursesResponse.data;
      
      // Calcular estadísticas
      const stats = await this.calculateStats(teacherId, courses);
      
      // Obtener estudiantes
      const students = await this.enrollmentRepository.getStudentsByTeacher(teacherId);
      
      return {
        stats,
        courses: courses.slice(0, 10), // Últimos 10 cursos
        recentActivity: [], // TODO: Implementar actividad reciente
        students: students.slice(0, 20) // Últimos 20 estudiantes
      };
      
    } catch (error) {
      throw new Error(`Error obteniendo dashboard del profesor: ${error.message}`);
    }
  }

  private async calculateStats(teacherId: number, courses: Course[]): Promise<TeacherStats> {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(course => course.isPublished).length;
    
    // Calcular total de estudiantes
    let totalStudents = 0;
    for (const course of courses) {
      totalStudents += course.enrollmentCount || 0;
    }
    
    // Calcular progreso promedio (placeholder)
    const averageProgress = totalStudents > 0 ? 75 : 0; // TODO: Calcular real
    
    return {
      totalCourses,
      publishedCourses,
      totalStudents,
      averageProgress
    };
  }
}