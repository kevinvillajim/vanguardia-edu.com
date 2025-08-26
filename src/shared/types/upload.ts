/**
 * Tipos para el sistema de uploads
 */

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  estimatedTime?: number; // seconds remaining
}

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  error?: UploadError;
}

export interface UploadError {
  code: string;
  message: string;
  details?: any;
  retry?: boolean;
  maxRetries?: number;
}

export interface UploadOptions {
  maxSize?: number; // bytes
  allowedTypes?: string[];
  chunkSize?: number; // bytes for chunked uploads
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  timeout?: number; // milliseconds
  onProgress?: (progress: UploadProgress) => void;
  onRetry?: (attempt: number, error: UploadError) => void;
}

export interface ChunkedUploadState {
  fileId: string;
  totalChunks: number;
  uploadedChunks: number;
  chunkSize: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export type UploadType = 'image' | 'video' | 'audio' | 'document' | 'any';

export interface UploadValidationResult {
  isValid: boolean;
  error?: UploadError;
}

export const UploadErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_LOST: 'CONNECTION_LOST',
  
  // File validation errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  EMPTY_FILE: 'EMPTY_FILE',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  STORAGE_FULL: 'STORAGE_FULL',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Processing errors
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  VIRUS_DETECTED: 'VIRUS_DETECTED',
  CONTENT_REJECTED: 'CONTENT_REJECTED',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  UPLOAD_CANCELLED: 'UPLOAD_CANCELLED',
  MAX_RETRIES_EXCEEDED: 'MAX_RETRIES_EXCEEDED'
} as const;

export type UploadErrorCode = typeof UploadErrorCodes[keyof typeof UploadErrorCodes];