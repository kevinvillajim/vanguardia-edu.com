import { apiClient } from '../infrastructure/api/ApiClient';
import { ENDPOINTS } from '../infrastructure/api/endpoints';

export class UploadService {
  /**
   * Upload a file to the server
   */
  async uploadFile(file: File, type?: string): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Detect file type if not provided
      if (type) {
        formData.append('type', type);
      } else {
        // Auto-detect type based on MIME type
        const mimeType = file.type;
        if (mimeType.startsWith('image/')) {
          formData.append('type', 'image');
        } else if (mimeType.startsWith('video/')) {
          formData.append('type', 'video');
        } else if (mimeType.startsWith('audio/')) {
          formData.append('type', 'audio');
        } else {
          formData.append('type', 'document');
        }
      }

      const response = await apiClient.postForm<{ data: { url: string } }>(
        ENDPOINTS.FILES.UPLOAD,
        formData
      );

      return { success: true, fileUrl: response.data.url };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message || 'Error al subir el archivo' };
    }
  }

  /**
   * Upload course banner image
   */
  async uploadCourseBanner(courseId: number, file: File): Promise<{ success: boolean; bannerUrl?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('banner', file);

      const response = await apiClient.postForm<{ data: { bannerUrl: string } }>(
        ENDPOINTS.COURSES.UPLOAD_BANNER(courseId),
        formData
      );

      return { success: true, bannerUrl: response.data.bannerUrl };
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      return { success: false, error: error.message || 'Error al subir la imagen' };
    }
  }

  /**
   * Delete a file from the server
   */
  async deleteFile(filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.delete(ENDPOINTS.FILES.DELETE(filename));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message || 'Error al eliminar el archivo' };
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, options?: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
  }): { valid: boolean; error?: string } {
    const { maxSize = 100, allowedTypes } = options || {};

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `El archivo no debe superar ${maxSize}MB` };
    }

    // Check file type
    if (allowedTypes && allowedTypes.length > 0) {
      const fileType = file.type.split('/')[1];
      const fileName = file.name.toLowerCase();
      const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);
      
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType);
        }
        return file.type === type || fileExt === type;
      });

      if (!isAllowed) {
        return { valid: false, error: `Tipo de archivo no permitido. Solo se permiten: ${allowedTypes.join(', ')}` };
      }
    }

    return { valid: true };
  }

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
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