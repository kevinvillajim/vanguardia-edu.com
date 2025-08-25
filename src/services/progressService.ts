import { ApiClient } from '../infrastructure/api/ApiClient';
import { logger } from '../shared/utils/logger';

export interface ComponentProgress {
  componentId: string;
  componentType: string;
  completed: boolean;
  completedAt?: Date;
  data?: any; // Datos específicos del progreso (tiempo visto, intentos de quiz, etc.)
}

export interface ModuleProgress {
  moduleId: string;
  components: ComponentProgress[];
  mandatoryCompleted: number;
  totalMandatory: number;
  canAccessFinalQuiz: boolean;
}

class ProgressService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * Registrar que un componente de documento fue descargado
   */
  async recordDocumentDownload(
    courseId: number,
    moduleId: string, 
    componentId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Por ahora registramos en localStorage como cache local
      // TODO: Implementar llamada al backend cuando esté listo
      const progressKey = `progress_${courseId}_${moduleId}`;
      const existingProgress = this.getLocalProgress(courseId, moduleId);
      
      const updatedProgress = {
        ...existingProgress,
        [componentId]: {
          componentId,
          componentType: 'document',
          completed: true,
          completedAt: new Date(),
          data: {
            downloaded: true,
            downloadedAt: new Date().toISOString()
          }
        }
      };

      localStorage.setItem(progressKey, JSON.stringify(updatedProgress));
      
      logger.debug('Document download recorded:', {
        courseId,
        moduleId,
        componentId,
        timestamp: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Error recording document download:', error);
      return { success: false, error: 'Failed to record progress' };
    }
  }

  /**
   * Registrar progreso de video (cuando se complete)
   */
  async recordVideoProgress(
    courseId: number,
    moduleId: string, 
    componentId: string,
    timeWatched: number,
    totalTime: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const progressKey = `progress_${courseId}_${moduleId}`;
      const existingProgress = this.getLocalProgress(courseId, moduleId);
      
      const isCompleted = timeWatched / totalTime >= 0.8; // 80% completed
      
      const updatedProgress = {
        ...existingProgress,
        [componentId]: {
          componentId,
          componentType: 'video',
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : undefined,
          data: {
            timeWatched,
            totalTime,
            completionPercentage: (timeWatched / totalTime) * 100
          }
        }
      };

      localStorage.setItem(progressKey, JSON.stringify(updatedProgress));
      
      logger.debug('Video progress recorded:', {
        courseId,
        moduleId,
        componentId,
        completed: isCompleted,
        percentage: (timeWatched / totalTime) * 100
      });

      return { success: true };
    } catch (error) {
      console.error('Error recording video progress:', error);
      return { success: false, error: 'Failed to record progress' };
    }
  }

  /**
   * Registrar progreso de audio
   */
  async recordAudioProgress(
    courseId: number,
    moduleId: string, 
    componentId: string,
    timeListened: number,
    totalTime: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const progressKey = `progress_${courseId}_${moduleId}`;
      const existingProgress = this.getLocalProgress(courseId, moduleId);
      
      const isCompleted = timeListened / totalTime >= 0.8; // 80% completed
      
      const updatedProgress = {
        ...existingProgress,
        [componentId]: {
          componentId,
          componentType: 'audio',
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : undefined,
          data: {
            timeListened,
            totalTime,
            completionPercentage: (timeListened / totalTime) * 100
          }
        }
      };

      localStorage.setItem(progressKey, JSON.stringify(updatedProgress));
      
      logger.debug('Audio progress recorded:', {
        courseId,
        moduleId,
        componentId,
        completed: isCompleted,
        percentage: (timeListened / totalTime) * 100
      });

      return { success: true };
    } catch (error) {
      console.error('Error recording audio progress:', error);
      return { success: false, error: 'Failed to record progress' };
    }
  }

  /**
   * Registrar completación de quiz
   */
  async recordQuizCompletion(
    courseId: number,
    moduleId: string, 
    componentId: string,
    score: number,
    maxScore: number,
    passed: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const progressKey = `progress_${courseId}_${moduleId}`;
      const existingProgress = this.getLocalProgress(courseId, moduleId);
      
      const updatedProgress = {
        ...existingProgress,
        [componentId]: {
          componentId,
          componentType: 'quiz',
          completed: passed,
          completedAt: passed ? new Date() : undefined,
          data: {
            score,
            maxScore,
            percentage: (score / maxScore) * 100,
            passed,
            completedAt: new Date().toISOString()
          }
        }
      };

      localStorage.setItem(progressKey, JSON.stringify(updatedProgress));
      
      logger.debug('Quiz completion recorded:', {
        courseId,
        moduleId,
        componentId,
        passed,
        score: `${score}/${maxScore}`
      });

      return { success: true };
    } catch (error) {
      console.error('Error recording quiz completion:', error);
      return { success: false, error: 'Failed to record progress' };
    }
  }

  /**
   * Obtener progreso local del localStorage
   */
  private getLocalProgress(courseId: number, moduleId: string): Record<string, ComponentProgress> {
    try {
      const progressKey = `progress_${courseId}_${moduleId}`;
      const stored = localStorage.getItem(progressKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting local progress:', error);
      return {};
    }
  }

  /**
   * Verificar si un estudiante puede acceder al quiz final
   */
  canAccessFinalQuiz(
    courseId: number, 
    moduleId: string, 
    moduleComponents: any[], 
    finalQuizId: string
  ): boolean {
    try {
      const progress = this.getLocalProgress(courseId, moduleId);
      
      // Obtener todos los componentes obligatorios antes del quiz final
      const finalQuizIndex = moduleComponents.findIndex(c => c.id === finalQuizId);
      const componentsBeforeQuiz = moduleComponents.slice(0, finalQuizIndex);
      const mandatoryBefore = componentsBeforeQuiz.filter(c => c.isMandatory);
      
      // Verificar si todos los componentes obligatorios están completados
      const completedMandatory = mandatoryBefore.filter(component => {
        const componentProgress = progress[component.id];
        return componentProgress && componentProgress.completed;
      });
      
      const canAccess = completedMandatory.length === mandatoryBefore.length;
      
      logger.debug('Final quiz access check:', {
        moduleId,
        finalQuizId,
        mandatoryBefore: mandatoryBefore.length,
        completedMandatory: completedMandatory.length,
        canAccess
      });
      
      return canAccess;
    } catch (error) {
      console.error('Error checking final quiz access:', error);
      return false; // Por seguridad, denegar acceso en caso de error
    }
  }

  /**
   * Obtener estadísticas de progreso del módulo
   */
  getModuleProgress(courseId: number, moduleId: string, moduleComponents: any[]): ModuleProgress {
    try {
      const progress = this.getLocalProgress(courseId, moduleId);
      const mandatoryComponents = moduleComponents.filter(c => c.isMandatory);
      
      const components: ComponentProgress[] = moduleComponents.map(component => {
        const componentProgress = progress[component.id];
        return componentProgress || {
          componentId: component.id,
          componentType: component.type,
          completed: false
        };
      });
      
      const mandatoryCompleted = mandatoryComponents.filter(component => {
        const componentProgress = progress[component.id];
        return componentProgress && componentProgress.completed;
      }).length;
      
      // Encontrar el quiz final
      const quizzes = moduleComponents.filter(c => c.type === 'quiz');
      const finalQuiz = quizzes[quizzes.length - 1];
      const canAccessFinalQuiz = finalQuiz ? 
        this.canAccessFinalQuiz(courseId, moduleId, moduleComponents, finalQuiz.id) : 
        true;
      
      return {
        moduleId,
        components,
        mandatoryCompleted,
        totalMandatory: mandatoryComponents.length,
        canAccessFinalQuiz
      };
    } catch (error) {
      console.error('Error getting module progress:', error);
      return {
        moduleId,
        components: [],
        mandatoryCompleted: 0,
        totalMandatory: 0,
        canAccessFinalQuiz: false
      };
    }
  }

  /**
   * Limpiar progreso local (útil para testing)
   */
  clearProgress(courseId: number, moduleId: string): void {
    const progressKey = `progress_${courseId}_${moduleId}`;
    localStorage.removeItem(progressKey);
    logger.debug('Progress cleared for:', { courseId, moduleId });
  }
}

export const progressService = new ProgressService();
export default progressService;