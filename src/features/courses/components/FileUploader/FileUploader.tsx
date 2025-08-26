import React, { useState, useRef } from 'react';
import { Upload, X, FileVideo, FileImage, FileText, Loader2, CheckCircle } from 'lucide-react';
import { uploadService } from '../../../../services/uploadService';
import Button from '../../../../components/ui/Button/Button';

interface FileUploaderProps {
  onUploadComplete: (fileUrl: string, metadata?: any) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  componentType: 'video' | 'image' | 'pdf' | 'any';
  courseId?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  acceptedTypes,
  maxSize = 100,
  componentType,
  courseId
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedTypes = () => {
    if (acceptedTypes) return acceptedTypes;
    
    switch (componentType) {
      case 'video':
        return ['video/mp4', 'video/webm', 'video/ogg'];
      case 'image':
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      case 'pdf':
        return ['application/pdf'];
      default:
        return [];
    }
  };

  const getFileIcon = () => {
    switch (componentType) {
      case 'video':
        return <FileVideo className="w-12 h-12 text-primary-500" />;
      case 'image':
        return <FileImage className="w-12 h-12 text-primary-500" />;
      case 'pdf':
        return <FileText className="w-12 h-12 text-primary-500" />;
      default:
        return <Upload className="w-12 h-12 text-primary-500" />;
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = await uploadService.validateFile(file, {
      type: componentType,
      maxSize,
      allowedTypes: getAcceptedTypes()
    });

    if (!validation.isValid) {
      setError(validation.error?.message || 'Archivo no válido');
      return;
    }

    // Start upload
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (in real implementation, use XMLHttpRequest progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadService.uploadFile(file, componentType);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.fileUrl) {
        setUploadedFile({
          name: file.name,
          url: result.fileUrl
        });

        // Extract metadata based on file type
        const metadata: any = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        };

        // For videos, we could extract duration if needed
        if (componentType === 'video') {
          const video = document.createElement('video');
          video.src = URL.createObjectURL(file);
          video.onloadedmetadata = () => {
            metadata.duration = Math.round(video.duration);
            URL.revokeObjectURL(video.src);
            onUploadComplete(result.fileUrl!, metadata);
          };
        } else {
          onUploadComplete(result.fileUrl!, metadata);
        }
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Error al subir el archivo');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(typeof error === 'string' ? error : error?.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-all duration-200 cursor-pointer
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
            ${uploading ? 'pointer-events-none opacity-75' : ''}
          `}
          onDrop={handleDrop}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={getAcceptedTypes().join(',')}
            onChange={handleFileSelect}
            disabled={uploading}
          />

          <div className="flex flex-col items-center justify-center">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                <p className="text-sm text-gray-600 mb-2">Subiendo archivo...</p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{uploadProgress}%</p>
              </>
            ) : (
              <>
                {getFileIcon()}
                <p className="text-gray-700 font-medium mt-4 mb-2">
                  Arrastra y suelta tu archivo aquí
                </p>
                <p className="text-sm text-gray-500 mb-4">o</p>
                <Button variant="secondary" size="sm">
                  Seleccionar archivo
                </Button>
                <p className="text-xs text-gray-400 mt-4">
                  Tamaño máximo: {maxSize}MB
                </p>
                {componentType !== 'any' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Formatos aceptados: {getAcceptedTypes().map(t => t.split('/')[1]).join(', ')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-gray-700">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">Archivo cargado exitosamente</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};