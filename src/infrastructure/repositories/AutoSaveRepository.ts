/**
 * Repositorio para manejo de auto-guardado de cursos
 */

import { apiClient } from '../api/ApiClient';
import { logger } from '../../shared/utils/logger';

export interface DraftData {
  courseData?: any;
  builderData?: any;
  timestamp?: string;
  [key: string]: any;
}

export interface SaveDraftRequest {
  draft_data: DraftData;
  draft_type: 'auto' | 'manual';
}

export interface SaveDraftResponse {
  success: boolean;
  message: string;
  data: {
    draft_id: number;
    saved_at: string;
  };
}

export interface GetDraftResponse {
  success: boolean;
  data: {
    draft: DraftData | null;
    draft_type: string | null;
    saved_at: string | null;
  };
}

export class AutoSaveRepository {
  
  /**
   * Guardar borrador del curso
   */
  async saveDraft(courseId: number, draftData: DraftData, type: 'auto' | 'manual' = 'auto'): Promise<SaveDraftResponse> {
    try {
      logger.debug('💾 Guardando borrador:', { courseId, type, dataSize: JSON.stringify(draftData).length });
      
      const response = await apiClient.post<SaveDraftResponse>(`/teacher/courses/${courseId}/draft`, {
        draft_data: draftData,
        draft_type: type
      });

      logger.debug('✅ Borrador guardado exitosamente:', { courseId, draftId: response.data.draft_id });
      return response;
    } catch (error) {
      logger.error('❌ Error guardando borrador:', { courseId, error });
      throw error;
    }
  }

  /**
   * Obtener último borrador del curso
   */
  async getLatestDraft(courseId: number): Promise<GetDraftResponse> {
    try {
      logger.debug('📥 Obteniendo último borrador:', { courseId });
      
      const response = await apiClient.get<GetDraftResponse>(`/teacher/courses/${courseId}/draft`);
      
      logger.debug('✅ Borrador obtenido:', { 
        courseId, 
        hasDraft: !!response.data.draft,
        savedAt: response.data.saved_at 
      });
      
      return response;
    } catch (error) {
      logger.error('❌ Error obteniendo borrador:', { courseId, error });
      throw error;
    }
  }

  /**
   * Limpiar borradores antiguos
   */
  async cleanupDrafts(courseId: number): Promise<void> {
    try {
      logger.debug('🧹 Limpiando borradores antiguos:', { courseId });
      
      await apiClient.delete(`/teacher/courses/${courseId}/drafts/cleanup`);
      
      logger.debug('✅ Borradores limpiados exitosamente:', { courseId });
    } catch (error) {
      logger.error('❌ Error limpiando borradores:', { courseId, error });
      throw error;
    }
  }

  /**
   * Crear función de guardado para usar con HybridAutoSaveService
   */
  createSaveCallback(courseId: number, type: 'auto' | 'manual' = 'auto') {
    return async (data: DraftData): Promise<void> => {
      await this.saveDraft(courseId, data, type);
    };
  }
}

// Instancia singleton
export const autoSaveRepository = new AutoSaveRepository();