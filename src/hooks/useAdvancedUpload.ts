/**
 * Hook avanzado para uploads con procesamiento y análisis de archivos
 * Incluye compresión, chunks, thumbnails y análisis de archivos
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUpload } from './useUpload';
import { uploadService } from '../services/uploadService';
import { fileProcessingService } from '../services/fileProcessingService';
import { 
  UploadResult, 
  UploadOptions, 
  UploadType,
  UploadProgress 
} from '../shared/types/upload';
import { logger } from '../shared/utils/logger';

export interface FileAnalysis {
  info: ReturnType<typeof fileProcessingService.getFileInfo>;
  metadata: any;
  recommendations: string[];
  estimatedProcessingTime?: number;
}

export interface ProcessingOptions {
  enableImageCompression?: boolean;
  enableVideoOptimization?: boolean;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
  maxImageDimensions?: { width: number; height: number };
  imageQuality?: number;
}

export interface AdvancedUploadState {
  // Estados básicos
  isAnalyzing: boolean;
  isProcessing: boolean;
  isUploading: boolean;
  
  // Progreso detallado
  analysisProgress: number;
  processingProgress: number;
  uploadProgress: UploadProgress | null;
  
  // Resultados
  analysis: FileAnalysis | null;
  processingResult: any | null;
  uploadResult: UploadResult | null;
  
  // Control
  canCancel: boolean;
  canRetry: boolean;
  
  // Errores
  error: any | null;
}

export interface UseAdvancedUploadReturn {
  state: AdvancedUploadState;
  
  // Funciones principales
  analyzeFile: (file: File) => Promise<FileAnalysis>;
  uploadWithProcessing: (
    file: File, 
    type?: UploadType, 
    options?: ProcessingOptions & UploadOptions
  ) => Promise<UploadResult>;
  uploadMultipleFiles: (
    files: File[], 
    type?: UploadType, 
    options?: ProcessingOptions & UploadOptions
  ) => Promise<UploadResult[]>;
  
  // Funciones específicas
  generateThumbnail: (file: File, size?: number) => Promise<UploadResult>;
  resumeUpload: (file: File, uploadId: string) => Promise<UploadResult>;
  
  // Control
  cancel: () => void;
  retry: () => Promise<UploadResult | null>;
  reset: () => void;
  
  // Shortcuts
  totalProgress: number;
  isActive: boolean;
  hasError: boolean;
}

const initialState: AdvancedUploadState = {
  isAnalyzing: false,
  isProcessing: false,
  isUploading: false,
  analysisProgress: 0,
  processingProgress: 0,
  uploadProgress: null,
  analysis: null,
  processingResult: null,
  uploadResult: null,
  canCancel: false,
  canRetry: false,
  error: null
};

/**
 * Hook principal para uploads avanzados
 */
export function useAdvancedUpload(): UseAdvancedUploadReturn {
  const [state, setState] = useState<AdvancedUploadState>(initialState);
  const basicUpload = useUpload();
  const lastOperationRef = useRef<{
    type: 'single' | 'multiple' | 'thumbnail' | 'resume';
    file?: File;
    files?: File[];
    uploadType?: UploadType;
    options?: any;
    uploadId?: string;
  } | null>(null);

  /**
   * Actualizar estado
   */
  const updateState = useCallback((updates: Partial<AdvancedUploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Analizar archivo
   */
  const analyzeFile = useCallback(async (file: File): Promise<FileAnalysis> => {
    updateState({ isAnalyzing: true, analysisProgress: 0, error: null });
    
    try {
      logger.debug('🔍 Starting file analysis:', { fileName: file.name, size: file.size });
      
      // Simular progreso de análisis
      updateState({ analysisProgress: 25 });
      
      const analysis = await uploadService.analyzeFile(file);
      
      updateState({ 
        analysisProgress: 100, 
        analysis,
        isAnalyzing: false 
      });
      
      logger.success('✅ File analysis completed:', analysis.recommendations);
      return analysis;
      
    } catch (error: any) {
      logger.error('❌ File analysis failed:', error);
      updateState({ 
        isAnalyzing: false, 
        error,
        analysisProgress: 0 
      });
      throw error;
    }
  }, [updateState]);

  /**
   * Upload con procesamiento avanzado
   */
  const uploadWithProcessing = useCallback(async (
    file: File,
    type?: UploadType,
    options: ProcessingOptions & UploadOptions = {}
  ): Promise<UploadResult> => {
    
    // Resetear estado
    updateState({ 
      ...initialState,
      isAnalyzing: true,
      canCancel: true
    });
    
    // Guardar para retry
    lastOperationRef.current = {
      type: 'single',
      file,
      uploadType: type,
      options
    };

    try {
      logger.info('🚀 Starting advanced upload with processing:', {
        fileName: file.name,
        fileSize: file.size,
        type,
        options
      });

      // Paso 1: Análisis del archivo
      const analysis = await analyzeFile(file);
      
      // Paso 2: Procesamiento si es necesario
      let processedFile = file;
      let processingResult = null;
      
      const needsProcessing = (
        (analysis.info.isImage && options.enableImageCompression) ||
        (analysis.info.isVideo && options.enableVideoOptimization) ||
        options.generateThumbnail
      );

      if (needsProcessing) {
        updateState({ 
          isProcessing: true, 
          processingProgress: 0,
          isAnalyzing: false 
        });

        // Procesar imagen
        if (analysis.info.isImage && options.enableImageCompression) {
          updateState({ processingProgress: 25 });
          
          const result = await fileProcessingService.processImage(file, {
            maxWidth: options.maxImageDimensions?.width || 1920,
            maxHeight: options.maxImageDimensions?.height || 1080,
            quality: options.imageQuality || 0.85,
            format: 'webp'
          });
          
          if (result.success && result.processedFile) {
            processedFile = result.processedFile;
            processingResult = result;
            updateState({ processingProgress: 75 });
          }
        }

        // Generar thumbnail si se solicita
        if (options.generateThumbnail && analysis.info.isImage) {
          updateState({ processingProgress: 90 });
          // El thumbnail se puede generar después del upload principal
        }

        updateState({ 
          processingProgress: 100,
          processingResult,
          isProcessing: false
        });
      }

      // Paso 3: Upload del archivo
      updateState({ 
        isUploading: true,
        isProcessing: false
      });

      const uploadOptions: UploadOptions = {
        ...options,
        onProgress: (progress) => {
          updateState({ uploadProgress: progress });
          options.onProgress?.(progress);
        },
        onRetry: (attempt, error) => {
          logger.warn(`🔄 Upload retry ${attempt}:`, error.message);
          options.onRetry?.(attempt, error);
        }
      };

      const result = await uploadService.uploadFile(processedFile, type, uploadOptions);

      // Actualizar estado final
      updateState({
        isUploading: false,
        uploadResult: result,
        canCancel: false,
        canRetry: !result.success,
        error: result.success ? null : result.error
      });

      if (result.success) {
        logger.success('✅ Advanced upload completed successfully');
      } else {
        logger.error('❌ Advanced upload failed:', result.error);
      }

      return result;

    } catch (error: any) {
      logger.error('💥 Advanced upload error:', error);
      updateState({
        isAnalyzing: false,
        isProcessing: false,
        isUploading: false,
        canCancel: false,
        canRetry: true,
        error
      });
      
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'Error inesperado en upload avanzado'
        }
      };
    }
  }, [updateState, analyzeFile]);

  /**
   * Upload múltiple con procesamiento
   */
  const uploadMultipleFiles = useCallback(async (
    files: File[],
    type?: UploadType,
    options: ProcessingOptions & UploadOptions & { maxConcurrent?: number } = {}
  ): Promise<UploadResult[]> => {
    
    updateState({ ...initialState, isAnalyzing: true });
    
    lastOperationRef.current = {
      type: 'multiple',
      files,
      uploadType: type,
      options
    };

    try {
      logger.info('📦 Starting batch advanced upload:', {
        fileCount: files.length,
        maxConcurrent: options.maxConcurrent || 3
      });

      // Analizar todos los archivos
      updateState({ analysisProgress: 10 });
      
      const analyses = await Promise.all(
        files.map(file => uploadService.analyzeFile(file))
      );

      updateState({ analysisProgress: 100, isAnalyzing: false });

      // Upload con procesamiento
      updateState({ isUploading: true });

      const results = await uploadService.uploadMultipleFiles(files, type, options);

      updateState({
        isUploading: false,
        canCancel: false,
        canRetry: results.some(r => !r.success)
      });

      const successful = results.filter(r => r.success).length;
      logger.info(`📊 Batch upload completed: ${successful}/${files.length} successful`);

      return results;

    } catch (error: any) {
      logger.error('💥 Batch upload error:', error);
      updateState({
        isAnalyzing: false,
        isUploading: false,
        canCancel: false,
        canRetry: true,
        error
      });
      
      return files.map(() => ({
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Error en upload múltiple'
        }
      }));
    }
  }, [updateState]);

  /**
   * Generar thumbnail
   */
  const generateThumbnail = useCallback(async (
    file: File,
    size: number = 200
  ): Promise<UploadResult> => {
    
    updateState({ ...initialState, isProcessing: true });
    
    lastOperationRef.current = {
      type: 'thumbnail',
      file,
      options: { size }
    };

    try {
      logger.info('🖼️ Generating thumbnail:', { fileName: file.name, size });

      const result = await uploadService.generateThumbnail(file, size);

      updateState({
        isProcessing: false,
        uploadResult: result,
        canRetry: !result.success,
        error: result.success ? null : result.error
      });

      return result;

    } catch (error: any) {
      logger.error('❌ Thumbnail generation failed:', error);
      updateState({
        isProcessing: false,
        canRetry: true,
        error
      });
      
      return {
        success: false,
        error: {
          code: 'PROCESSING_FAILED',
          message: 'Error al generar thumbnail'
        }
      };
    }
  }, [updateState]);

  /**
   * Reanudar upload
   */
  const resumeUpload = useCallback(async (
    file: File,
    uploadId: string
  ): Promise<UploadResult> => {
    
    updateState({ ...initialState, isUploading: true });
    
    lastOperationRef.current = {
      type: 'resume',
      file,
      uploadId
    };

    try {
      const result = await uploadService.resumeUpload(file, uploadId);

      updateState({
        isUploading: false,
        uploadResult: result,
        canRetry: !result.success,
        error: result.success ? null : result.error
      });

      return result;

    } catch (error: any) {
      logger.error('❌ Resume upload failed:', error);
      updateState({
        isUploading: false,
        canRetry: true,
        error
      });
      
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Error al reanudar upload'
        }
      };
    }
  }, [updateState]);

  /**
   * Cancelar operación activa
   */
  const cancel = useCallback(() => {
    if (basicUpload.isUploading) {
      basicUpload.cancelUpload();
    }
    
    updateState({
      isAnalyzing: false,
      isProcessing: false,
      isUploading: false,
      canCancel: false,
      error: {
        code: 'UPLOAD_CANCELLED',
        message: 'Operación cancelada por el usuario'
      }
    });
    
    logger.info('🛑 Advanced upload cancelled');
  }, [basicUpload, updateState]);

  /**
   * Reintentar última operación
   */
  const retry = useCallback(async (): Promise<UploadResult | null> => {
    const lastOp = lastOperationRef.current;
    if (!lastOp) return null;

    logger.info('🔄 Retrying last operation:', lastOp.type);

    switch (lastOp.type) {
      case 'single':
        if (lastOp.file) {
          return await uploadWithProcessing(lastOp.file, lastOp.uploadType, lastOp.options);
        }
        break;
        
      case 'thumbnail':
        if (lastOp.file) {
          return await generateThumbnail(lastOp.file, lastOp.options?.size);
        }
        break;
        
      case 'resume':
        if (lastOp.file && lastOp.uploadId) {
          return await resumeUpload(lastOp.file, lastOp.uploadId);
        }
        break;
        
      case 'multiple':
        if (lastOp.files) {
          await uploadMultipleFiles(lastOp.files, lastOp.uploadType, lastOp.options);
        }
        return null;
    }
    
    return null;
  }, [uploadWithProcessing, generateThumbnail, resumeUpload, uploadMultipleFiles]);

  /**
   * Reset estado
   */
  const reset = useCallback(() => {
    setState(initialState);
    lastOperationRef.current = null;
    basicUpload.reset();
  }, [basicUpload]);

  // Calcular progreso total
  const totalProgress = (() => {
    const phases = [];
    
    if (state.isAnalyzing) phases.push(state.analysisProgress * 0.2); // 20%
    else if (state.analysis) phases.push(20);
    
    if (state.isProcessing) phases.push(state.processingProgress * 0.3); // 30%
    else if (state.processingResult) phases.push(30);
    
    if (state.isUploading && state.uploadProgress) phases.push(state.uploadProgress.percentage * 0.5); // 50%
    else if (state.uploadResult?.success) phases.push(50);
    
    return phases.reduce((sum, phase) => sum + phase, 0);
  })();

  return {
    state,
    analyzeFile,
    uploadWithProcessing,
    uploadMultipleFiles,
    generateThumbnail,
    resumeUpload,
    cancel,
    retry,
    reset,
    
    // Shortcuts
    totalProgress,
    isActive: state.isAnalyzing || state.isProcessing || state.isUploading,
    hasError: !!state.error
  };
}

/**
 * Hook simplificado para upload con compresión automática
 */
export function useSmartUpload() {
  const advancedUpload = useAdvancedUpload();
  
  const uploadWithSmartProcessing = useCallback(async (
    file: File,
    type?: UploadType,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    
    // Configuración inteligente basada en el tipo de archivo
    const smartOptions: ProcessingOptions & UploadOptions = {
      ...options,
      enableImageCompression: file.type.startsWith('image/') && file.size > 2 * 1024 * 1024,
      enableVideoOptimization: file.type.startsWith('video/') && file.size > 50 * 1024 * 1024,
      generateThumbnail: false, // Se puede activar según necesidades
      maxImageDimensions: { width: 1920, height: 1080 },
      imageQuality: 0.85
    };
    
    return await advancedUpload.uploadWithProcessing(file, type, smartOptions);
  }, [advancedUpload]);

  return {
    ...advancedUpload,
    uploadWithSmartProcessing
  };
}