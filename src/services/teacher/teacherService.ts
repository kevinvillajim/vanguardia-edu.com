import { apiClient } from '../api/apiService';

export interface TeacherStats {
  total_courses: number;
  total_students: number;
  total_lessons: number;
  avg_rating: number;
}

export interface TeacherActivity {
  id: number;
  type: 'enrollment' | 'review' | 'question' | 'completion';
  message: string;
  time: string;
  course_id?: number;
  student_id?: number;
  created_at: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  enrolled_at: string;
  progress: number;
  course_id: number;
  course_title: string;
}

class TeacherService {
  private readonly basePath = '/v2/teacher';

  /**
   * Obtiene las estadísticas del profesor
   */
  async getStats(): Promise<TeacherStats> {
    const response = await apiClient.get(`${this.basePath}/stats`);
    return response.data;
  }

  /**
   * Obtiene la actividad reciente del profesor
   */
  async getRecentActivity(limit: number = 10): Promise<TeacherActivity[]> {
    const response = await apiClient.get(`${this.basePath}/activity`, {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Obtiene todos los estudiantes del profesor
   */
  async getStudents(filters?: {
    course_id?: number;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: Student[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await apiClient.get(`${this.basePath}/students`, {
      params: filters
    });
    return response.data;
  }

  /**
   * Obtiene los cursos del profesor con estadísticas detalladas
   */
  async getCoursesWithStats(): Promise<Array<{
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    total_students: number;
    total_lessons: number;
    avg_rating: number;
    total_revenue: number;
    completion_rate: number;
    created_at: string;
    updated_at: string;
  }>> {
    const response = await apiClient.get(`${this.basePath}/courses/stats`);
    return response.data;
  }

  /**
   * Actualiza un curso del profesor
   */
  async updateCourse(courseId: number, data: {
    title?: string;
    description?: string;
    price?: number;
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
    is_published?: boolean;
  }): Promise<any> {
    const response = await apiClient.put(`${this.basePath}/courses/${courseId}`, data);
    return response.data;
  }

  /**
   * Elimina un curso del profesor
   */
  async deleteCourse(courseId: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/courses/${courseId}`);
  }

  /**
   * Obtiene el progreso de los estudiantes en un curso específico
   */
  async getCourseProgress(courseId: number): Promise<Array<{
    student_id: number;
    student_name: string;
    student_email: string;
    progress: number;
    completed_lessons: number;
    total_lessons: number;
    last_activity: string;
    enrolled_at: string;
  }>> {
    const response = await apiClient.get(`${this.basePath}/courses/${courseId}/progress`);
    return response.data;
  }

  /**
   * Envía un mensaje/anuncio a los estudiantes de un curso
   */
  async sendCourseAnnouncement(courseId: number, data: {
    title: string;
    message: string;
    send_email?: boolean;
  }): Promise<void> {
    await apiClient.post(`${this.basePath}/courses/${courseId}/announcements`, data);
  }

  /**
   * Obtiene las reseñas de los cursos del profesor
   */
  async getReviews(filters?: {
    course_id?: number;
    rating?: number;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: Array<{
      id: number;
      student_name: string;
      course_title: string;
      rating: number;
      comment: string;
      created_at: string;
    }>;
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await apiClient.get(`${this.basePath}/reviews`, {
      params: filters
    });
    return response.data;
  }

  /**
   * Obtiene los ingresos del profesor
   */
  async getRevenue(period: 'week' | 'month' | 'year' = 'month'): Promise<{
    total_revenue: number;
    period_revenue: number;
    growth_percentage: number;
    revenue_by_course: Array<{
      course_id: number;
      course_title: string;
      revenue: number;
      students: number;
    }>;
    daily_revenue: Array<{
      date: string;
      revenue: number;
    }>;
  }> {
    const response = await apiClient.get(`${this.basePath}/revenue`, {
      params: { period }
    });
    return response.data;
  }
}

export const teacherService = new TeacherService();