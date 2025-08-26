/**
 * Servicio avanzado de procesamiento de archivos
 * Incluye compresión, redimensionamiento, optimización y metadatos
 */

import { logger } from '../shared/utils/logger';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'webp' | 'jpeg' | 'png';
  maintainAspectRatio?: boolean;
}

export interface FileMetadata {
  fileName: string;
  originalSize: number;
  processedSize?: number;
  compressionRatio?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  mimeType: string;
  lastModified: number;
  checksum?: string;
}

export interface ProcessingResult {
  success: boolean;
  processedFile?: File;
  metadata: FileMetadata;
  error?: string;
  processingTime?: number;
}

/**
 * Servicio de procesamiento de archivos
 */
export class FileProcessingService {
  
  /**
   * Procesar imagen (redimensionar y comprimir)
   */
  async processImage(
    file: File, 
    options: ImageProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const startTime = performance.now();
    
    try {
      logger.debug('🖼️ Starting image processing:', {
        fileName: file.name,
        originalSize: file.size,
        options
      });

      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.85,
        format = 'webp',
        maintainAspectRatio = true
      } = options;

      // Crear metadata inicial
      const metadata: FileMetadata = {
        fileName: file.name,
        originalSize: file.size,
        mimeType: file.type,
        lastModified: file.lastModified
      };

      // Verificar si es una imagen
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          metadata,
          error: 'El archivo no es una imagen válida'
        };
      }

      // Cargar imagen
      const img = await this.loadImage(file);
      metadata.dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };

      // Verificar si necesita procesamiento
      const needsResize = img.naturalWidth > maxWidth || img.naturalHeight > maxHeight;
      const needsCompression = file.size > 1024 * 1024; // > 1MB
      const needsFormatChange = format === 'webp' && !file.type.includes('webp');

      if (!needsResize && !needsCompression && !needsFormatChange) {
        logger.info('✅ Image doesn\'t need processing');
        return {
          success: true,
          processedFile: file,
          metadata,
          processingTime: performance.now() - startTime
        };
      }

      // Calcular nuevas dimensiones
      const newDimensions = this.calculateDimensions(
        img.naturalWidth,
        img.naturalHeight,
        maxWidth,
        maxHeight,
        maintainAspectRatio
      );

      // Procesar imagen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No se pudo crear contexto de canvas');
      }

      canvas.width = newDimensions.width;
      canvas.height = newDimensions.height;

      // Optimizaciones de calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height);

      // Convertir a blob
      const processedBlob = await this.canvasToBlob(canvas, format, quality);
      
      // Crear archivo procesado
      const processedFile = new File(
        [processedBlob],
        this.changeFileExtension(file.name, format),
        { type: processedBlob.type }
      );

      // Completar metadata
      metadata.processedSize = processedFile.size;
      metadata.compressionRatio = Math.round((1 - processedFile.size / file.size) * 100);
      metadata.dimensions = newDimensions;
      metadata.checksum = await this.calculateChecksum(processedBlob);

      const processingTime = performance.now() - startTime;

      logger.success('✅ Image processed successfully:', {
        originalSize: file.size,
        processedSize: processedFile.size,
        compressionRatio: `${metadata.compressionRatio}%`,
        newDimensions,
        processingTime: `${processingTime.toFixed(2)}ms`
      });

      return {
        success: true,
        processedFile,
        metadata,
        processingTime
      };

    } catch (error: any) {
      logger.error('❌ Image processing failed:', error);
      
      const metadata: FileMetadata = {
        fileName: file.name,
        originalSize: file.size,
        mimeType: file.type,
        lastModified: file.lastModified
      };

      return {
        success: false,
        metadata,
        error: error.message || 'Error al procesar la imagen',
        processingTime: performance.now() - startTime
      };
    }
  }

  /**
   * Crear chunks para upload de archivos grandes
   */
  createFileChunks(file: File, chunkSize: number = 1024 * 1024): Blob[] {
    logger.debug('📦 Creating file chunks:', {
      fileName: file.name,
      fileSize: file.size,
      chunkSize,
      totalChunks: Math.ceil(file.size / chunkSize)
    });

    const chunks: Blob[] = [];
    let offset = 0;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
    }

    return chunks;
  }

  /**
   * Optimizar video (reducir calidad si es muy grande)
   */
  async optimizeVideo(file: File): Promise<ProcessingResult> {
    const startTime = performance.now();
    
    logger.debug('🎬 Starting video optimization:', {
      fileName: file.name,
      fileSize: file.size
    });

    const metadata: FileMetadata = {
      fileName: file.name,
      originalSize: file.size,
      mimeType: file.type,
      lastModified: file.lastModified
    };

    try {
      // Por ahora, solo validamos y retornamos el archivo original
      // En una implementación real, aquí usaríamos FFmpeg.wasm o similar
      
      if (file.size > 50 * 1024 * 1024) { // > 50MB
        logger.warn('⚠️ Video file is large, consider server-side processing');
      }

      return {
        success: true,
        processedFile: file,
        metadata,
        processingTime: performance.now() - startTime
      };

    } catch (error: any) {
      logger.error('❌ Video optimization failed:', error);
      
      return {
        success: false,
        metadata,
        error: error.message || 'Error al optimizar el video',
        processingTime: performance.now() - startTime
      };
    }
  }

  /**
   * Extraer metadatos completos de archivo
   */
  async extractMetadata(file: File): Promise<FileMetadata> {
    const metadata: FileMetadata = {
      fileName: file.name,
      originalSize: file.size,
      mimeType: file.type,
      lastModified: file.lastModified
    };

    try {
      // Calcular checksum
      metadata.checksum = await this.calculateChecksum(file);

      // Si es imagen, extraer dimensiones
      if (file.type.startsWith('image/')) {
        try {
          const img = await this.loadImage(file);
          metadata.dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight
          };
        } catch (error) {
          logger.warn('⚠️ Could not extract image dimensions:', error);
        }
      }

      return metadata;
    } catch (error: any) {
      logger.error('❌ Error extracting metadata:', error);
      return metadata;
    }
  }

  /**
   * Generar thumbnail de imagen
   */
  async generateThumbnail(
    file: File, 
    size: number = 200
  ): Promise<ProcessingResult> {
    return this.processImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.8,
      format: 'webp',
      maintainAspectRatio: true
    });
  }

  /**
   * Utilidades privadas
   */

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo cargar la imagen'));
      };
      
      img.src = url;
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): { width: number; height: number } {
    if (!maintainAspectRatio) {
      return { width: maxWidth, height: maxHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    
    let newWidth = Math.min(originalWidth, maxWidth);
    let newHeight = Math.min(originalHeight, maxHeight);
    
    if (newWidth / aspectRatio > newHeight) {
      newWidth = newHeight * aspectRatio;
    } else {
      newHeight = newWidth / aspectRatio;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight)
    };
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement, 
    format: string, 
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const mimeType = format === 'webp' ? 'image/webp' : 
                      format === 'jpeg' ? 'image/jpeg' : 'image/png';
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('No se pudo convertir canvas a blob'));
        }
      }, mimeType, quality);
    });
  }

  private changeFileExtension(fileName: string, newFormat: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;
    
    const extension = newFormat === 'webp' ? 'webp' : 
                     newFormat === 'jpeg' ? 'jpg' : 'png';
    
    return `${baseName}.${extension}`;
  }

  private async calculateChecksum(file: File | Blob): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      logger.warn('⚠️ Could not calculate checksum:', error);
      return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Validar integridad de archivo
   */
  async validateFileIntegrity(
    file: File, 
    expectedChecksum?: string
  ): Promise<boolean> {
    if (!expectedChecksum) return true;
    
    try {
      const actualChecksum = await this.calculateChecksum(file);
      return actualChecksum === expectedChecksum;
    } catch (error) {
      logger.error('❌ File integrity validation failed:', error);
      return false;
    }
  }

  /**
   * Obtener información detallada del archivo
   */
  getFileInfo(file: File) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    return {
      name: file.name,
      size: file.size,
      sizeFormatted: `${sizeInMB} MB`,
      type: file.type,
      extension,
      lastModified: new Date(file.lastModified),
      isImage: file.type.startsWith('image/'),
      isVideo: file.type.startsWith('video/'),
      isAudio: file.type.startsWith('audio/'),
      isDocument: file.type.includes('pdf') || file.type.includes('document')
    };
  }
}

// Export singleton instance
export const fileProcessingService = new FileProcessingService();