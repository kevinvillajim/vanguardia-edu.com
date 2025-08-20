import { apiClient } from '../api/apiService';

export interface Course {
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
}

export interface CourseDetail extends Course {
  modules: CourseModule[];
  total_modules: number;
  total_duration_minutes: number;
  is_published: boolean;
  updated_at: string;
}

export interface CourseModule {
  id: number;
  title: string;
  description?: string;
  order_index: number;
  is_published: boolean;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  is_preview: boolean;
  is_published: boolean;
  order_index: number;
}

export interface CourseEnrollment {
  id: number;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  status: 'active' | 'completed' | 'dropped';
  course: Course;
  created_at: string;
  updated_at: string;
}

export interface CourseFilters {
  category_id?: number;
  difficulty_level?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'latest';
  per_page?: number;
}

export interface CreateCourseData {
  title: string;
  description: string;
  category_id?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours?: number;
  price?: number;
  banner_image?: File;
  is_featured?: boolean;
  modules?: {
    title: string;
    description?: string;
    order_index?: number;
    lessons?: {
      title: string;
      description?: string;
      duration_minutes?: number;
      is_preview?: boolean;
    }[];
  }[];
}

class CourseService {
  private baseUrl = '/v2/courses';

  async getCourses(filters: CourseFilters = {}) {
    const response = await apiClient.get(this.baseUrl, { params: filters });
    return response.data;
  }

  async getFeaturedCourses() {
    const response = await apiClient.get(`${this.baseUrl}/featured`);
    return response.data;
  }

  async getCourseBySlug(slug: string): Promise<{ data: CourseDetail; is_enrolled: boolean }> {
    const response = await apiClient.get(`${this.baseUrl}/${slug}`);
    return response.data;
  }

  async searchCourses(query: string, filters: CourseFilters = {}) {
    const response = await apiClient.get(`${this.baseUrl}/search`, {
      params: { q: query, ...filters }
    });
    return response.data;
  }

  // Teacher endpoints
  async createCourse(courseData: CreateCourseData) {
    const formData = new FormData();
    
    Object.entries(courseData).forEach(([key, value]) => {
      if (key === 'banner_image' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'modules' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await apiClient.post(this.baseUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateCourse(courseId: number, courseData: Partial<CreateCourseData>) {
    const formData = new FormData();
    
    Object.entries(courseData).forEach(([key, value]) => {
      if (key === 'banner_image' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await apiClient.put(`${this.baseUrl}/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteCourse(courseId: number) {
    const response = await apiClient.delete(`${this.baseUrl}/${courseId}`);
    return response.data;
  }

  async publishCourse(courseId: number) {
    const response = await apiClient.post(`${this.baseUrl}/${courseId}/publish`);
    return response.data;
  }

  async unpublishCourse(courseId: number) {
    const response = await apiClient.post(`${this.baseUrl}/${courseId}/unpublish`);
    return response.data;
  }

  async getTeacherCourses() {
    const response = await apiClient.get(`${this.baseUrl}/teacher/my-courses`);
    return response.data;
  }

  // Student endpoints
  async enrollInCourse(courseId: number) {
    const response = await apiClient.post(`${this.baseUrl}/${courseId}/enroll`);
    return response.data;
  }

  async getMyEnrollments(): Promise<{ data: CourseEnrollment[] }> {
    const response = await apiClient.get(`${this.baseUrl}/student/my-enrollments`);
    return response.data;
  }

  // Course management for teachers
  async getCourseStudents(courseId: number): Promise<{ data: CourseEnrollment[] }> {
    const response = await apiClient.get(`${this.baseUrl}/${courseId}/students`);
    return response.data;
  }

  async assignStudentToCourse(courseId: number, userId: number) {
    const response = await apiClient.post(`${this.baseUrl}/${courseId}/students`, {
      user_id: userId
    });
    return response.data;
  }

  async removeStudentFromCourse(courseId: number, userId: number) {
    const response = await apiClient.delete(`${this.baseUrl}/${courseId}/students/${userId}`);
    return response.data;
  }
}

export const courseService = new CourseService();