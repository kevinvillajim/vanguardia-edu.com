import { apiClient } from '../api/apiService';

export interface AdminCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  banner_image?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  price: number;
  rating: number;
  enrollment_count: number;
  is_featured: boolean;
  is_published: boolean;
  teacher: {
    id: number;
    name: string;
    avatar?: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  total_lessons?: number;
  created_at: string;
  updated_at?: string;
}

class AdminService {
  private readonly basePath = '/v2/admin';

  /**
   * Obtiene todos los cursos para administrador
   */
  async getAllCourses(): Promise<{ data: AdminCourse[]; meta?: any }> {
    const response = await apiClient.get(`${this.basePath}/courses`);
    return response.data;
  }

  /**
   * Obtiene el dashboard del administrador
   */
  async getDashboard() {
    const response = await apiClient.get(`${this.basePath}/dashboard`);
    return response.data;
  }
}

export const adminService = new AdminService();