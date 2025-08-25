import React, { useState, useCallback } from 'react';
import { FileText, Download, Check, Shield } from 'lucide-react';
import { createComponentLogger } from '../../../shared/utils/logger';
import { buildMediaUrl } from '../../../shared/utils/mediaUtils';
import { progressService } from '../../../services/progressService';

const logger = createComponentLogger('Document');

interface DocumentProps {
  /** Document title */
  title: string;
  /** File URL */
  fileUrl?: string;
  /** File name */
  fileName?: string;
  /** File type */
  fileType?: string;
  /** Description text */
  description?: string;
  /** Whether download is allowed */
  downloadable?: boolean;
  /** Course ID for media URL construction */
  courseId?: number;
  /** Unit ID for media URL construction */
  unitId?: number;
  /** Module ID for progress tracking */
  moduleId?: string;
  /** Component ID for progress tracking */
  componentId?: string;
  /** Custom CSS classes */
  className?: string;
  /** Callback when document is downloaded (for progress tracking) */
  onDownload?: () => void;
  /** Accessibility: aria-label for screen readers */
  ariaLabel?: string;
}

/**
 * Document component for displaying downloadable files in educational content
 * Supports progress tracking through download detection
 */
export const Document: React.FC<DocumentProps> = ({
  title,
  fileUrl,
  fileName,
  fileType = 'application/pdf',
  description,
  downloadable = true,
  courseId,
  unitId,
  moduleId,
  componentId,
  className = '',
  onDownload,
  ariaLabel
}) => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed'>('idle');

  logger.debug('Document rendered', { 
    title, 
    fileName, 
    fileType,
    downloadable 
  });

  const handleDownload = useCallback(async () => {
    if (!fileUrl || !downloadable) return;

    try {
      setDownloadStatus('downloading');
      
      // Construir URL usando buildMediaUrl
      const documentUrl = buildMediaUrl(fileUrl, courseId, unitId, 'documents');
      
      // Crear elemento de descarga temporal
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName || 'documento';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Agregar al DOM temporalmente para funcionar en todos los navegadores
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Registrar progreso en el sistema de prerrequisitos inteligente
      if (courseId && moduleId && componentId) {
        const result = await progressService.recordDocumentDownload(
          courseId, 
          moduleId, 
          componentId
        );
        
        if (result.success) {
          logger.info('Document progress recorded', { 
            courseId, 
            moduleId, 
            componentId,
            title 
          });
        } else {
          logger.warn('Failed to record progress', { error: result.error });
        }
      }
      
      // Notificar descarga para tracking adicional
      if (onDownload) {
        onDownload();
      }
      
      setDownloadStatus('completed');
      setTimeout(() => setDownloadStatus('idle'), 3000);
      
      logger.info('Document downloaded', { title, fileName });
    } catch (error) {
      logger.error('Failed to download document', { error, title });
      setDownloadStatus('idle');
    }
  }, [fileUrl, fileName, downloadable, courseId, unitId, moduleId, componentId, onDownload, title]);

  const getFileIcon = useCallback(() => {
    if (fileType.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (fileType.includes('word')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="w-8 h-8 text-green-500" />;
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="w-8 h-8 text-orange-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  }, [fileType]);

  const getFileTypeLabel = useCallback(() => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word')) return 'Word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PowerPoint';
    if (fileType.includes('text')) return 'Texto';
    return 'Documento';
  }, [fileType]);

  return (
    <article 
      className={`w-full border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}
      aria-label={ariaLabel || 'Documento educativo'}
      role="article"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Documento</span>
        </div>
        
        <div className="flex items-center gap-2">
          {downloadStatus === 'completed' && (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-xs">Descargado</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600">Seguro</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            
            {fileName && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {fileName}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span>{getFileTypeLabel()}</span>
              {!fileUrl && (
                <>
                  <span>•</span>
                  <span className="text-amber-600">Archivo no disponible</span>
                </>
              )}
            </div>
            
            {description && (
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                {description}
              </p>
            )}

            {/* Download Button */}
            {fileUrl && downloadable && (
              <button
                onClick={handleDownload}
                disabled={downloadStatus === 'downloading'}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  downloadStatus === 'downloading'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : downloadStatus === 'completed'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                }`}
                aria-label={`Descargar ${fileName || title}`}
              >
                {downloadStatus === 'downloading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>Descargando...</span>
                  </>
                ) : downloadStatus === 'completed' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Descargado</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </>
                )}
              </button>
            )}

            {/* No download available message */}
            {(!fileUrl || !downloadable) && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {!fileUrl 
                  ? 'Archivo no disponible para descarga'
                  : 'Descarga no permitida'
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicator for mandatory content */}
      {downloadStatus === 'completed' && (
        <div className="px-6 pb-4">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Documento accedido exitosamente</span>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-500" />
              <span className="text-green-600">Progreso registrado</span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default Document;