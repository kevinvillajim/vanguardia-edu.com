// src/services/courses/coursesV2Service.ts
import { apiClient } from '../api/apiService';
import { API_V2_ENDPOINTS } from '../api/endpoints';

/**
 * Servicio para cursos interactivos V2
 * Maneja las operaciones CRUD y funcionalidades específicas por rol
 */

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

export interface CourseProgress {
  overall: number;
  interactive: number;
  activities: number;
}

export interface CourseGrades {
  interactive_average: number;
  activities_average: number;
  final_score: number;
}

export interface Certificate {
  virtual: boolean;
  complete: boolean;
  existing: any[];
}

export interface StudentCourse {
  id: number;
  title: string;
  description: string;
  banner_image?: string;
  progress: number;
  final_score: number;
  enrollment_id: number;
  enrolled_at: string;
  certificates: any[];
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  components: ModuleComponent[];
  quiz?: Quiz;
  progress: number;
}

export interface ModuleComponent {
  id: number;
  type: string;
  title: string;
  content: any;
  file_url?: string;
  duration: number;
  is_mandatory: boolean;
  is_completed: boolean;
  completed_at?: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  questions_count: number;
  time_limit: number;
  max_attempts: number;
  attempts_used: number;
  best_score?: number;
  is_passed: boolean;
  can_attempt: boolean;
}

export interface CourseActivity {
  id: number;
  title: string;
  description: string;
  type: string;
  max_score: number;
  due_date?: string;
  is_mandatory: boolean;
  status: string;
  score?: number;
  feedback?: string;
  submitted_at?: string;
  graded_at?: string;
  is_overdue: boolean;
}

export interface CourseDetailView {
  id: number;
  title: string;
  description: string;
  modules: CourseModule[];
  activities: CourseActivity[];
  progress: CourseProgress;
  grades: CourseGrades;
  certificates: Certificate;
}

export interface TeacherCourse {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
  modules_count: number;
  activities_count: number;
  students_count: number;
  created_at: string;
  clone_history: any;
}

// ============================================================================
// SERVICIO PARA ESTUDIANTES
// ============================================================================
export const studentCoursesService = {
  /**
   * Obtiene la lista de cursos del estudiante
   */
  async getCourses(): Promise<StudentCourse[]> {
    try {
      const response = await apiClient.get('http://localhost:8000/api/v2/student/courses');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al obtener cursos');
    } catch (error) {
      console.error('Error in getCourses:', error);
      throw error;
    }
  },

  /**
   * Obtiene la vista detallada de un curso para estudiante
   */
  async getCourseView(courseId: number): Promise<CourseDetailView> {
    try {
      const response = await apiClient.get(`http://localhost:8000/api/v2/student/courses/${courseId}/view`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al obtener vista del curso');
    } catch (error) {
      console.error('Error in getCourseView:', error);
      throw error;
    }
  },

  /**
   * Marca un componente como completado
   */
  async completeComponent(courseId: number, componentId: number): Promise<any> {
    try {
      const response = await apiClient.post(
        `http://localhost:8000/api/v2/student/courses/${courseId}/components/${componentId}/complete`
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al completar componente');
    } catch (error) {
      console.error('Error in completeComponent:', error);
      throw error;
    }
  },

  /**
   * Inicia un intento de quiz
   */
  async startQuizAttempt(quizId: number): Promise<any> {
    try {
      const response = await apiClient.post(`http://localhost:8000/api/v2/student/quizzes/${quizId}/start`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al iniciar quiz');
    } catch (error) {
      console.error('Error in startQuizAttempt:', error);
      throw error;
    }
  },

  /**
   * Completa un intento de quiz
   */
  async completeQuizAttempt(attemptId: number, answers: any): Promise<any> {
    try {
      const response = await apiClient.post(
        `http://localhost:8000/api/v2/student/quiz-attempts/${attemptId}/complete`,
        { answers }
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al completar quiz');
    } catch (error) {
      console.error('Error in completeQuizAttempt:', error);
      throw error;
    }
  },

  /**
   * Genera un certificado
   */
  async generateCertificate(enrollmentId: number, type: 'virtual' | 'complete'): Promise<any> {
    try {
      const response = await apiClient.post(
        `http://localhost:8000/api/v2/student/enrollments/${enrollmentId}/certificate`,
        { type }
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al generar certificado');
    } catch (error) {
      console.error('Error in generateCertificate:', error);
      throw error;
    }
  },
};

// ============================================================================
// SERVICIO PARA PROFESORES
// ============================================================================
export const teacherCoursesService = {
  /**
   * Obtiene la lista de cursos del profesor
   */
  async getCourses(): Promise<TeacherCourse[]> {
    try {
      const response = await apiClient.get('http://localhost:8000/api/v2/teacher/courses');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al obtener cursos');
    } catch (error) {
      console.error('Error in getCourses:', error);
      throw error;
    }
  },

  /**
   * Clona un curso
   */
  async cloneCourse(courseId: number, options?: any): Promise<any> {
    try {
      const response = await apiClient.post(
        `http://localhost:8000/api/v2/teacher/courses/${courseId}/clone`,
        options || {}
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al clonar curso');
    } catch (error) {
      console.error('Error in cloneCourse:', error);
      throw error;
    }
  },
};

// ============================================================================
// SERVICIO PARA ADMINISTRADORES
// ============================================================================
export const adminCoursesService = {
  /**
   * Obtiene la lista de todos los cursos (admin)
   */
  async getAllCourses(): Promise<any[]> {
    try {
      const response = await apiClient.get('http://localhost:8000/api/v2/admin/courses');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al obtener cursos');
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      throw error;
    }
  },

  /**
   * Obtiene el dashboard del admin
   */
  async getDashboard(): Promise<any> {
    try {
      const response = await apiClient.get('http://localhost:8000/api/v2/admin/dashboard');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al obtener dashboard');
    } catch (error) {
      console.error('Error in getDashboard:', error);
      throw error;
    }
  },

  /**
   * Obtiene configuraciones del sistema
   */
  async getSystemSettings(): Promise<any> {
    try {
      const response = await apiClient.get('http://localhost:8000/api/v2/admin/system-settings');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al obtener configuraciones');
    } catch (error) {
      console.error('Error in getSystemSettings:', error);
      throw error;
    }
  },

  /**
   * Actualiza configuraciones del sistema
   */
  async updateSystemSettings(settings: any): Promise<any> {
    try {
      const response = await apiClient.put('http://localhost:8000/api/v2/admin/system-settings', settings);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Error al actualizar configuraciones');
    } catch (error) {
      console.error('Error in updateSystemSettings:', error);
      throw error;
    }
  },
};

// ============================================================================
// SERVICIO CONSOLIDADO
// ============================================================================
export const coursesV2Service = {
  student: studentCoursesService,
  teacher: teacherCoursesService,
  admin: adminCoursesService,
};

export default coursesV2Service;