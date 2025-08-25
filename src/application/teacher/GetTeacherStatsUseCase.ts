import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';
import { TeacherStats } from '../../domain/entities/Teacher';

export class GetTeacherStatsUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private enrollmentRepository: IEnrollmentRepository
  ) {}

  async execute(teacherId: number): Promise<TeacherStats> {
    try {
      // Get teacher courses
      const courses = await this.courseRepository.getTeacherCourses(teacherId);
      
      // Calculate basic stats
      const totalCourses = courses.data.length;
      const publishedCourses = courses.data.filter(course => course.isPublished).length;
      
      // For now, let's use simplified stats to avoid the infinite loop
      // We can get aggregated stats from the courses data itself
      let totalStudents = 0;
      let totalProgress = 0;
      let enrollmentCount = 0;

      // Use data already available in courses instead of making additional API calls
      courses.data.forEach(course => {
        if (course.enrollmentCount) {
          totalStudents += course.enrollmentCount;
        }
        if (course.averageProgress) {
          totalProgress += course.averageProgress * (course.enrollmentCount || 1);
          enrollmentCount += course.enrollmentCount || 1;
        }
      });

      const averageProgress = enrollmentCount > 0 ? Math.round(totalProgress / enrollmentCount) : 0;

      return {
        totalCourses,
        publishedCourses,
        totalStudents,
        averageProgress,
        recentActivity: [] // TODO: Implement recent activity
      };
    } catch (error) {
      console.error('Error getting teacher stats:', error);
      // Return default stats instead of throwing to prevent dashboard crash
      return {
        totalCourses: 0,
        publishedCourses: 0,
        totalStudents: 0,
        averageProgress: 0,
        recentActivity: []
      };
    }
  }
}