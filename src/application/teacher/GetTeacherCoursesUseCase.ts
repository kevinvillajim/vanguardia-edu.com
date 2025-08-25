import { ICourseRepository, CourseFilters } from '../../domain/repositories/ICourseRepository';
import { Course } from '../../domain/entities/Course';
import { PaginatedResponse } from '../../shared/types';

export class GetTeacherCoursesUseCase {
  constructor(
    private courseRepository: ICourseRepository
  ) {}

  async execute(teacherId: number, filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
    try {
      const courses = await this.courseRepository.getTeacherCourses(teacherId, filters);
      return courses;
    } catch (error) {
      throw new Error(`Error obteniendo cursos del profesor: ${error.message}`);
    }
  }
}