import React, { useState } from 'react';
import { MediaImage } from '../../../../../shared/components/media/MediaImage';
import { 
  EditorTabs, 
  FormField, 
  TextInput, 
  TextArea, 
  PreviewSection,
  FileUploadSection,
  TabType 
} from '../shared';

interface BannerContent {
  title: string;
  img: string;
  subtitle?: string | null;
  description?: string | null;
}

interface ComponentData {
  id: string;
  type: string;
  title: string;
  content?: BannerContent;
  metadata?: any;
}

interface BannerEditorProps {
  component: ComponentData;
  onUpdate: (updates: Partial<ComponentData>) => void;
  moduleId: string;
}

export const BannerEditor: React.FC<BannerEditorProps> = ({
  component,
  onUpdate,
  moduleId
}) => {
  const content = component.content || {
    title: component.title || '',
    img: '',
    subtitle: '',
    description: ''
  };

  const updateContent = (updates: Partial<BannerContent>) => {
    const newContent = { ...content, ...updates };
    onUpdate({ content: newContent });
  };

  const handleImageUpload = (fileUrl: string, metadata?: any) => {
    updateContent({ img: fileUrl });
  };

  const removeImage = () => {
    updateContent({ img: '' });
  };

  return (
    <div className="space-y-6">
      <FormField label="Título del Banner" required>
        <TextInput
          value={content.title || ''}
          onChange={(value) => updateContent({ title: value })}
          placeholder="Título principal del banner"
        />
      </FormField>

      <FormField label="Subtítulo (opcional)">
        <TextInput
          value={content.subtitle || ''}
          onChange={(value) => updateContent({ subtitle: value })}
          placeholder="Subtítulo del banner"
        />
      </FormField>

      <FileUploadSection
        fileUrl={content.img}
        onUploadComplete={handleImageUpload}
        onRemoveFile={removeImage}
        fileType="image"
        label="Imagen del Banner"
        required
        previewClassName="w-full h-64 object-cover rounded-lg shadow-sm"
      />

      <FormField label="Descripción (opcional)">
        <TextArea
          value={content.description || ''}
          onChange={(value) => updateContent({ description: value })}
          rows={4}
          placeholder="Descripción adicional del banner..."
        />
        <p className="text-xs text-gray-500 mt-1">
          La descripción aparecerá debajo del banner
        </p>
      </FormField>

      <PreviewSection title="Configuraciones">
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Tamaño recomendado:</span>
            <span>1200x400px</span>
          </div>
          <div className="flex justify-between">
            <span>Formato recomendado:</span>
            <span>JPG, PNG, WebP</span>
          </div>
        </div>
      </PreviewSection>

      {content.img && (
        <PreviewSection title="Vista previa">
          <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
            <MediaImage
              src={content.img}
              alt={content.title}
              className="w-full h-32 object-cover"
              fallbackStrategy="after-error"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-lg font-bold">{content.title}</h3>
                {content.subtitle && (
                  <p className="text-sm opacity-90">{content.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </PreviewSection>
      )}
    </div>
  );
};