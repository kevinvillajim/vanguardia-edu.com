/**
 * Servicio para upload de archivos grandes por chunks
 * Maneja uploads resumibles y optimización de ancho de banda
 */

import { apiClient } from '../infrastructure/api/ApiClient';
import { ENDPOINTS } from '../infrastructure/api/endpoints';
import { 
  ChunkedUploadState, 
  UploadProgress, 
  UploadResult, 
  UploadOptions 
} from '../shared/types/upload';
import { UploadErrorHandler } from './uploadErrorHandler';
import { logger } from '../shared/utils/logger';

export interface ChunkUploadInfo {
  chunkIndex: number;
  chunkSize: number;
  totalChunks: number;
  uploadedBytes: number;
  totalBytes: number;
}

export interface ChunkedUploadOptions extends UploadOptions {
  chunkSize?: number; // Default: 1MB
  maxConcurrentUploads?: number; // Default: 3
  enableResume?: boolean; // Default: true
}

/**
 * Servicio de upload por chunks
 */
export class ChunkedUploadService {
  private activeUploads = new Map<string, AbortController>();
  private uploadStates = new Map<string, ChunkedUploadState>();

  /**
   * Iniciar upload por chunks
   */
  async uploadFileInChunks(
    file: File,
    options: ChunkedUploadOptions = {}
  ): Promise<UploadResult> {
    const {
      chunkSize = 1024 * 1024, // 1MB chunks
      maxConcurrentUploads = 3,
      enableResume = true,
      onProgress,
      maxRetries = 3
    } = options;

    const uploadId = this.generateUploadId();
    
    try {
      logger.info('🚀 Starting chunked upload:', {
        fileName: file.name,
        fileSize: file.size,
        chunkSize,
        uploadId
      });

      // Verificar si el archivo es lo suficientemente grande para chunks
      if (file.size <= chunkSize * 2) {
        logger.info('📦 File too small for chunking, using regular upload');
        // Delegar a upload normal
        return { success: false, error: { 
          code: 'FILE_TOO_SMALL', 
          message: 'Archivo muy pequeño para upload por chunks' 
        }};
      }

      // Crear estado inicial
      const totalChunks = Math.ceil(file.size / chunkSize);
      const uploadState: ChunkedUploadState = {
        fileId: uploadId,
        totalChunks,
        uploadedChunks: 0,
        chunkSize,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };

      this.uploadStates.set(uploadId, uploadState);

      // Verificar si existe upload previo resumible
      let existingUpload = null;
      if (enableResume) {
        existingUpload = await this.checkExistingUpload(file);
        if (existingUpload) {
          logger.info('📥 Found resumable upload:', existingUpload);
          uploadState.uploadedChunks = existingUpload.uploadedChunks;
        }
      }

      // Inicializar upload si es nuevo
      if (!existingUpload) {
        await this.initializeChunkedUpload(uploadState);
      }

      // Crear chunks
      const chunks = this.createChunks(file, chunkSize);
      const startChunk = existingUpload ? existingUpload.uploadedChunks : 0;

      logger.debug('📦 Created chunks:', {
        totalChunks: chunks.length,
        startChunk,
        remainingChunks: chunks.length - startChunk
      });

      // Upload chunks con concurrencia controlada
      const result = await this.uploadChunksConcurrently(
        chunks,
        uploadState,
        startChunk,
        maxConcurrentUploads,
        onProgress,
        maxRetries
      );

      if (result.success) {
        // Finalizar upload
        const finalResult = await this.finalizeChunkedUpload(uploadState);
        this.cleanupUpload(uploadId);
        return finalResult;
      }

      return result;

    } catch (error: any) {
      logger.error('❌ Chunked upload failed:', error);
      this.cleanupUpload(uploadId);
      
      const uploadError = UploadErrorHandler.createError(
        'UNKNOWN_ERROR',
        'Error en upload por chunks',
        { originalError: error, uploadId }
      );
      
      return UploadErrorHandler.createErrorResult(uploadError);
    }
  }

  /**
   * Reanudar upload interrumpido
   */
  async resumeUpload(
    file: File,
    options: ChunkedUploadOptions = {}
  ): Promise<UploadResult> {
    logger.info('🔄 Attempting to resume upload:', file.name);
    
    // El resume está integrado en uploadFileInChunks
    return this.uploadFileInChunks(file, { 
      ...options, 
      enableResume: true 
    });
  }

  /**
   * Cancelar upload activo
   */
  cancelUpload(uploadId: string): boolean {
    const controller = this.activeUploads.get(uploadId);
    if (controller) {
      controller.abort();
      this.cleanupUpload(uploadId);
      logger.info('🛑 Chunked upload cancelled:', uploadId);
      return true;
    }
    return false;
  }

  /**
   * Obtener progreso de upload
   */
  getUploadProgress(uploadId: string): UploadProgress | null {
    const state = this.uploadStates.get(uploadId);
    if (!state) return null;

    const loaded = state.uploadedChunks * state.chunkSize;
    const total = state.fileSize;
    const percentage = Math.round((loaded / total) * 100);

    return {
      loaded,
      total,
      percentage
    };
  }

  /**
   * Métodos privados
   */

  private async initializeChunkedUpload(state: ChunkedUploadState): Promise<void> {
    try {
      const response = await apiClient.post(ENDPOINTS.FILES.CHUNKED_INIT, {
        fileId: state.fileId,
        fileName: state.fileName,
        fileSize: state.fileSize,
        mimeType: state.mimeType,
        totalChunks: state.totalChunks,
        chunkSize: state.chunkSize
      });

      logger.debug('🎯 Chunked upload initialized:', response.data);
    } catch (error: any) {
      logger.error('❌ Failed to initialize chunked upload:', error);
      throw error;
    }
  }

  private async checkExistingUpload(file: File): Promise<ChunkedUploadState | null> {
    try {
      // Crear identificador único del archivo (nombre + tamaño + fecha)
      const fileSignature = `${file.name}_${file.size}_${file.lastModified}`;
      
      const response = await apiClient.get(
        `${ENDPOINTS.FILES.CHUNKED_STATUS}?signature=${encodeURIComponent(fileSignature)}`
      );

      if (response.data && response.data.uploadState) {
        return response.data.uploadState;
      }

      return null;
    } catch (error) {
      logger.debug('📋 No existing upload found');
      return null;
    }
  }

  private createChunks(file: File, chunkSize: number): Blob[] {
    const chunks: Blob[] = [];
    let offset = 0;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
    }

    return chunks;
  }

  private async uploadChunksConcurrently(
    chunks: Blob[],
    state: ChunkedUploadState,
    startChunk: number,
    maxConcurrent: number,
    onProgress?: (progress: UploadProgress) => void,
    maxRetries: number = 3
  ): Promise<UploadResult> {
    const promises: Promise<void>[] = [];
    let completedChunks = startChunk;
    let hasError = false;
    let lastError: any = null;

    // Crear semáforo para limitar concurrencia
    const semaphore = new Semaphore(maxConcurrent);

    for (let i = startChunk; i < chunks.length && !hasError; i++) {
      const chunkPromise = semaphore.acquire().then(async (release) => {
        try {
          if (hasError) return;

          await this.uploadChunk(chunks[i], i, state, maxRetries);
          completedChunks++;

          // Actualizar progreso
          if (onProgress) {
            const loaded = completedChunks * state.chunkSize;
            const percentage = Math.round((loaded / state.fileSize) * 100);
            onProgress({
              loaded,
              total: state.fileSize,
              percentage
            });
          }

          logger.debug(`📦 Chunk ${i + 1}/${chunks.length} uploaded`);
        } catch (error) {
          hasError = true;
          lastError = error;
          logger.error(`❌ Chunk ${i} failed:`, error);
        } finally {
          release();
        }
      });

      promises.push(chunkPromise);
    }

    // Esperar a que todos los chunks se suban
    await Promise.all(promises);

    if (hasError) {
      const uploadError = UploadErrorHandler.handleNetworkError(lastError);
      return UploadErrorHandler.createErrorResult(uploadError);
    }

    return { success: true };
  }

  private async uploadChunk(
    chunk: Blob,
    chunkIndex: number,
    state: ChunkedUploadState,
    maxRetries: number
  ): Promise<void> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('fileId', state.fileId);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', state.totalChunks.toString());

        await apiClient.postForm(ENDPOINTS.FILES.CHUNKED_UPLOAD, formData);
        
        // Actualizar estado
        state.uploadedChunks = Math.max(state.uploadedChunks, chunkIndex + 1);
        return;

      } catch (error: any) {
        attempt++;
        
        if (attempt >= maxRetries) {
          throw error;
        }

        // Esperar antes del siguiente intento
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        
        logger.warn(`🔄 Retrying chunk ${chunkIndex}, attempt ${attempt + 1}/${maxRetries}`);
      }
    }
  }

  private async finalizeChunkedUpload(state: ChunkedUploadState): Promise<UploadResult> {
    try {
      logger.debug('🏁 Finalizing chunked upload:', state.fileId);

      const response = await apiClient.post(ENDPOINTS.FILES.CHUNKED_FINALIZE, {
        fileId: state.fileId,
        fileName: state.fileName,
        totalChunks: state.totalChunks
      });

      logger.success('✅ Chunked upload completed successfully');

      return UploadErrorHandler.createSuccessResult(
        response.data.fileUrl,
        state.fileName,
        state.fileSize,
        state.mimeType
      );

    } catch (error: any) {
      logger.error('❌ Failed to finalize chunked upload:', error);
      const uploadError = UploadErrorHandler.handleServerError(
        error.response?.status || 500,
        error.response?.data
      );
      return UploadErrorHandler.createErrorResult(uploadError);
    }
  }

  private generateUploadId(): string {
    return `chunked_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupUpload(uploadId: string): void {
    this.activeUploads.delete(uploadId);
    this.uploadStates.delete(uploadId);
  }

  /**
   * Obtener uploads activos
   */
  getActiveUploads(): string[] {
    return Array.from(this.activeUploads.keys());
  }

  /**
   * Obtener estado de upload específico
   */
  getUploadState(uploadId: string): ChunkedUploadState | null {
    return this.uploadStates.get(uploadId) || null;
  }
}

/**
 * Semáforo para limitar concurrencia
 */
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve(() => this.release());
      } else {
        this.waitQueue.push(() => {
          this.permits--;
          resolve(() => this.release());
        });
      }
    });
  }

  private release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) next();
    }
  }
}

// Export singleton instance
export const chunkedUploadService = new ChunkedUploadService();