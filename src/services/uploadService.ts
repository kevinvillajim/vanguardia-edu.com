import { apiClient } from '../infrastructure/api/ApiClient';
import { ENDPOINTS } from '../infrastructure/api/endpoints';
import { 
  UploadResult, 
  UploadOptions, 
  UploadProgress, 
  UploadType,
  UploadValidationResult,
  ChunkedUploadState,
  UploadErrorCodes
} from '../shared/types/upload';
import { UploadErrorHandler } from './uploadErrorHandler';
import { Validator } from '../shared/validation';
import { logger } from '../shared/utils/logger';
import { fileProcessingService, ProcessingResult } from './fileProcessingService';
import { chunkedUploadService, ChunkedUploadOptions } from './chunkedUploadService';

export class UploadService {
  private activeUploads = new Map<string, AbortController>();
  private retryAttempts = new Map<string, number>();
  
  // Configuración de procesamiento
  private readonly IMAGE_SIZE_THRESHOLD = 2 * 1024 * 1024; // 2MB
  private readonly CHUNK_SIZE_THRESHOLD = 50 * 1024 * 1024; // 50MB - Aumentado hasta que implementemos chunked upload

  /**
   * Upload a file to the server with processing and robust error handling
   */
  async uploadFile(
    file: File, 
    type?: UploadType,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const uploadId = this.generateUploadId();
    const {
      maxRetries = 3,
      retryDelay = 1000,
      timeout = 60000,
      onProgress,
      onRetry
    } = options;

    try {
      logger.debug('📤 Starting advanced file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadId
      });

      // Validar archivo antes del upload
      const validation = await this.validateFile(file, { type });
      if (!validation.isValid) {
        logger.warn('❌ File validation failed:', validation.error);
        return UploadErrorHandler.createErrorResult(validation.error!);
      }

      // Detectar tipo si no se proporciona
      const detectedType = type || this.detectFileType(file);
      
      // Decidir estrategia de upload
      let processedFile = file;
      
      // Procesar archivo si es necesario
      if (this.shouldProcessFile(file, detectedType)) {
        const processingResult = await this.processFile(file, detectedType);
        if (processingResult.success && processingResult.processedFile) {
          processedFile = processingResult.processedFile;
          logger.info('✅ File processed successfully:', {
            originalSize: file.size,
            processedSize: processedFile.size,
            compressionRatio: processingResult.metadata.compressionRatio
          });
        }
      }
      
      // Usar upload por chunks si el archivo es muy grande
      if (processedFile.size > this.CHUNK_SIZE_THRESHOLD) {
        logger.info('📦 Using chunked upload for large file');
        return await this.uploadLargeFile(processedFile, detectedType, options as ChunkedUploadOptions);
      }
      
      // Upload normal con reintentos automáticos
      return await this.attemptUploadWithRetry(
        processedFile, 
        detectedType, 
        uploadId,
        { maxRetries, retryDelay, timeout, onProgress, onRetry }
      );

    } catch (error: any) {
      logger.error('❌ Unexpected upload error:', error);
      const uploadError = UploadErrorHandler.createError(
        UploadErrorCodes.UNKNOWN_ERROR,
        'Error inesperado durante el upload',
        { originalError: error }
      );
      return UploadErrorHandler.createErrorResult(uploadError);
    } finally {
      this.cleanupUpload(uploadId);
    }
  }

  /**
   * Upload course banner image with processing and error handling
   */
  async uploadCourseBanner(
    courseId: number, 
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      logger.debug('🌅 Uploading course banner:', { courseId, fileName: file.name });

      // Validar que sea una imagen
      const validation = await this.validateFile(file, { type: 'image' });
      if (!validation.isValid) {
        return UploadErrorHandler.createErrorResult(validation.error!);
      }

      // Procesar imagen para optimizar tamaño y formato
      let processedFile = file;
      if (file.size > this.IMAGE_SIZE_THRESHOLD) {
        logger.info('🗜️ Processing banner image...');
        const processingResult = await fileProcessingService.processImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          format: 'webp'
        });
        
        if (processingResult.success && processingResult.processedFile) {
          processedFile = processingResult.processedFile;
          logger.success('✅ Banner processed:', {
            originalSize: file.size,
            processedSize: processedFile.size,
            compressionRatio: processingResult.metadata.compressionRatio
          });
        }
      }

      const formData = new FormData();
      formData.append('banner', processedFile);

      const response = await apiClient.postForm<{ data: { bannerUrl: string } }>(
        ENDPOINTS.COURSES.UPLOAD_BANNER(courseId),
        formData
      );

      logger.success('✅ Banner uploaded successfully');
      return UploadErrorHandler.createSuccessResult(
        response.data.bannerUrl,
        processedFile.name,
        processedFile.size,
        processedFile.type
      );

    } catch (error: any) {
      logger.error('❌ Error uploading banner:', error);
      const uploadError = this.handleUploadError(error);
      return UploadErrorHandler.createErrorResult(uploadError);
    }
  }

  /**
   * Delete a file from the server
   */
  async deleteFile(filename: string): Promise<UploadResult> {
    try {
      logger.debug('🗑️ Deleting file:', filename);
      await apiClient.delete(ENDPOINTS.FILES.DELETE(filename));
      logger.success('✅ File deleted successfully');
      return { success: true };
    } catch (error: any) {
      logger.error('❌ Error deleting file:', error);
      const uploadError = this.handleUploadError(error);
      return UploadErrorHandler.createErrorResult(uploadError);
    }
  }

  /**
   * Validate file before upload using centralized validation system
   */
  async validateFile(file: File, options?: UploadOptions & { type?: UploadType }): Promise<UploadValidationResult> {
    try {
      const { type, maxSize, allowedTypes } = options || {};

      // Validar archivo vacío
      if (file.size === 0) {
        const error = UploadErrorHandler.createError(
          UploadErrorCodes.EMPTY_FILE,
          'El archivo está vacío',
          { fileName: file.name }
        );
        return { isValid: false, error };
      }

      // Validar tamaño máximo si está especificado
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        const error = UploadErrorHandler.createError(
          UploadErrorCodes.FILE_SIZE_LIMIT,
          `El archivo excede el tamaño máximo de ${maxSize}MB`,
          { fileName: file.name, fileSize: file.size, maxSize }
        );
        return { isValid: false, error };
      }

      // Validar tipos permitidos si están especificados
      if (allowedTypes && allowedTypes.length > 0) {
        if (!allowedTypes.includes(file.type)) {
          const error = UploadErrorHandler.createError(
            UploadErrorCodes.INVALID_FILE_TYPE,
            `Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(', ')}`,
            { fileName: file.name, fileType: file.type, allowedTypes }
          );
          return { isValid: false, error };
        }
      }

      // Usar el sistema de validación centralizado si se especifica un tipo
      if (type && type !== 'any') {
        const validationResult = await Validator.validateFile(file, type);
        if (!validationResult.isValid) {
          const error = UploadErrorHandler.handleFileValidationError(
            file, 
            validationResult.error || 'Archivo no válido'
          );
          return { isValid: false, error };
        }
      }

      // Validación adicional específica de archivos
      const additionalValidation = await this.performAdditionalValidation(file);
      if (!additionalValidation.isValid) {
        return additionalValidation;
      }

      return { isValid: true };
    } catch (error: any) {
      logger.error('❌ File validation error:', error);
      const uploadError = UploadErrorHandler.handleProcessingError(error);
      return { isValid: false, error: uploadError };
    }
  }

  /**
   * Intentar upload con reintentos automáticos
   */
  private async attemptUploadWithRetry(
    file: File,
    type: UploadType,
    uploadId: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const { maxRetries = 3, onRetry } = options;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.retryAttempts.set(uploadId, attempt);
        
        const result = await this.performUpload(file, type, uploadId, options);
        
        if (result.success) {
          logger.success(`✅ Upload successful on attempt ${attempt}`);
          return result;
        }
        
        lastError = result.error;
        
        // Si el error no es recuperable, no reintentar
        if (lastError && !UploadErrorHandler.isRecoverable(lastError)) {
          logger.warn(`🚫 Non-recoverable error, stopping retries:`, lastError);
          break;
        }

        // Calcular delay antes del siguiente intento
        if (attempt < maxRetries) {
          const delay = UploadErrorHandler.calculateRetryDelay(attempt, options.retryDelay);
          logger.warn(`🔄 Upload failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          
          if (onRetry) {
            onRetry(attempt, lastError!);
          }
          
          await this.delay(delay);
        }
        
      } catch (error: any) {
        lastError = this.handleUploadError(error);
        logger.error(`❌ Upload attempt ${attempt} failed:`, error);
      }
    }

    // Máximo de reintentos alcanzado
    const maxRetriesError = UploadErrorHandler.createError(
      UploadErrorCodes.MAX_RETRIES_EXCEEDED,
      `Upload falló después de ${maxRetries} intentos`,
      { attempts: maxRetries, lastError }
    );
    
    return UploadErrorHandler.createErrorResult(maxRetriesError);
  }

  /**
   * Realizar el upload real
   */
  private async performUpload(
    file: File,
    type: UploadType,
    uploadId: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const abortController = new AbortController();
    this.activeUploads.set(uploadId, abortController);

    // Configurar timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, options.timeout || 60000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('uploadId', uploadId);

      // Configurar progress tracking si se proporciona callback
      const requestConfig: any = {
        signal: abortController.signal
      };

      if (options.onProgress) {
        requestConfig.onUploadProgress = (progressEvent: any) => {
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
          };
          options.onProgress!(progress);
        };
      }

      const response = await apiClient.postForm<{ data: { url: string } }>(
        ENDPOINTS.FILES.UPLOAD,
        formData,
        requestConfig
      );

      clearTimeout(timeoutId);
      
      return UploadErrorHandler.createSuccessResult(
        response.data.url,
        file.name,
        file.size,
        file.type
      );

    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Manejar errores de upload
   */
  private handleUploadError(error: any): any {
    if (error.name === 'AbortError') {
      return UploadErrorHandler.createError(
        UploadErrorCodes.UPLOAD_CANCELLED,
        'Upload cancelado',
        { originalError: error }
      );
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return UploadErrorHandler.handleNetworkError(error);
    }

    if (error.response) {
      return UploadErrorHandler.handleServerError(
        error.response.status,
        error.response.data
      );
    }

    if (!navigator.onLine) {
      return UploadErrorHandler.handleNetworkError(error);
    }

    return UploadErrorHandler.createError(
      UploadErrorCodes.UNKNOWN_ERROR,
      error.message || 'Error desconocido',
      { originalError: error }
    );
  }

  /**
   * Validaciones adicionales
   */
  private async performAdditionalValidation(file: File): Promise<UploadValidationResult> {
    // Validar nombre de archivo
    const fileName = file.name;
    if (fileName.length > 255) {
      const error = UploadErrorHandler.createError(
        UploadErrorCodes.INVALID_FILE_TYPE,
        'El nombre del archivo es muy largo (máx 255 caracteres)',
        { fileName }
      );
      return { isValid: false, error };
    }

    // Validar caracteres especiales en nombre
    const invalidChars = /[<>:"/\|?*]/;
    if (invalidChars.test(fileName)) {
      const error = UploadErrorHandler.createError(
        UploadErrorCodes.INVALID_FILE_TYPE,
        'El nombre del archivo contiene caracteres no permitidos',
        { fileName, invalidChars: fileName.match(invalidChars) }
      );
      return { isValid: false, error };
    }

    return { isValid: true };
  }

  /**
   * Detectar tipo de archivo
   */
  private detectFileType(file: File): UploadType {
    const mimeType = file.type;
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  /**
   * Generar ID único para upload
   */
  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Limpiar recursos del upload
   */
  private cleanupUpload(uploadId: string): void {
    this.activeUploads.delete(uploadId);
    this.retryAttempts.delete(uploadId);
  }

  /**
   * Cancelar upload activo
   */
  cancelUpload(uploadId: string): boolean {
    const controller = this.activeUploads.get(uploadId);
    if (controller) {
      controller.abort();
      this.cleanupUpload(uploadId);
      logger.info(`❌ Upload cancelled: ${uploadId}`);
      return true;
    }
    return false;
  }

  /**
   * Obtener uploads activos
   */
  getActiveUploads(): string[] {
    return Array.from(this.activeUploads.keys());
  }

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  }

  /**
   * Upload large file using chunks
   */
  private async uploadLargeFile(
    file: File,
    type: UploadType,
    options: ChunkedUploadOptions
  ): Promise<UploadResult> {
    try {
      return await chunkedUploadService.uploadFileInChunks(file, {
        ...options,
        chunkSize: options.chunkSize || 1024 * 1024, // 1MB chunks
        maxConcurrentUploads: 3,
        enableResume: true
      });
    } catch (error: any) {
      logger.error('❌ Chunked upload failed:', error);
      const uploadError = this.handleUploadError(error);
      return UploadErrorHandler.createErrorResult(uploadError);
    }
  }

  /**
   * Process file based on type and size
   */
  private async processFile(file: File, type: UploadType): Promise<ProcessingResult> {
    switch (type) {
      case 'image':
        return await fileProcessingService.processImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          format: 'webp'
        });
      
      case 'video':
        return await fileProcessingService.optimizeVideo(file);
      
      default:
        // Para otros tipos, solo extraer metadatos
        const metadata = await fileProcessingService.extractMetadata(file);
        return {
          success: true,
          processedFile: file,
          metadata
        };
    }
  }

  /**
   * Determine if file should be processed
   */
  private shouldProcessFile(file: File, type: UploadType): boolean {
    // Procesar imágenes grandes
    if (type === 'image' && file.size > this.IMAGE_SIZE_THRESHOLD) {
      return true;
    }
    
    // Procesar videos muy grandes
    if (type === 'video' && file.size > 50 * 1024 * 1024) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate thumbnail for images
   */
  async generateThumbnail(file: File, size: number = 200): Promise<UploadResult> {
    try {
      if (!file.type.startsWith('image/')) {
        const error = UploadErrorHandler.createError(
          UploadErrorCodes.INVALID_FILE_TYPE,
          'Solo se pueden generar thumbnails de imágenes'
        );
        return UploadErrorHandler.createErrorResult(error);
      }

      const result = await fileProcessingService.generateThumbnail(file, size);
      
      if (!result.success || !result.processedFile) {
        const error = UploadErrorHandler.createError(
          UploadErrorCodes.PROCESSING_FAILED,
          result.error || 'Error al generar thumbnail'
        );
        return UploadErrorHandler.createErrorResult(error);
      }

      // Upload del thumbnail
      return await this.uploadFile(result.processedFile, 'image', {
        maxRetries: 2,
        timeout: 30000
      });

    } catch (error: any) {
      logger.error('❌ Thumbnail generation failed:', error);
      const uploadError = UploadErrorHandler.createError(
        UploadErrorCodes.PROCESSING_FAILED,
        'Error al generar y subir thumbnail',
        { originalError: error }
      );
      return UploadErrorHandler.createErrorResult(uploadError);
    }
  }

  /**
   * Upload multiple files concurrently
   */
  async uploadMultipleFiles(
    files: File[],
    type?: UploadType,
    options: UploadOptions & { maxConcurrent?: number } = {}
  ): Promise<UploadResult[]> {
    const { maxConcurrent = 3, ...uploadOptions } = options;
    
    logger.info('📦 Starting batch upload:', {
      fileCount: files.length,
      maxConcurrent
    });

    // Crear semáforo para limitar concurrencia
    const semaphore = new Array(maxConcurrent).fill(null);
    let semaphoreIndex = 0;

    const uploadPromises = files.map(async (file, index) => {
      // Esperar turno
      const semIndex = semaphoreIndex % maxConcurrent;
      semaphoreIndex++;
      
      try {
        const result = await this.uploadFile(file, type, uploadOptions);
        logger.debug(`📎 File ${index + 1}/${files.length} completed`);
        return result;
      } catch (error: any) {
        logger.error(`❌ File ${index + 1} failed:`, error);
        const uploadError = UploadErrorHandler.createError(
          UploadErrorCodes.UNKNOWN_ERROR,
          `Error en archivo ${file.name}`,
          { originalError: error, fileIndex: index }
        );
        return UploadErrorHandler.createErrorResult(uploadError);
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    logger.info('📈 Batch upload completed:', {
      total: results.length,
      successful,
      failed
    });

    return results;
  }

  /**
   * Get file information with processing recommendations
   */
  async analyzeFile(file: File): Promise<{
    info: ReturnType<typeof fileProcessingService.getFileInfo>;
    metadata: any;
    recommendations: string[];
    estimatedProcessingTime?: number;
  }> {
    const info = fileProcessingService.getFileInfo(file);
    const metadata = await fileProcessingService.extractMetadata(file);
    const recommendations: string[] = [];
    
    // Generar recomendaciones
    if (info.isImage && file.size > this.IMAGE_SIZE_THRESHOLD) {
      recommendations.push('Se recomienda comprimir la imagen para upload más rápido');
    }
    
    if (file.size > this.CHUNK_SIZE_THRESHOLD) {
      recommendations.push('Archivo grande: se usará upload por chunks');
    }
    
    if (info.isVideo && file.size > 50 * 1024 * 1024) {
      recommendations.push('Video grande: considerar compresión en el servidor');
    }

    // Estimar tiempo de procesamiento
    let estimatedProcessingTime;
    if (info.isImage && file.size > this.IMAGE_SIZE_THRESHOLD) {
      estimatedProcessingTime = Math.max(1000, file.size / (1024 * 1024) * 500); // ~500ms por MB
    }

    return {
      info,
      metadata,
      recommendations,
      estimatedProcessingTime
    };
  }

  /**
   * Resume interrupted upload
   */
  async resumeUpload(file: File, uploadId: string): Promise<UploadResult> {
    try {
      logger.info('🔄 Attempting to resume upload:', { uploadId, fileName: file.name });
      
      // Check if it's a chunked upload
      const activeChunkedUploads = chunkedUploadService.getActiveUploads();
      if (activeChunkedUploads.includes(uploadId)) {
        return await chunkedUploadService.resumeUpload(file);
      }
      
      // For regular uploads, restart
      logger.warn('⚠️ Regular upload cannot be resumed, restarting');
      return await this.uploadFile(file);
      
    } catch (error: any) {
      logger.error('❌ Resume upload failed:', error);
      const uploadError = this.handleUploadError(error);
      return UploadErrorHandler.createErrorResult(uploadError);
    }
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const ext = this.getFileExtension(originalFilename);
    return `${timestamp}_${random}.${ext}`;
  }
}

// Export singleton instance
export const uploadService = new UploadService();