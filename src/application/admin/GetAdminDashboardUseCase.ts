import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';

export interface AdminStats {
  users: {
    total_users: number;
    active_today: number;
    new_this_month: number;
    role_distribution: Record<string, number>;
    growth_rate: number;
  };
  courses: {
    total_courses: number;
    published_courses: number;
    draft_courses: number;
    new_this_month: number;
    most_popular: any[];
    growth_rate: number;
  };
  enrollments: {
    total_enrollments: number;
    active_enrollments: number;
    completed_enrollments: number;
    new_this_month: number;
    completion_rate: number;
    monthly_trends: any[];
    growth_rate: number;
  };
  certificates: {
    total_certificates: number;
    new_this_month: number;
    monthly_trends: any[];
    growth_rate: number;
  };
  activity: Array<{
    type: string;
    user_name: string;
    course_title: string;
    date: string;
    description: string;
  }>;
}

export class GetAdminDashboardUseCase {
  constructor(
    private userRepository: IUserRepository,
    private courseRepository: ICourseRepository,
    private enrollmentRepository: IEnrollmentRepository
  ) {}

  async execute(): Promise<AdminStats> {
    try {
      // Obtener datos básicos
      const [users, courses] = await Promise.all([
        this.userRepository.getUsers({ page: 1, perPage: 1000 }),
        this.courseRepository.getCourses({ page: 1, perPage: 1000 })
      ]);

      // Calcular estadísticas de usuarios
      const userStats = this.calculateUserStats(users.data);
      
      // Calcular estadísticas de cursos
      const courseStats = this.calculateCourseStats(courses.data);
      
      // Estadísticas de inscripciones (placeholder)
      const enrollmentStats = {
        total_enrollments: 0,
        active_enrollments: 0,
        completed_enrollments: 0,
        new_this_month: 0,
        completion_rate: 0,
        monthly_trends: [],
        growth_rate: 0
      };

      // Estadísticas de certificados (placeholder)
      const certificateStats = {
        total_certificates: 0,
        new_this_month: 0,
        monthly_trends: [],
        growth_rate: 0
      };

      return {
        users: userStats,
        courses: courseStats,
        enrollments: enrollmentStats,
        certificates: certificateStats,
        activity: [] // TODO: Implementar actividad reciente
      };
      
    } catch (error) {
      throw new Error(`Error obteniendo dashboard del administrador: ${error.message}`);
    }
  }

  private calculateUserStats(users: any[]) {
    const total_users = users.length;
    const active_users = users.filter(user => user.active).length;
    
    // Distribución por roles
    const role_distribution = users.reduce((acc, user) => {
      const role = user.role === 1 ? 'admin' : user.role === 2 ? 'student' : 'teacher';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return {
      total_users,
      active_today: Math.floor(active_users * 0.1), // Placeholder
      new_this_month: Math.floor(total_users * 0.05), // Placeholder
      role_distribution,
      growth_rate: 5.2 // Placeholder
    };
  }

  private calculateCourseStats(courses: any[]) {
    const total_courses = courses.length;
    const published_courses = courses.filter(course => course.isPublished).length;
    const draft_courses = total_courses - published_courses;

    // Cursos más populares
    const most_popular = courses
      .filter(course => course.isPublished)
      .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
      .slice(0, 5)
      .map(course => ({
        id: course.id,
        title: course.title,
        enrollment_count: course.enrollmentCount || 0
      }));

    return {
      total_courses,
      published_courses,
      draft_courses,
      new_this_month: Math.floor(total_courses * 0.1), // Placeholder
      most_popular,
      growth_rate: 8.7 // Placeholder
    };
  }
}