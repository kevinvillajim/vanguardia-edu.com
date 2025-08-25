/**
 * Editor de Actividades - MVP
 * 
 * Componente para crear y editar actividades (solo profesores)
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  X, 
  AlertCircle,
  Save
} from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import { Activity, CreateActivityData } from '../../../../domain/entities/Activity';
import { activityService } from '../../../../services/activityService';
import { createComponentLogger } from '../../../../shared/utils/logger';

const logger = createComponentLogger('ActivityEditor');

interface ActivityEditorProps {
  courseId: number;
  moduleId?: string;
  activity?: Activity; // Para edición
  onSave: (activity: Activity) => void;
  onCancel: () => void;
}

const ACTIVITY_TYPES = [
  { value: 'assignment', label: 'Tarea', icon: '📝' },
  { value: 'project', label: 'Proyecto', icon: '🚀' },
  { value: 'essay', label: 'Ensayo', icon: '📄' },
  { value: 'presentation', label: 'Presentación', icon: '📊' }
];

const FILE_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'Word' },
  { value: 'docx', label: 'Word' },
  { value: 'ppt', label: 'PowerPoint' },
  { value: 'pptx', label: 'PowerPoint' },
  { value: 'jpg', label: 'Imagen JPG' },
  { value: 'png', label: 'Imagen PNG' },
  { value: 'mp4', label: 'Video MP4' },
  { value: 'zip', label: 'Archivo ZIP' }
];

export const ActivityEditor: React.FC<ActivityEditorProps> = ({
  courseId,
  moduleId,
  activity,
  onSave,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: activity?.title || '',
    description: activity?.description || '',
    type: activity?.type || 'assignment' as const,
    maxScore: activity?.maxScore || 100,
    dueDate: activity?.dueDate ? new Date(activity.dueDate).toISOString().slice(0, 16) : '',
    instructions: activity?.instructions || '',
    allowedFileTypes: activity?.allowedFileTypes || ['pdf', 'doc', 'docx'],
    maxFileSize: activity?.maxFileSize || 10 * 1024 * 1024, // 10MB default
    maxFiles: activity?.maxFiles || 3
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      // Validaciones básicas
      const validationErrors: string[] = [];
      
      if (!formData.title.trim()) {
        validationErrors.push('El título es obligatorio');
      }
      
      if (!formData.description.trim()) {
        validationErrors.push('La descripción es obligatoria');
      }
      
      if (!formData.dueDate) {
        validationErrors.push('La fecha límite es obligatoria');
      } else if (new Date(formData.dueDate) <= new Date()) {
        validationErrors.push('La fecha límite debe ser futura');
      }
      
      if (formData.maxScore <= 0) {
        validationErrors.push('La puntuación máxima debe ser mayor a 0');
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      const activityData: CreateActivityData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        maxScore: formData.maxScore,
        dueDate: new Date(formData.dueDate).toISOString(),
        courseId,
        moduleId,
        instructions: formData.instructions.trim() || undefined,
        allowedFileTypes: formData.allowedFileTypes,
        maxFileSize: formData.maxFileSize,
        maxFiles: formData.maxFiles
      };

      const result = await activityService.createActivity(activityData);

      if (result.success && result.data) {
        logger.success('Activity created successfully');
        onSave(result.data);
      } else {
        setErrors([result.error || 'Error creando la actividad']);
      }
    } catch (error) {
      logger.error('Error creating activity:', error);
      setErrors(['Error inesperado creando la actividad']);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)}MB`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {activity ? 'Editar Actividad' : 'Nueva Actividad'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configura la actividad para tus estudiantes
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Errores en el formulario:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información básica</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la actividad *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej. Ensayo sobre inteligencia artificial"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Describe qué deben hacer los estudiantes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de actividad
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {ACTIVITY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puntuación máxima
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.maxScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha límite de entrega *
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {/* Instrucciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Instrucciones detalladas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Instrucciones adicionales (opcional)
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Proporciona instrucciones detalladas, criterios de evaluación, recursos necesarios..."
              />
            </div>
          </div>

          {/* Configuración de archivos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              <Upload className="w-5 h-5 inline mr-2" />
              Configuración de entrega
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número máximo de archivos
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxFiles}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxFiles: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño máximo por archivo
                </label>
                <select
                  value={formData.maxFileSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={5 * 1024 * 1024}>5MB</option>
                  <option value={10 * 1024 * 1024}>10MB</option>
                  <option value={25 * 1024 * 1024}>25MB</option>
                  <option value={50 * 1024 * 1024}>50MB</option>
                  <option value={100 * 1024 * 1024}>100MB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipos de archivo permitidos
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FILE_TYPES.map(fileType => (
                  <label key={fileType.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowedFileTypes.includes(fileType.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            allowedFileTypes: [...prev.allowedFileTypes, fileType.value]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            allowedFileTypes: prev.allowedFileTypes.filter(t => t !== fileType.value)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{fileType.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              leftIcon={!isLoading ? <Save className="w-4 h-4" /> : undefined}
            >
              {isLoading ? 'Guardando...' : 'Crear Actividad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityEditor;