import React, { useState } from 'react';
import { Upload, X, ZoomIn } from 'lucide-react';
import Button from '../../../../../components/ui/Button/Button';
import { FileUploader } from '../../FileUploader/FileUploader';
import { MediaImage } from '../../../../../shared/components/media/MediaImage';

interface FileUploadSectionProps {
  fileUrl?: string;
  onUploadComplete: (fileUrl: string, metadata?: any) => void;
  onRemoveFile: () => void;
  fileType: 'image' | 'video' | 'audio' | 'pdf';
  label: string;
  required?: boolean;
  allowFullscreen?: boolean;
  onFullscreen?: () => void;
  className?: string;
  previewClassName?: string;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  fileUrl,
  onUploadComplete,
  onRemoveFile,
  fileType,
  label,
  required = false,
  allowFullscreen = false,
  onFullscreen,
  className = '',
  previewClassName = 'w-full max-h-64 object-contain rounded-lg shadow-sm'
}) => {
  const [showUploader, setShowUploader] = useState(false);

  const handleUpload = (url: string, metadata?: any) => {
    onUploadComplete(url, metadata);
    setShowUploader(false);
  };

  const renderPreview = () => {
    if (!fileUrl) return null;

    switch (fileType) {
      case 'image':
        return (
          <div className="relative">
            <MediaImage
              src={fileUrl}
              alt={label}
              className={`${previewClassName} ${allowFullscreen ? 'cursor-pointer' : ''}`}
              fallbackStrategy="after-error"
            />
            {allowFullscreen && onFullscreen && (
              <div onClick={onFullscreen} className="absolute inset-0 cursor-pointer" />
            )}
            <button
              onClick={onRemoveFile}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {allowFullscreen && onFullscreen && (
              <button
                onClick={onFullscreen}
                className="absolute bottom-2 right-2 p-2 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="relative">
            <video
              src={fileUrl}
              controls
              className={previewClassName}
            />
            <button
              onClick={onRemoveFile}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-2">
            <audio src={fileUrl} controls className="w-full" />
            <Button
              variant="secondary"
              size="sm"
              onClick={onRemoveFile}
              leftIcon={<X className="w-4 h-4" />}
            >
              Eliminar audio
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <span className="text-sm text-gray-700">{fileUrl.split('/').pop()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveFile}
              leftIcon={<X className="w-4 h-4" />}
            >
              Eliminar
            </Button>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {fileUrl ? (
        <div className="space-y-4">
          {renderPreview()}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowUploader(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Cambiar archivo
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowUploader(true)}
          leftIcon={<Upload className="w-4 h-4" />}
        >
          Subir {fileType === 'image' ? 'imagen' : fileType === 'video' ? 'video' : 'archivo'}
        </Button>
      )}

      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Subir {fileType === 'image' ? 'Imagen' : fileType === 'video' ? 'Video' : 'Archivo'}
            </h3>
            <FileUploader
              componentType={fileType}
              onUploadComplete={handleUpload}
              maxSize={fileType === 'video' ? 500 : 100}
            />
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                onClick={() => setShowUploader(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};