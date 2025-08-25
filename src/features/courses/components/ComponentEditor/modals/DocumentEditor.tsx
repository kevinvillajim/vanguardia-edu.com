import React, { useState } from 'react';
import { Upload, FileText, Download, X } from 'lucide-react';
import Button from '../../../../../components/ui/Button/Button';
import { FileUploader } from '../../FileUploader/FileUploader';
import { 
  FormField, 
  TextInput, 
  TextArea, 
  PreviewSection,
  SettingsSection,
  CheckboxField
} from '../shared';

interface DocumentContent {
  title: string;
  file_url: string;
  file_name: string;
  file_type: string;
  description?: string | null;
  downloadable: boolean;
}

interface ComponentData {
  id: string;
  type: string;
  title: string;
  content?: DocumentContent;
  metadata?: any;
}

interface DocumentEditorProps {
  component: ComponentData;
  onUpdate: (updates: Partial<ComponentData>) => void;
  moduleId: string;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  component,
  onUpdate,
  moduleId
}) => {
  const [showFileUploader, setShowFileUploader] = useState(false);
  
  const content = component.content || {
    title: component.title,
    file_url: '',
    file_name: '',
    file_type: '',
    description: '',
    downloadable: true
  };

  const updateContent = (updates: Partial<DocumentContent>) => {
    const newContent = { ...content, ...updates, downloadable: true };
    onUpdate({ content: newContent });
  };

  const handleFileUpload = (fileUrl: string, metadata?: any) => {
    updateContent({ 
      file_url: fileUrl,
      file_name: metadata?.fileName || 'Documento',
      file_type: metadata?.fileType || 'application/pdf'
    });
    setShowFileUploader(false);
  };

  const removeFile = () => {
    updateContent({ 
      file_url: '', 
      file_name: '', 
      file_type: '' 
    });
  };

  const getFileIcon = () => {
    if (content.file_type.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (content.file_type.includes('word')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    } else if (content.file_type.includes('excel') || content.file_type.includes('spreadsheet')) {
      return <FileText className="w-8 h-8 text-green-500" />;
    } else if (content.file_type.includes('powerpoint') || content.file_type.includes('presentation')) {
      return <FileText className="w-8 h-8 text-orange-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const getFileTypeLabel = () => {
    if (content.file_type.includes('pdf')) return 'PDF';
    if (content.file_type.includes('word')) return 'Word';
    if (content.file_type.includes('excel') || content.file_type.includes('spreadsheet')) return 'Excel';
    if (content.file_type.includes('powerpoint') || content.file_type.includes('presentation')) return 'PowerPoint';
    if (content.file_type.includes('text')) return 'Texto';
    return 'Documento';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <FormField label="Título del Documento" required>
        <TextInput
          value={content.title}
          onChange={(value) => updateContent({ title: value })}
          placeholder="Título del documento"
        />
      </FormField>

      {/* Archivo Principal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Archivo del Documento *
        </label>
        
        {content.file_url ? (
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon()}
                  <div>
                    <h4 className="font-medium text-gray-900">{content.file_name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{getFileTypeLabel()}</span>
                      {component.metadata?.fileSize && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(component.metadata.fileSize)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFileUploader(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Cambiar archivo
            </Button>
          </div>
        ) : (
          <div></div>
        )}

        {(!content.file_url || showFileUploader) && (
          <div className="mt-4">
            <FileUploader
              componentType="any"
              acceptedTypes={[
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'text/csv'
              ]}
              onUploadComplete={handleFileUpload}
              maxSize={50}
            />
            {content.file_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFileUploader(false)}
                className="mt-2"
              >
                Cancelar
              </Button>
            )}
          </div>
        )}
      </div>

      <FormField label="Descripción (opcional)">
        <TextArea
          value={content.description || ''}
          onChange={(value) => updateContent({ description: value })}
          rows={4}
          placeholder="Descripción del documento..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Explica qué contiene el documento y por qué es útil para el estudiante
        </p>
      </FormField>


      <PreviewSection title="📄 Formatos soportados" className="bg-blue-50">
        <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
          <div>
            <div className="font-medium">Documentos</div>
            <div className="text-xs">PDF, Word (.docx), Texto (.txt)</div>
          </div>
          <div>
            <div className="font-medium">Hojas de cálculo</div>
            <div className="text-xs">Excel (.xlsx), CSV</div>
          </div>
          <div>
            <div className="font-medium">Presentaciones</div>
            <div className="text-xs">PowerPoint (.pptx)</div>
          </div>
          <div>
            <div className="font-medium">Tamaño máximo</div>
            <div className="text-xs">50 MB por archivo</div>
          </div>
        </div>
      </PreviewSection>

      {content.file_url && (
        <PreviewSection title="Vista del componente - Solo descarga">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon()}
                <div>
                  <h3 className="font-medium text-gray-900">{content.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{content.file_name}</p>
                  {content.description && (
                    <p className="text-sm text-gray-500 mt-2">{content.description}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </div>
        </PreviewSection>
      )}
    </div>
  );
};