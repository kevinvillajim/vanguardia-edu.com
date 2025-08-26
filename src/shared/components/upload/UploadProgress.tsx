/**
 * Componentes para mostrar progreso y estado de uploads
 * Incluye indicadores visuales, manejo de errores y control de reintentos
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  X, 
  FileIcon,
  Image,
  Video,
  FileAudio,
  FileText
} from 'lucide-react';
import { UploadProgress as UploadProgressType, UploadError, UploadResult } from '../../types/upload';
import { UploadErrorHandler } from '../../../services/uploadErrorHandler';

export interface UploadProgressProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  progress?: UploadProgressType | null;
  error?: UploadError | null;
  result?: UploadResult | null;
  isUploading: boolean;
  canRetry: boolean;
  retryCount?: number;
  onRetry?: () => void;
  onCancel?: () => void;
  onRemove?: () => void;
  className?: string;
}

export interface UploadListProps {
  uploads: Array<UploadProgressProps & { id: string }>;
  onRetryAll?: () => void;
  onCancelAll?: () => void;
  onClearCompleted?: () => void;
  className?: string;
}

/**
 * Obtener icono según tipo de archivo
 */
const getFileIcon = (fileType: string, className: string = "w-5 h-5") => {
  if (fileType.startsWith('image/')) {
    return <Image className={className} />;
  }
  if (fileType.startsWith('video/')) {
    return <Video className={className} />;
  }
  if (fileType.startsWith('audio/')) {
    return <FileAudio className={className} />;
  }
  if (fileType.includes('pdf') || fileType.includes('document')) {
    return <FileText className={className} />;
  }
  return <FileIcon className={className} />;
};

/**
 * Formatear tamaño de archivo
 */
const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Formatear tiempo estimado
 */
const formatEstimatedTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Componente individual de progreso de upload
 */
export const UploadProgressItem: React.FC<UploadProgressProps> = ({
  fileName,
  fileSize,
  fileType,
  progress,
  error,
  result,
  isUploading,
  canRetry,
  retryCount = 0,
  onRetry,
  onCancel,
  onRemove,
  className = ''
}) => {
  const percentage = progress?.percentage || 0;
  const speed = progress?.speed;
  const estimatedTime = progress?.estimatedTime;

  const getStatusColor = () => {
    if (error) return 'border-red-200 bg-red-50';
    if (result?.success) return 'border-green-200 bg-green-50';
    if (isUploading) return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getProgressColor = () => {
    if (error) return 'bg-red-500';
    if (result?.success) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getFileIcon(fileType, "w-6 h-6 text-gray-600")}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {fileName}
              </h4>
              {retryCount > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  Intento {retryCount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatFileSize(fileSize)}
              {speed && (
                <> • {formatFileSize(speed)}/s</>
              )}
              {estimatedTime && (
                <> • {formatEstimatedTime(estimatedTime)} restantes</>
              )}
            </p>
          </div>
        </div>

        {/* Status Icon & Actions */}
        <div className="flex items-center gap-2 ml-3">
          {isUploading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Upload className="w-4 h-4 text-blue-600" />
            </motion.div>
          )}
          
          {error && (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          
          {result?.success && (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}

          {/* Action Buttons */}
          {isUploading && onCancel && (
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Cancelar upload"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {error && canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Reintentar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {!isUploading && onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Eliminar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(isUploading || error) && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${getProgressColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{percentage}%</span>
            {progress && (
              <span>
                {formatFileSize(progress.loaded)} / {formatFileSize(progress.total)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-100 border border-red-200 rounded p-3"
        >
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-800 font-medium">
                {UploadErrorHandler.getUserFriendlyMessage(error)}
              </p>
              {error.details && (
                <details className="mt-2">
                  <summary className="text-xs text-red-700 cursor-pointer">
                    Detalles técnicos
                  </summary>
                  <pre className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded overflow-auto">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {result?.success && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-green-100 border border-green-200 rounded p-3"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-800">
              Archivo subido exitosamente
            </p>
            {result.fileUrl && (
              <a
                href={result.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-700 hover:text-green-900 underline ml-auto"
              >
                Ver archivo
              </a>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Lista de uploads con controles globales
 */
export const UploadList: React.FC<UploadListProps> = ({
  uploads,
  onRetryAll,
  onCancelAll,
  onClearCompleted,
  className = ''
}) => {
  const activeUploads = uploads.filter(u => u.isUploading);
  const failedUploads = uploads.filter(u => u.error && u.canRetry);
  const completedUploads = uploads.filter(u => u.result?.success);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Global Controls */}
      {uploads.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {activeUploads.length > 0 && (
              <span>{activeUploads.length} subiendo</span>
            )}
            {failedUploads.length > 0 && (
              <span className="ml-2 text-red-600">
                {failedUploads.length} fallidos
              </span>
            )}
            {completedUploads.length > 0 && (
              <span className="ml-2 text-green-600">
                {completedUploads.length} completados
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {failedUploads.length > 0 && onRetryAll && (
              <button
                onClick={onRetryAll}
                className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reintentar todos
              </button>
            )}

            {activeUploads.length > 0 && onCancelAll && (
              <button
                onClick={onCancelAll}
                className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancelar todos
              </button>
            )}

            {completedUploads.length > 0 && onClearCompleted && (
              <button
                onClick={onClearCompleted}
                className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                Limpiar completados
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Items */}
      <AnimatePresence>
        {uploads.map((upload) => (
          <UploadProgressItem
            key={upload.id}
            {...upload}
          />
        ))}
      </AnimatePresence>

      {uploads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay uploads activos</p>
        </div>
      )}
    </div>
  );
};