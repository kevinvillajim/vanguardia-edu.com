import React, { useState, useEffect } from 'react';
import { Save, X, Edit3, FileVideo, FileImage, FileText, Type, List } from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import { courseService } from '../../../../services/courseService';

// Import specific modal components
import { BannerEditor } from './modals/BannerEditor';
import { VideoEditor } from './modals/VideoEditor';
import { ImageEditor } from './modals/ImageEditor';
import { ReadingEditor } from './modals/ReadingEditor';
import { QuizEditor } from './modals/QuizEditor';
import { DocumentEditor } from './modals/DocumentEditor';
import { AudioEditor } from './modals/AudioEditor';

interface ComponentData {
  id: string;
  type: string;
  title: string;
  content?: any;
  fileUrl?: string;
  metadata?: any;
  isMandatory?: boolean;
  order?: number;
  duration?: number;
}

interface SpecificComponentModalProps {
  component: ComponentData;
  moduleId: string;
  onSave: (updatedComponent: ComponentData) => void;
  onCancel: () => void;
}

export const SpecificComponentModal: React.FC<SpecificComponentModalProps> = ({
  component,
  moduleId,
  onSave,
  onCancel
}) => {
  const [editedComponent, setEditedComponent] = useState<ComponentData>(component);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedComponent(component);
  }, [component]);

  const handleSave = async () => {
    if (!editedComponent.title?.trim()) {
      setError('El título es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Si el componente tiene un ID real (no temporal), actualizar en backend
      if (!editedComponent.id.startsWith('component-temp-')) {
        const result = await courseService.updateComponent(parseInt(editedComponent.id), {
          title: editedComponent.title,
          content: editedComponent.content,
          metadata: editedComponent.metadata
        });

        if (result.success) {
          onSave(editedComponent);
        } else {
          setError(result.error || 'Error al guardar el componente');
        }
      } else {
        // Componente temporal, guardar solo localmente
        onSave(editedComponent);
      }
    } catch (error) {
      console.error('Error saving component:', error);
      setError('Error al guardar el componente');
    } finally {
      setSaving(false);
    }
  };

  const updateComponent = (updates: Partial<ComponentData>) => {
    setEditedComponent(prev => ({ ...prev, ...updates }));
  };

  const getComponentIcon = () => {
    switch (editedComponent.type) {
      case 'banner':
        return <FileImage className="w-5 h-5" />;
      case 'video':
        return <FileVideo className="w-5 h-5" />;
      case 'image':
        return <FileImage className="w-5 h-5" />;
      case 'reading':
        return <Type className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'audio':
        return <FileVideo className="w-5 h-5" />;
      case 'quiz':
        return <List className="w-5 h-5" />;
      default:
        return <Edit3 className="w-5 h-5" />;
    }
  };

  const renderSpecificEditor = () => {
    const commonProps = {
      component: editedComponent,
      onUpdate: updateComponent,
      moduleId
    };

    switch (editedComponent.type) {
      case 'banner':
        return <BannerEditor {...commonProps} />;
      case 'video':
        return <VideoEditor {...commonProps} />;
      case 'image':
        return <ImageEditor {...commonProps} />;
      case 'reading':
        return <ReadingEditor {...commonProps} />;
      case 'document':
        return <DocumentEditor {...commonProps} />;
      case 'audio':
        return <AudioEditor {...commonProps} />;
      case 'quiz':
        return <QuizEditor {...commonProps} />;
      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Editor específico no disponible para este tipo de componente
            </p>
          </div>
        );
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getComponentIcon()}
              <div>
                <input
                  type="text"
                  value={editedComponent.title}
                  onChange={(e) => updateComponent({ title: e.target.value })}
                  className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="Título del componente"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tipo: {editedComponent.type}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {renderSpecificEditor()}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};