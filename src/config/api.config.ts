/**
 * Configuración de API y Comunicación con Backend
 * 
 * Centraliza toda la configuración relacionada con:
 * - URLs de API y endpoints
 * - Timeouts y reintentos
 * - Configuración de autenticación
 * - Headers por defecto
 * - Configuración de uploads
 */

export interface ApiConfig {
  // URLs y Endpoints
  baseUrl: string;
  timeout: number;
  
  // Autenticación
  auth: {
    loginEndpoint: string;
    refreshEndpoint: string;
    logoutEndpoint: string;
    registerEndpoint: string;
    meEndpoint: string;
  };
  
  // Uploads
  upload: {
    maxSize: number; // bytes
    allowedTypes: string[];
    timeout: number;
    chunkSize?: number;
  };
  
  // Reintentos y errores
  retry: {
    attempts: number;
    delay: number; // milliseconds
    backoff: number; // multiplicador para delay
  };
  
  // Headers por defecto
  headers: {
    [key: string]: string;
  };
}

/**
 * Configuración por defecto de la API
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  // 🌐 URLs BASE
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 15000, // 15 segundos
  
  // 🔐 ENDPOINTS DE AUTENTICACIÓN
  auth: {
    loginEndpoint: '/auth/login',
    refreshEndpoint: '/auth/refresh', 
    logoutEndpoint: '/auth/logout',
    registerEndpoint: '/auth/register',
    meEndpoint: '/auth/me',
  },
  
  // 📁 CONFIGURACIÓN DE UPLOADS
  upload: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      // Imágenes
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // Videos  
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      // Audio
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
      // Documentos
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv'
    ],
    timeout: 30000, // 30 segundos para uploads
    chunkSize: 1024 * 1024, // 1MB por chunk
  },
  
  // 🔄 CONFIGURACIÓN DE REINTENTOS
  retry: {
    attempts: 3,
    delay: 1000, // 1 segundo inicial
    backoff: 2,  // duplicar delay en cada reintento
  },
  
  // 📋 HEADERS POR DEFECTO
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
};

/**
 * Configuraciones preestablecidas para diferentes entornos
 */
export const API_PRESETS = {
  // Desarrollo local
  DEVELOPMENT: {
    ...DEFAULT_API_CONFIG,
    baseUrl: 'http://localhost:8000/api',
    timeout: 30000, // 30 segundos en desarrollo
    retry: {
      ...DEFAULT_API_CONFIG.retry,
      attempts: 1, // No reintentar en desarrollo
    }
  },
  
  // Producción
  PRODUCTION: {
    ...DEFAULT_API_CONFIG,
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 10000, // 10 segundos en producción
    retry: {
      ...DEFAULT_API_CONFIG.retry,
      attempts: 3,
    }
  },
  
  // Testing
  TESTING: {
    ...DEFAULT_API_CONFIG,
    baseUrl: 'http://localhost:8000/api',
    timeout: 5000, // 5 segundos para tests
    retry: {
      ...DEFAULT_API_CONFIG.retry,
      attempts: 1, // No reintentar en tests
    }
  }
};

/**
 * Obtener configuración de API según el entorno
 */
export function getApiConfig(environment?: string): ApiConfig {
  const env = environment || import.meta.env.MODE || 'development';
  
  switch (env) {
    case 'production':
      return API_PRESETS.PRODUCTION;
    case 'test':
    case 'testing':
      return API_PRESETS.TESTING;
    case 'development':
    default:
      return API_PRESETS.DEVELOPMENT;
  }
}

/**
 * Validar si un tipo de archivo está permitido
 */
export function isFileTypeAllowed(fileType: string, config: ApiConfig = DEFAULT_API_CONFIG): boolean {
  return config.upload.allowedTypes.includes(fileType);
}

/**
 * Validar si el tamaño del archivo está permitido
 */
export function isFileSizeAllowed(fileSize: number, config: ApiConfig = DEFAULT_API_CONFIG): boolean {
  return fileSize <= config.upload.maxSize;
}

/**
 * Obtener configuración de upload específica por tipo de contenido
 */
export const UPLOAD_CONFIGS = {
  // Imágenes - más restrictivo
  images: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    quality: 0.8, // Para compresión
  },
  
  // Videos - más permisivo
  videos: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/avi', 'video/mov'],
    chunkSize: 2 * 1024 * 1024, // 2MB chunks
  },
  
  // Documentos - tamaño medio
  documents: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
  },
  
  // Audio - tamaño medio
  audio: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  }
};

/**
 * Formatear tamaño de archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default DEFAULT_API_CONFIG;