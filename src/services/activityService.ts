/**
 * Servicio de Actividades - MVP
 * 
 * Maneja todas las operaciones relacionadas con actividades,
 * entregas y calificaciones
 */

import { ApiClient } from '../infrastructure/api/ApiClient';
import { 
  Activity, 
  ActivitySubmission, 
  ActivityStats,
  CreateActivityData,
  SubmitActivityData,
  GradeActivityData
} from '../domain/entities/Activity';
import { createComponentLogger } from '../shared/utils/logger';

const logger = createComponentLogger('ActivityService');

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ActivityService {
  private apiClient = ApiClient;

  // ========================================
  // TEACHER OPERATIONS
  // ========================================

  /**
   * Crear una nueva actividad
   */
  async createActivity(activityData: CreateActivityData): Promise<ApiResponse<Activity>> {
    try {
      logger.info('Creating activity:', activityData.title);
      
      const response = await this.apiClient.post('/teacher/activities', activityData);
      
      logger.success('Activity created successfully:', response.data?.id);
      return {
        success: true,
        data: response.data,
        message: 'Actividad creada exitosamente'
      };
    } catch (error: any) {
      logger.error('Error creating activity:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error creando la actividad'
      };
    }
  }

  /**
   * Obtener actividades de un curso (para profesor)
   */
  async getActivitiesByCourse(courseId: number): Promise<ApiResponse<Activity[]>> {
    try {
      logger.debug('Fetching activities for course:', courseId);
      
      const response = await this.apiClient.get(`/teacher/courses/${courseId}/activities`);
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      logger.error('Error fetching course activities:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Error obteniendo actividades'
      };
    }
  }

  /**
   * Obtener entregas de una actividad (para profesor)
   */
  async getActivitySubmissions(activityId: string): Promise<ApiResponse<ActivitySubmission[]>> {
    try {
      logger.debug('Fetching submissions for activity:', activityId);
      
      const response = await this.apiClient.get(`/teacher/activities/${activityId}/submissions`);
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      logger.error('Error fetching activity submissions:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Error obteniendo entregas'
      };
    }
  }

  /**
   * Calificar una entrega
   */
  async gradeSubmission(gradeData: GradeActivityData): Promise<ApiResponse<ActivitySubmission>> {
    try {
      logger.info('Grading submission:', gradeData.submissionId);
      
      const response = await this.apiClient.put(
        `/teacher/submissions/${gradeData.submissionId}/grade`, 
        gradeData
      );
      
      logger.success('Submission graded successfully');
      return {
        success: true,
        data: response.data,
        message: 'Calificación asignada exitosamente'
      };
    } catch (error: any) {
      logger.error('Error grading submission:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error calificando la entrega'
      };
    }
  }

  /**
   * Obtener estadísticas de una actividad
   */
  async getActivityStats(activityId: string): Promise<ApiResponse<ActivityStats>> {
    try {
      const response = await this.apiClient.get(`/teacher/activities/${activityId}/stats`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error('Error fetching activity stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error obteniendo estadísticas'
      };
    }
  }

  // ========================================
  // STUDENT OPERATIONS
  // ========================================

  /**
   * Obtener actividades disponibles para el estudiante
   */
  async getStudentActivities(courseId: number): Promise<ApiResponse<Activity[]>> {
    try {
      logger.debug('Fetching student activities for course:', courseId);
      
      const response = await this.apiClient.get(`/student/courses/${courseId}/activities`);
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      logger.error('Error fetching student activities:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Error obteniendo actividades'
      };
    }
  }

  /**
   * Obtener entrega del estudiante para una actividad
   */
  async getStudentSubmission(activityId: string): Promise<ApiResponse<ActivitySubmission | null>> {
    try {
      const response = await this.apiClient.get(`/student/activities/${activityId}/submission`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No hay entrega aún
        return {
          success: true,
          data: null
        };
      }
      
      logger.error('Error fetching student submission:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error obteniendo entrega'
      };
    }
  }

  /**
   * Enviar/actualizar entrega de actividad
   */
  async submitActivity(submissionData: SubmitActivityData): Promise<ApiResponse<ActivitySubmission>> {
    try {
      logger.info('Submitting activity:', submissionData.activityId);
      
      // Preparar FormData para envío de archivos
      const formData = new FormData();
      formData.append('activityId', submissionData.activityId);
      
      if (submissionData.studentNotes) {
        formData.append('studentNotes', submissionData.studentNotes);
      }
      
      // Agregar archivos
      submissionData.files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      const response = await this.apiClient.postForm('/student/activities/submit', formData);
      
      logger.success('Activity submitted successfully');
      return {
        success: true,
        data: response.data,
        message: 'Actividad entregada exitosamente'
      };
    } catch (error: any) {
      logger.error('Error submitting activity:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error entregando la actividad'
      };
    }
  }

  /**
   * Descargar archivo de entrega
   */
  async downloadSubmissionFile(fileId: string, fileName: string): Promise<void> {
    try {
      const response = await this.apiClient.get(`/files/submissions/${fileId}`, {
        responseType: 'blob'
      });
      
      // Crear enlace de descarga
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      
      logger.info('File downloaded:', fileName);
    } catch (error) {
      logger.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Eliminar una actividad (solo profesor)
   */
  async deleteActivity(activityId: string): Promise<ApiResponse> {
    try {
      await this.apiClient.delete(`/teacher/activities/${activityId}`);
      
      logger.success('Activity deleted');
      return {
        success: true,
        message: 'Actividad eliminada exitosamente'
      };
    } catch (error: any) {
      logger.error('Error deleting activity:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error eliminando la actividad'
      };
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Validar archivos antes de enviar
   */
  validateFiles(files: File[], activity: Activity): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Verificar cantidad de archivos
    if (files.length > activity.maxFiles) {
      errors.push(`Máximo ${activity.maxFiles} archivos permitidos`);
    }
    
    // Verificar cada archivo
    files.forEach((file, index) => {
      // Tamaño
      if (file.size > activity.maxFileSize) {
        errors.push(`Archivo ${index + 1}: Tamaño máximo ${this.formatFileSize(activity.maxFileSize)}`);
      }
      
      // Tipo
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension && !activity.allowedFileTypes.includes(fileExtension)) {
        errors.push(`Archivo ${index + 1}: Tipo ${fileExtension} no permitido`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatear tamaño de archivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Verificar si la actividad está vencida
   */
  isActivityOverdue(activity: Activity): boolean {
    return new Date() > new Date(activity.dueDate);
  }

  /**
   * Calcular tiempo restante hasta la fecha límite
   */
  getTimeUntilDue(activity: Activity): { text: string; isOverdue: boolean } {
    const now = new Date();
    const dueDate = new Date(activity.dueDate);
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { text: 'Vencida', isOverdue: true };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { text: `${days} día${days !== 1 ? 's' : ''}`, isOverdue: false };
    } else if (hours > 0) {
      return { text: `${hours} hora${hours !== 1 ? 's' : ''}`, isOverdue: false };
    } else {
      return { text: `${minutes} minuto${minutes !== 1 ? 's' : ''}`, isOverdue: false };
    }
  }
}

export const activityService = new ActivityService();
export default activityService;