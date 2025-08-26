/**
 * Hook para manejo de uploads con estado avanzado
 * Incluye progreso, reintentos automáticos y manejo de errores
 */

import { useState, useCallback, useRef } from 'react';
import { uploadService } from '../services/uploadService';
import { 
  UploadResult, 
  UploadProgress, 
  UploadOptions, 
  UploadError,
  UploadType 
} from '../shared/types/upload';
import { UploadErrorHandler } from '../services/uploadErrorHandler';
import { logger } from '../shared/utils/logger';

export interface UploadState {
  isUploading: boolean;
  progress: UploadProgress | null;
  result: UploadResult | null;
  error: UploadError | null;
  canRetry: boolean;
  retryCount: number;
  uploadId: string | null;
}

export interface UseUploadReturn {
  state: UploadState;
  uploadFile: (file: File, type?: UploadType, options?: UploadOptions) => Promise<UploadResult>;
  uploadCourseBanner: (courseId: number, file: File, options?: UploadOptions) => Promise<UploadResult>;
  cancelUpload: () => void;
  retry: () => Promise<UploadResult | null>;
  reset: () => void;
  // Shortcuts
  isUploading: boolean;
  progress: UploadProgress | null;
  error: UploadError | null;
  result: UploadResult | null;
  canRetry: boolean;
}

const initialState: UploadState = {
  isUploading: false,
  progress: null,
  result: null,
  error: null,
  canRetry: false,
  retryCount: 0,
  uploadId: null
};

/**
 * Hook principal para uploads
 */
export function useUpload(): UseUploadReturn {
  const [state, setState] = useState<UploadState>(initialState);
  const lastUploadRef = useRef<{
    file: File;
    type?: UploadType;
    options?: UploadOptions;
    method: 'file' | 'banner';
    courseId?: number;
  } | null>(null);

  /**
   * Actualizar estado de upload
   */
  const updateState = useCallback((updates: Partial<UploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Resetear estado
   */
  const reset = useCallback(() => {
    if (state.uploadId) {
      uploadService.cancelUpload(state.uploadId);
    }
    setState(initialState);
    lastUploadRef.current = null;
  }, [state.uploadId]);

  /**
   * Manejar progreso del upload
   */
  const handleProgress = useCallback((progress: UploadProgress) => {
    updateState({ progress });
    logger.debug('📊 Upload progress:', progress);
  }, [updateState]);

  /**
   * Manejar reintento
   */
  const handleRetry = useCallback((attempt: number, error: UploadError) => {
    updateState({ 
      retryCount: attempt,
      error,
      canRetry: UploadErrorHandler.isRecoverable(error)
    });
    logger.info(`🔄 Upload retry attempt ${attempt}:`, error.message);
  }, [updateState]);

  /**
   * Upload de archivo genérico
   */
  const uploadFile = useCallback(async (
    file: File,
    type?: UploadType,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    try {
      logger.info('🚀 Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        type
      });

      // Resetear estado previo
      updateState({
        isUploading: true,
        progress: null,
        result: null,
        error: null,
        canRetry: false,
        retryCount: 0,
        uploadId: `upload_${Date.now()}`
      });

      // Guardar para posible reintento
      lastUploadRef.current = {
        file,
        type,
        options,
        method: 'file'
      };

      // Configurar callbacks
      const uploadOptions: UploadOptions = {
        ...options,
        onProgress: (progress) => {
          handleProgress(progress);
          options.onProgress?.(progress);
        },
        onRetry: (attempt, error) => {
          handleRetry(attempt, error);
          options.onRetry?.(attempt, error);
        }
      };

      const result = await uploadService.uploadFile(file, type, uploadOptions);

      if (result.success) {
        updateState({
          isUploading: false,
          result,
          progress: { loaded: file.size, total: file.size, percentage: 100 }
        });
        logger.success('✅ File upload completed successfully');
      } else {
        updateState({
          isUploading: false,
          error: result.error || null,
          canRetry: result.error ? UploadErrorHandler.isRecoverable(result.error) : false
        });
        logger.error('❌ File upload failed:', result.error);
      }

      return result;

    } catch (error: any) {
      const uploadError = UploadErrorHandler.createError(
        'UNKNOWN_ERROR',
        'Error inesperado en el upload',
        { originalError: error }
      );

      updateState({
        isUploading: false,
        error: uploadError,
        canRetry: false
      });

      logger.error('💥 Unexpected upload error:', error);
      return UploadErrorHandler.createErrorResult(uploadError);
    }
  }, [updateState, handleProgress, handleRetry]);

  /**
   * Upload de banner de curso
   */
  const uploadCourseBanner = useCallback(async (
    courseId: number,
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    try {
      logger.info('🖼️ Starting course banner upload:', {
        courseId,
        fileName: file.name,
        fileSize: file.size
      });

      // Resetear estado previo
      updateState({
        isUploading: true,
        progress: null,
        result: null,
        error: null,
        canRetry: false,
        retryCount: 0,
        uploadId: `banner_${courseId}_${Date.now()}`
      });

      // Guardar para posible reintento
      lastUploadRef.current = {
        file,
        options,
        method: 'banner',
        courseId
      };

      // Configurar callbacks
      const uploadOptions: UploadOptions = {
        ...options,
        onProgress: handleProgress,
        onRetry: handleRetry
      };

      const result = await uploadService.uploadCourseBanner(courseId, file, uploadOptions);

      if (result.success) {
        updateState({
          isUploading: false,
          result,
          progress: { loaded: file.size, total: file.size, percentage: 100 }
        });
        logger.success('✅ Banner upload completed successfully');
      } else {
        updateState({
          isUploading: false,
          error: result.error || null,
          canRetry: result.error ? UploadErrorHandler.isRecoverable(result.error) : false
        });
        logger.error('❌ Banner upload failed:', result.error);
      }

      return result;

    } catch (error: any) {
      const uploadError = UploadErrorHandler.createError(
        'UNKNOWN_ERROR',
        'Error inesperado en el upload del banner',
        { originalError: error, courseId }
      );

      updateState({
        isUploading: false,
        error: uploadError,
        canRetry: false
      });

      logger.error('💥 Unexpected banner upload error:', error);
      return UploadErrorHandler.createErrorResult(uploadError);
    }
  }, [updateState, handleProgress, handleRetry]);

  /**
   * Cancelar upload activo
   */
  const cancelUpload = useCallback(() => {
    if (state.uploadId && state.isUploading) {
      uploadService.cancelUpload(state.uploadId);
      updateState({
        isUploading: false,
        error: UploadErrorHandler.createError(
          'UPLOAD_CANCELLED',
          'Upload cancelado por el usuario'
        )
      });
      logger.info('🛑 Upload cancelled by user');
    }
  }, [state.uploadId, state.isUploading, updateState]);

  /**
   * Reintentar último upload
   */
  const retry = useCallback(async (): Promise<UploadResult | null> => {
    const lastUpload = lastUploadRef.current;
    if (!lastUpload || !state.canRetry) {
      logger.warn('⚠️ Cannot retry: no previous upload or not retryable');
      return null;
    }

    logger.info('🔄 Retrying last upload');

    if (lastUpload.method === 'banner' && lastUpload.courseId) {
      return uploadCourseBanner(lastUpload.courseId, lastUpload.file, lastUpload.options);
    } else {
      return uploadFile(lastUpload.file, lastUpload.type, lastUpload.options);
    }
  }, [state.canRetry, uploadFile, uploadCourseBanner]);

  return {
    state,
    uploadFile,
    uploadCourseBanner,
    cancelUpload,
    retry,
    reset,
    // Shortcuts for convenience
    isUploading: state.isUploading,
    progress: state.progress,
    error: state.error,
    result: state.result,
    canRetry: state.canRetry
  };
}

/**
 * Hook especializado para upload de múltiples archivos
 */
export function useMultipleUploads() {
  const [uploads, setUploads] = useState<Map<string, UseUploadReturn>>(new Map());

  const createUpload = useCallback((id: string): UseUploadReturn => {
    const upload = useUpload();
    setUploads(prev => new Map(prev).set(id, upload));
    return upload;
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads(prev => {
      const newMap = new Map(prev);
      const upload = newMap.get(id);
      if (upload && upload.isUploading) {
        upload.cancelUpload();
      }
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const cancelAll = useCallback(() => {
    uploads.forEach(upload => {
      if (upload.isUploading) {
        upload.cancelUpload();
      }
    });
    setUploads(new Map());
  }, [uploads]);

  const getUpload = useCallback((id: string): UseUploadReturn | undefined => {
    return uploads.get(id);
  }, [uploads]);

  const getAllUploads = useCallback((): UseUploadReturn[] => {
    return Array.from(uploads.values());
  }, [uploads]);

  const isAnyUploading = useCallback((): boolean => {
    return Array.from(uploads.values()).some(upload => upload.isUploading);
  }, [uploads]);

  return {
    createUpload,
    removeUpload,
    cancelAll,
    getUpload,
    getAllUploads,
    isAnyUploading,
    activeUploads: uploads.size
  };
}