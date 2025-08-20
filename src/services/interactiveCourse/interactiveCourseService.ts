import { api } from '../api/client';
import { apiService } from '../api/apiService';

export interface StudentCourse {
  id: string;
  title: string;
  description: string;
  banner_image?: string;
  progress: number;
  final_score: number;
  enrollment_id: string;
  enrolled_at: string;
  certificates: {
    virtual: any;
    complete: any;
  };
}

export interface ModuleComponent {
  id: string;
  type: 'banner' | 'video' | 'reading' | 'image' | 'document' | 'audio';
  title: string;
  content?: string;
  file_url?: string;
  duration?: number;
  is_mandatory: boolean;
  is_completed: boolean;
  completed_at?: string;
}

export interface QuizData {
  id: string;
  title: string;
  description?: string;
  questions_count: number;
  time_limit?: number;
  max_attempts: number;
  attempts_used: number;
  best_score?: number;
  is_passed: boolean;
  can_attempt: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  components: ModuleComponent[];
  quiz?: QuizData;
  progress: number;
}

export interface CourseActivity {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'project' | 'essay' | 'presentation';
  max_score: number;
  due_date?: string;
  is_mandatory: boolean;
  status: 'pending' | 'submitted' | 'graded' | 'returned';
  score?: number;
  feedback?: string;
  submitted_at?: string;
  graded_at?: string;
  is_overdue: boolean;
}

export interface StudentCourseView {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  activities: CourseActivity[];
  progress: {
    overall: number;
    interactive: number;
    activities: number;
  };
  grades: {
    interactive_average: number;
    activities_average: number;
    final_score: number;
  };
  certificates: {
    virtual: boolean;
    complete: boolean;
    existing: {
      virtual: any;
      complete: any;
    };
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: Array<{
    id: number;
    text: string;
    letter: string;
  }>;
  points: number;
}

export interface QuizAttempt {
  attempt_id: string;
  quiz: {
    id: string;
    title: string;
    time_limit?: number;
    questions: QuizQuestion[];
  };
}

export interface TeacherCourse {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  modules_count: number;
  activities_count: number;
  students_count: number;
  created_at: string;
  clone_history: {
    is_clone: boolean;
    original_course?: any;
    cloned_courses: any[];
    total_clones: number;
  };
}

class InteractiveCourseService {
  // ========================================
  // SERVICIOS PARA ESTUDIANTES
  // ========================================

  /**
   * Obtiene la lista de cursos del estudiante
   */
  async getStudentCourses(): Promise<StudentCourse[]> {
    const response = await api.get('/student/courses');
    return response.data.data;
  }

  /**
   * Obtiene la vista detallada de un curso para el estudiante
   */
  async getStudentCourseView(courseId: string): Promise<StudentCourseView> {
    try {
      const response = await apiService.get(`/api/v2/student/courses/${courseId}/view`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching course view:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar el curso');
    }
  }

  /**
   * Obtiene el progreso del curso (compatible con backup)
   */
  async getCourseProgress(courseId: string): Promise<any> {
    try {
      const response = await apiService.get(`/api/v2/student/courses/${courseId}/progress`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching course progress:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar el progreso');
    }
  }

  /**
   * Obtiene los materiales del curso
   */
  async getCourseMaterials(courseId: string): Promise<any> {
    try {
      const response = await apiService.get(`/api/v2/student/courses/${courseId}/materials`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching course materials:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar los materiales');
    }
  }

  /**
   * Obtiene las actividades del curso
   */
  async getCourseActivities(courseId: string): Promise<any> {
    try {
      const response = await apiService.get(`/api/v2/student/courses/${courseId}/activities`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching course activities:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar las actividades');
    }
  }

  /**
   * Marca un componente como completado (nueva API)
   */
  async markComponentCompleted(courseId: string, componentId: string): Promise<any> {
    try {
      const response = await apiService.post(`/api/v2/student/courses/${courseId}/components/${componentId}/complete`);
      return response.data;
    } catch (error: any) {
      console.error('Error marking component as completed:', error);
      throw new Error(error.response?.data?.message || 'Error al marcar componente como completado');
    }
  }

  /**
   * Actualiza el progreso de un módulo
   */
  async updateModuleProgress(
    courseId: string, 
    moduleId: string, 
    completedComponents: number, 
    totalComponents: number
  ): Promise<any> {
    try {
      const response = await apiService.put(
        `/api/v2/student/courses/${courseId}/modules/${moduleId}/progress`,
        {
          completed_components: completedComponents,
          total_components: totalComponents
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating module progress:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el progreso');
    }
  }

  /**
   * Marca un componente como completado
   */
  async completeComponent(courseId: string, componentId: string): Promise<any> {
    const response = await api.post(`/student/courses/${courseId}/components/${componentId}/complete`);
    return response.data;
  }

  /**
   * Inicia un intento de quiz
   */
  async startQuizAttempt(quizId: string): Promise<QuizAttempt> {
    const response = await api.post(`/student/quizzes/${quizId}/start`);
    return response.data.data;
  }

  /**
   * Completa un intento de quiz
   */
  async completeQuizAttempt(attemptId: string, answers: Record<string, any>): Promise<any> {
    const response = await api.post(`/student/quiz-attempts/${attemptId}/complete`, {
      answers
    });
    return response.data;
  }

  /**
   * Genera un certificado
   */
  async generateCertificate(enrollmentId: string, type: 'virtual' | 'complete'): Promise<any> {
    const response = await api.post(`/student/enrollments/${enrollmentId}/certificate`, {
      type
    });
    return response.data;
  }

  // ========================================
  // SERVICIOS PARA PROFESORES
  // ========================================

  /**
   * Obtiene la lista de cursos del profesor
   */
  async getTeacherCourses(): Promise<TeacherCourse[]> {
    const response = await api.get('/teacher/courses');
    return response.data.data;
  }

  /**
   * Clona un curso
   */
  async cloneCourse(
    courseId: string, 
    options: {
      title_suffix?: string;
      clone_modules?: boolean;
      clone_activities?: boolean;
      clone_quizzes?: boolean;
    } = {}
  ): Promise<any> {
    const response = await api.post(`/teacher/courses/${courseId}/clone`, options);
    return response.data;
  }

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Calcula el tiempo restante para un quiz
   */
  calculateTimeRemaining(startTime: Date, timeLimit: number): number {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const remaining = (timeLimit * 60) - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Formatea el tiempo en formato MM:SS
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Calcula el porcentaje de progreso
   */
  calculateProgress(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  /**
   * Determina si una actividad está vencida
   */
  isActivityOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  /**
   * Obtiene el color del estado de una actividad
   */
  getActivityStatusColor(status: string): string {
    const colors = {
      pending: 'text-yellow-600 dark:text-yellow-400',
      submitted: 'text-blue-600 dark:text-blue-400',
      graded: 'text-green-600 dark:text-green-400',
      returned: 'text-purple-600 dark:text-purple-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
  }

  /**
   * Obtiene el icono para un tipo de componente
   */
  getComponentIcon(type: string): string {
    const icons = {
      banner: 'film',
      video: 'play-circle',
      reading: 'book-open',
      image: 'photo',
      document: 'document-text',
      audio: 'musical-note',
      quiz: 'clipboard-document-check'
    };
    return icons[type as keyof typeof icons] || 'document';
  }

  /**
   * Verifica si el estudiante puede obtener un certificado
   */
  canGetCertificate(
    type: 'virtual' | 'complete',
    progress: number,
    finalScore: number,
    virtualThreshold: number = 80,
    completeThreshold: number = 70
  ): boolean {
    if (type === 'virtual') {
      return progress >= virtualThreshold;
    }
    
    if (type === 'complete') {
      return progress >= virtualThreshold && finalScore >= completeThreshold;
    }
    
    return false;
  }

  // ========================================
  // MÉTODOS AUXILIARES PARA COMPATIBILIDAD (BACKUP STYLE)
  // ========================================

  /**
   * Guarda el progreso de un módulo en localStorage (estilo backup)
   */
  saveModuleProgress(courseId: string, moduleValue: string, progress: number): void {
    localStorage.setItem(`Course${courseId}${moduleValue}`, progress.toString());
  }

  /**
   * Obtiene el progreso de un módulo desde localStorage
   */
  getModuleProgress(courseId: string, moduleValue: string): number {
    const saved = localStorage.getItem(`Course${courseId}${moduleValue}`);
    return saved ? parseInt(saved) : 0;
  }

  /**
   * Guarda el índice del módulo abierto
   */
  saveOpenModuleIndex(courseId: string, index: number): void {
    localStorage.setItem(`Course${courseId}initialOpenIndex`, index.toString());
  }

  /**
   * Obtiene el índice del módulo abierto
   */
  getOpenModuleIndex(courseId: string): number {
    const saved = localStorage.getItem(`Course${courseId}initialOpenIndex`);
    return saved ? parseInt(saved) : 0;
  }

  /**
   * Obtiene el color para la barra de progreso (estilo backup)
   */
  getProgressColor(value: number): string {
    if (value <= 33) return "bg-red-500";
    if (value <= 66) return "bg-yellow-500";
    if (value <= 99) return "bg-green-500";
    return "bg-blue-500";
  }

  /**
   * Obtiene el ícono para el tipo de material (estilo backup)
   */
  getMaterialIcon(type: string): string {
    switch (type) {
      case 'pdf':
      case 'document':
        return '/pdf.webp';
      case 'video':
        return '/play.webp';
      case 'image':
        return '/image-icon.webp';
      case 'link':
        return '/link-icon.webp';
      default:
        return '/pdf.webp';
    }
  }

  /**
   * Transforma datos de API V2 al formato compatible con backup
   */
  transformCourseDataForBackup(apiData: any): any {
    return {
      id: apiData.id,
      title: apiData.title,
      description: apiData.description,
      modules: apiData.modules.map((module: any, index: number) => ({
        ...module,
        components: module.components.map((comp: any) => ({
          id: comp.id,
          type: comp.type,
          title: comp.title,
          content: comp.content || comp.rich_content,
          fileUrl: comp.file_url,
          duration: comp.estimated_duration,
          isCompleted: comp.is_completed,
          isMandatory: comp.is_mandatory,
          order: comp.order
        })),
        quiz: module.quiz ? {
          id: module.quiz.id,
          title: module.quiz.title,
          questions: module.quiz.questions,
          timeLimit: module.quiz.timeLimit,
          attempts: module.quiz.attempts,
          maxAttempts: module.quiz.maxAttempts,
          bestScore: module.quiz.bestScore,
          isPassed: module.quiz.isPassed
        } : null,
        progress: module.progress,
        order: module.order
      })),
      activities: apiData.activities || [],
      materials: apiData.materials.map((material: any) => ({
        id: material.id,
        title: material.title,
        description: material.description,
        type: material.type,
        fileUrl: material.fileUrl,
        fileName: material.fileName
      })),
      progress: {
        overall: apiData.progress.overall,
        interactive: apiData.progress.interactive,
        activities: apiData.progress.activities
      },
      grades: {
        interactiveAverage: apiData.grades.interactiveAverage,
        activitiesAverage: apiData.grades.activitiesAverage,
        finalScore: apiData.grades.finalScore
      },
      certificates: {
        virtual: apiData.certificates.virtual,
        complete: apiData.certificates.complete
      }
    };
  }

  /**
   * Genera un reporte de progreso del estudiante
   */
  generateProgressReport(courseView: StudentCourseView): any {
    const totalModules = courseView.modules.length;
    const completedModules = courseView.modules.filter(m => m.progress === 100).length;
    
    const totalActivities = courseView.activities.length;
    const completedActivities = courseView.activities.filter(a => a.status === 'graded').length;
    
    const totalComponents = courseView.modules.reduce((acc, m) => acc + m.components.length, 0);
    const completedComponents = courseView.modules.reduce(
      (acc, m) => acc + m.components.filter(c => c.is_completed).length, 
      0
    );

    return {
      overall_progress: courseView.progress.overall,
      modules: {
        total: totalModules,
        completed: completedModules,
        percentage: this.calculateProgress(completedModules, totalModules)
      },
      components: {
        total: totalComponents,
        completed: completedComponents,
        percentage: this.calculateProgress(completedComponents, totalComponents)
      },
      activities: {
        total: totalActivities,
        completed: completedActivities,
        percentage: this.calculateProgress(completedActivities, totalActivities)
      },
      grades: courseView.grades,
      certificates: courseView.certificates
    };
  }
}

export const interactiveCourseService = new InteractiveCourseService();