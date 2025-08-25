import React, { useState } from 'react';
import { Upload, Play, X, Clock } from 'lucide-react';
import Button from '../../../../../components/ui/Button/Button';
import { FileUploader } from '../../FileUploader/FileUploader';
import { MediaImage } from '../../../../../shared/components/media/MediaImage';
import VideoPlayer from '../../../../../shared/components/media/VideoPlayer';
import { 
  EditorTabs, 
  FormField, 
  TextInput, 
  TextArea, 
  PreviewSection,
  SettingsSection,
  CheckboxField,
  FileUploadSection,
  TabType 
} from '../shared';

interface VideoContent {
  title: string;
  src: string;
  poster?: string;
  description?: string | null;
  duration?: number | null;
  autoplay?: boolean;
  controls?: boolean;
}

interface ComponentData {
  id: string;
  type: string;
  title: string;
  content?: VideoContent;
  metadata?: any;
}

interface VideoEditorProps {
  component: ComponentData;
  onUpdate: (updates: Partial<ComponentData>) => void;
  moduleId: string;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  component,
  onUpdate,
  moduleId
}) => {
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [showPosterUploader, setShowPosterUploader] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('content');
  
  const content = component.content || {
    title: component.title,
    src: '',
    poster: '',
    description: '',
    duration: null,
    autoplay: false,
    controls: true
  };

  const updateContent = (updates: Partial<VideoContent>) => {
    const newContent = { ...content, ...updates };
    onUpdate({ content: newContent });
  };

  const handleVideoUpload = (fileUrl: string, metadata?: any) => {
    updateContent({ 
      src: fileUrl,
      duration: metadata?.duration || null 
    });
    setShowVideoUploader(false);
  };

  const handlePosterUpload = (fileUrl: string, metadata?: any) => {
    updateContent({ poster: fileUrl });
    setShowPosterUploader(false);
  };

  const removeVideo = () => {
    updateContent({ src: '', duration: null });
  };

  const removePoster = () => {
    updateContent({ poster: '' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'content' && (
        <div className="space-y-6">
          <FormField label="Título del Video" required>
            <TextInput
              value={content.title}
              onChange={(value) => updateContent({ title: value })}
              placeholder="Título del video"
            />
          </FormField>

          {/* Video Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo de Video *
            </label>
            
            {content.src ? (
              <div className="space-y-4">
                <div className="relative">
                  <VideoPlayer
                    src={content.src}
                    title={content.title}
                    description={content.description}
                    poster={content.poster}
                    autoPlay={false}
                    showDownload={false}
                    height="300px"
                  />
                  <button
                    onClick={removeVideo}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {content.duration && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Duración: {formatDuration(content.duration)}
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowVideoUploader(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Cambiar video
                </Button>
              </div>
            ) : (
              <div></div>
            )}

            {(!content.src || showVideoUploader) && (
              <div className="mt-4">
                <FileUploader
                  componentType="video"
                  onUploadComplete={handleVideoUpload}
                  maxSize={500}
                />
                {content.src && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVideoUploader(false)}
                    className="mt-2"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            )}
          </div>

          <FileUploadSection
            fileUrl={content.poster}
            onUploadComplete={handlePosterUpload}
            onRemoveFile={removePoster}
            fileType="image"
            label="Imagen de Portada (opcional)"
            previewClassName="w-full h-32 object-cover rounded-lg shadow-sm"
          />

          <FormField label="Descripción (opcional)">
            <TextArea
              value={content.description || ''}
              onChange={(value) => updateContent({ description: value })}
              rows={4}
              placeholder="Descripción del video..."
            />
            <p className="text-xs text-gray-500 mt-1">
              La descripción aparecerá debajo del video
            </p>
          </FormField>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <SettingsSection title="Controles de Reproducción">
            <div className="space-y-4">
              <CheckboxField
                checked={content.controls}
                onChange={(checked) => updateContent({ controls: checked })}
                label="Mostrar controles - Permite al usuario controlar la reproducción"
              />
              
              <CheckboxField
                checked={content.autoplay}
                onChange={(checked) => updateContent({ autoplay: checked })}
                label="Reproducción automática - El video se reproduce automáticamente"
              />
            </div>
          </SettingsSection>

          <FormField label="Duración estimada (minutos)">
            <TextInput
              type="number"
              min="0"
              step="0.5"
              value={content.duration ? Math.round(content.duration / 60 * 10) / 10 : ''}
              onChange={(value) => updateContent({ 
                duration: value ? Math.round(parseFloat(value) * 60) : null 
              })}
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se detecta automáticamente al subir el video, pero puedes ajustarlo manualmente
            </p>
          </FormField>

          <PreviewSection title="Recomendaciones">
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Formatos recomendados:</span>
                <span>MP4, WebM</span>
              </div>
              <div className="flex justify-between">
                <span>Resolución recomendada:</span>
                <span>1920x1080 o menor</span>
              </div>
              <div className="flex justify-between">
                <span>Tamaño máximo:</span>
                <span>500MB</span>
              </div>
              <div className="flex justify-between">
                <span>Bitrate recomendado:</span>
                <span>2-8 Mbps</span>
              </div>
            </div>
          </PreviewSection>
        </div>
      )}
    </div>
  );
};