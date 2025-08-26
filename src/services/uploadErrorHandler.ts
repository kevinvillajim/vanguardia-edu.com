/**
 * Manejo avanzado de errores para uploads
 * Proporciona diagnóstico, recuperación automática y reportes detallados
 */

import { 
  UploadError, 
  UploadErrorCode, 
  UploadErrorCodes, 
  UploadResult 
} from '../shared/types/upload';
import { logger } from '../shared/utils/logger';

export class UploadErrorHandler {
  
  /**
   * Crear error estructurado de upload
   */
  static createError(
    code: UploadErrorCode, 
    message: string, 
    details?: any,
    retry: boolean = true,
    maxRetries: number = 3
  ): UploadError {
    return {
      code,
      message,
      details,
      retry,
      maxRetries
    };
  }

  /**
   * Manejar errores de red
   */
  static handleNetworkError(error: any): UploadError {
    logger.error('🌐 Network upload error:', error);

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return this.createError(
        UploadErrorCodes.TIMEOUT,
        'Tiempo de espera agotado. Verifica tu conexión a internet.',
        { originalError: error },
        true,
        5
      );
    }

    if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
      return this.createError(
        UploadErrorCodes.CONNECTION_LOST,
        'Sin conexión a internet. El upload se reanudará automáticamente.',
        { originalError: error, offline: !navigator.onLine },
        true,
        10
      );
    }

    return this.createError(
      UploadErrorCodes.NETWORK_ERROR,
      'Error de conexión. Reintentando automáticamente.',
      { originalError: error },
      true
    );
  }

  /**
   * Manejar errores del servidor
   */
  static handleServerError(status: number, response?: any): UploadError {
    logger.error('🔥 Server upload error:', { status, response });

    switch (status) {
      case 400:
        return this.createError(
          UploadErrorCodes.INVALID_FILE_TYPE,
          response?.message || 'Archivo no válido.',
          { status, response },
          false
        );

      case 401:
        return this.createError(
          UploadErrorCodes.PERMISSION_DENIED,
          'Sesión expirada. Inicia sesión de nuevo.',
          { status, response },
          false
        );

      case 403:
        return this.createError(
          UploadErrorCodes.PERMISSION_DENIED,
          'No tienes permisos para subir archivos.',
          { status, response },
          false
        );

      case 413:
        return this.createError(
          UploadErrorCodes.FILE_TOO_LARGE,
          'El archivo es muy grande para el servidor.',
          { status, response },
          false
        );

      case 422:
        return this.createError(
          UploadErrorCodes.INVALID_FILE_TYPE,
          response?.message || 'El archivo no cumple con los requisitos.',
          { status, response, validation: response?.errors },
          false
        );

      case 507:
        return this.createError(
          UploadErrorCodes.STORAGE_FULL,
          'Sin espacio disponible en el servidor.',
          { status, response },
          false
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return this.createError(
          UploadErrorCodes.SERVER_ERROR,
          'Error temporal del servidor. Reintentando...',
          { status, response },
          true,
          5
        );

      default:
        return this.createError(
          UploadErrorCodes.SERVER_ERROR,
          `Error del servidor (${status}). Reintentando...`,
          { status, response },
          true
        );
    }
  }

  /**
   * Manejar errores de validación de archivo
   */
  static handleFileValidationError(file: File, error: string): UploadError {
    logger.warn('📁 File validation error:', { fileName: file.name, error });

    if (error.includes('tamaño') || error.includes('size') || error.includes('grande')) {
      return this.createError(
        UploadErrorCodes.FILE_TOO_LARGE,
        error,
        { fileName: file.name, fileSize: file.size },
        false
      );
    }

    if (error.includes('tipo') || error.includes('format') || error.includes('permitido')) {
      return this.createError(
        UploadErrorCodes.INVALID_FILE_TYPE,
        error,
        { fileName: file.name, fileType: file.type },
        false
      );
    }

    return this.createError(
      UploadErrorCodes.INVALID_FILE_TYPE,
      error,
      { fileName: file.name },
      false
    );
  }

  /**
   * Manejar errores de procesamiento
   */
  static handleProcessingError(error: any): UploadError {
    logger.error('⚙️ File processing error:', error);

    if (error.message?.includes('virus') || error.message?.includes('malware')) {
      return this.createError(
        UploadErrorCodes.VIRUS_DETECTED,
        'Archivo rechazado por motivos de seguridad.',
        { originalError: error },
        false
      );
    }

    if (error.message?.includes('corrupt') || error.message?.includes('invalid')) {
      return this.createError(
        UploadErrorCodes.CORRUPTED_FILE,
        'El archivo está corrupto o dañado.',
        { originalError: error },
        false
      );
    }

    return this.createError(
      UploadErrorCodes.PROCESSING_FAILED,
      'Error al procesar el archivo. Intenta con otro formato.',
      { originalError: error },
      false
    );
  }

  /**
   * Determinar si un error es recuperable
   */
  static isRecoverable(error: UploadError): boolean {
    const recoverableErrors = [
      UploadErrorCodes.NETWORK_ERROR,
      UploadErrorCodes.TIMEOUT,
      UploadErrorCodes.CONNECTION_LOST,
      UploadErrorCodes.SERVER_ERROR
    ];

    return error.retry && recoverableErrors.includes(error.code as any);
  }

  /**
   * Calcular delay para retry con backoff exponencial
   */
  static calculateRetryDelay(attempt: number, baseDelay: number = 1000): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000; // Add random jitter
    const maxDelay = 30000; // Max 30 seconds
    
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Diagnosticar estado de la conexión
   */
  static async diagnoseConnection(): Promise<{
    online: boolean;
    speed?: 'slow' | 'medium' | 'fast';
    latency?: number;
  }> {
    const online = navigator.onLine;
    
    if (!online) {
      return { online: false };
    }

    try {
      // Simple speed test usando HEAD request a un endpoint ligero
      const start = performance.now();
      await fetch('/api/health', { method: 'HEAD' });
      const latency = performance.now() - start;

      let speed: 'slow' | 'medium' | 'fast' = 'medium';
      if (latency < 100) speed = 'fast';
      else if (latency > 500) speed = 'slow';

      return { online: true, speed, latency };
    } catch (error) {
      return { online: false };
    }
  }

  /**
   * Generar reporte de error para debugging
   */
  static generateErrorReport(error: UploadError, context?: any): string {
    const timestamp = new Date().toISOString();
    
    const report = {
      timestamp,
      errorCode: error.code,
      message: error.message,
      retryable: error.retry,
      maxRetries: error.maxRetries,
      context,
      details: error.details,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Obtener mensaje user-friendly basado en el error
   */
  static getUserFriendlyMessage(error: UploadError): string {
    const messages: Record<UploadErrorCode, string> = {
      [UploadErrorCodes.NETWORK_ERROR]: '🌐 Problema de conexión. Verifica tu internet.',
      [UploadErrorCodes.TIMEOUT]: '⏱️ Upload muy lento. Intenta con un archivo más pequeño.',
      [UploadErrorCodes.CONNECTION_LOST]: '📡 Sin conexión. El upload continuará cuando vuelvas online.',
      [UploadErrorCodes.FILE_TOO_LARGE]: '📏 Archivo muy grande. Máximo permitido: 100MB.',
      [UploadErrorCodes.INVALID_FILE_TYPE]: '📁 Tipo de archivo no permitido.',
      [UploadErrorCodes.CORRUPTED_FILE]: '💥 El archivo está dañado. Intenta con otro.',
      [UploadErrorCodes.EMPTY_FILE]: '📄 El archivo está vacío.',
      [UploadErrorCodes.SERVER_ERROR]: '🔥 Error del servidor. Reintentando automáticamente.',
      [UploadErrorCodes.STORAGE_FULL]: '💾 Sin espacio en el servidor. Contacta al administrador.',
      [UploadErrorCodes.QUOTA_EXCEEDED]: '📊 Has alcanzado tu límite de almacenamiento.',
      [UploadErrorCodes.PERMISSION_DENIED]: '🔐 No tienes permisos. Inicia sesión de nuevo.',
      [UploadErrorCodes.PROCESSING_FAILED]: '⚙️ No se pudo procesar el archivo.',
      [UploadErrorCodes.VIRUS_DETECTED]: '🦠 Archivo bloqueado por seguridad.',
      [UploadErrorCodes.CONTENT_REJECTED]: '🚫 Contenido no permitido.',
      [UploadErrorCodes.UNKNOWN_ERROR]: '❓ Error desconocido. Intenta de nuevo.',
      [UploadErrorCodes.UPLOAD_CANCELLED]: '❌ Upload cancelado.',
      [UploadErrorCodes.MAX_RETRIES_EXCEEDED]: '🔄 Demasiados intentos fallidos.'
    };

    return messages[error.code as UploadErrorCode] || error.message;
  }

  /**
   * Crear resultado de error
   */
  static createErrorResult(error: UploadError): UploadResult {
    return {
      success: false,
      error
    };
  }

  /**
   * Crear resultado exitoso
   */
  static createSuccessResult(
    fileUrl: string,
    fileName?: string,
    fileSize?: number,
    mimeType?: string
  ): UploadResult {
    return {
      success: true,
      fileUrl,
      fileName,
      fileSize,
      mimeType
    };
  }
}