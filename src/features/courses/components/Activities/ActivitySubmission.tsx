/**
 * Entrega de Actividades - MVP
 * 
 * Componente para que estudiantes vean detalles y entreguen actividades
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Download,
  AlertCircle,
  CheckCircle,
  X,
  File,
  Send
} from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import { Activity, ActivitySubmission } from '../../../../domain/entities/Activity';
import { activityService } from '../../../../services/activityService';
import { createComponentLogger } from '../../../../shared/utils/logger';

const logger = createComponentLogger('ActivitySubmission');

interface ActivitySubmissionProps {
  activity: Activity;
  onClose: () => void;
}

export const ActivitySubmissionComponent: React.FC<ActivitySubmissionProps> = ({
  activity,
  onClose
}) => {
  const [submission, setSubmission] = useState<ActivitySubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [studentNotes, setStudentNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Cargar entrega existente
  const loadSubmission = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await activityService.getStudentSubmission(activity.id);
      if (result.success) {
        setSubmission(result.data);
        if (result.data?.studentNotes) {
          setStudentNotes(result.data.studentNotes);
        }
      }
    } catch (error) {
      logger.error('Error loading submission:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activity.id]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar archivos
    const validation = activityService.validateFiles(files, activity);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setSelectedFiles(files);
    setErrors([]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0 && !submission) {
      setErrors(['Debes seleccionar al menos un archivo para entregar']);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const result = await activityService.submitActivity({
        activityId: activity.id,
        studentNotes: studentNotes.trim() || undefined,
        files: selectedFiles
      });

      if (result.success && result.data) {
        logger.success('Activity submitted successfully');
        setSubmission(result.data);
        setSelectedFiles([]);
        // Recargar para obtener la información actualizada
        await loadSubmission();
      } else {
        setErrors([result.error || 'Error entregando la actividad']);
      }
    } catch (error) {
      logger.error('Error submitting activity:', error);
      setErrors(['Error inesperado entregando la actividad']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadFile = async (file: any, fileName: string) => {
    try {
      await activityService.downloadSubmissionFile(file.id, fileName);
    } catch (error) {
      logger.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb >= 1) {
      return `${mb.toFixed(1)}MB`;
    } else {
      return `${kb.toFixed(0)}KB`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'text-blue-600 bg-blue-50';
      case 'graded':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Entregado';
      case 'graded':
        return 'Calificado';
      default:
        return 'Borrador';
    }
  };

  const timeUntilDue = activityService.getTimeUntilDue(activity);
  const isOverdue = activityService.isActivityOverdue(activity);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(activity.dueDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isOverdue ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
              }`}>
                <Clock className="w-3 h-3 mr-1" />
                {timeUntilDue.text}
              </div>
              {submission && (
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                  {getStatusText(submission.status)}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-700">{activity.description}</p>
          </div>

          {/* Instrucciones */}
          {activity.instructions && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                <FileText className="w-5 h-5 inline mr-1" />
                Instrucciones
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                  {activity.instructions}
                </pre>
              </div>
            </div>
          )}

          {/* Información de entrega */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activity.maxScore}</div>
              <div className="text-sm text-blue-700">Puntos máximos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activity.maxFiles}</div>
              <div className="text-sm text-blue-700">Archivos máximo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatFileSize(activity.maxFileSize)}
              </div>
              <div className="text-sm text-blue-700">Tamaño máximo</div>
            </div>
          </div>

          {/* Tipos de archivo permitidos */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tipos de archivo permitidos:</h4>
            <div className="flex flex-wrap gap-2">
              {activity.allowedFileTypes.map(type => (
                <span
                  key={type}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded uppercase font-mono"
                >
                  .{type}
                </span>
              ))}
            </div>
          </div>

          {/* Entrega actual si existe */}
          {submission && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tu entrega actual</h3>
              
              {submission.status === 'graded' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Calificado</span>
                    </div>
                    <div className="text-lg font-bold text-green-800">
                      {submission.score}/{submission.maxScore} puntos
                    </div>
                  </div>
                  {submission.feedback && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">Comentarios del profesor:</h4>
                      <p className="text-green-700">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Archivos entregados */}
              {submission.files && submission.files.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Archivos entregados:</h4>
                  <div className="space-y-2">
                    {submission.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <File className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="font-medium">{file.originalName}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({formatFileSize(file.fileSize)})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(file, file.originalName)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas del estudiante */}
              {submission.studentNotes && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Tus notas:</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700">{submission.studentNotes}</p>
                  </div>
                </div>
              )}

              <div className="mt-3 text-sm text-gray-500">
                Entregado el {new Date(submission.submittedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}

          {/* Formulario de entrega (solo si no está calificado) */}
          {(!submission || submission.status !== 'graded') && !isOverdue && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {submission ? 'Actualizar entrega' : 'Nueva entrega'}
                </h3>

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2" />
                      <div>
                        <ul className="text-sm text-red-700 space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* File upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="w-4 h-4 inline mr-1" />
                    Seleccionar archivos
                  </label>
                  <input
                    type="file"
                    multiple
                    accept={activity.allowedFileTypes.map(type => `.${type}`).join(',')}
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo {activity.maxFiles} archivos, {formatFileSize(activity.maxFileSize)} cada uno
                  </p>
                </div>

                {/* Selected files */}
                {selectedFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Archivos seleccionados:</h4>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                          <div className="flex items-center">
                            <File className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="font-medium">{file.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Student notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentarios adicionales (opcional)
                  </label>
                  <textarea
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Agrega cualquier comentario sobre tu entrega..."
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  leftIcon={!isSubmitting ? <Send className="w-4 h-4" /> : undefined}
                  disabled={selectedFiles.length === 0 && !submission}
                >
                  {isSubmitting ? 'Entregando...' : (submission ? 'Actualizar Entrega' : 'Entregar Actividad')}
                </Button>
              </div>
            </form>
          )}

          {/* Mensaje si está vencida */}
          {isOverdue && !submission && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-red-800 font-medium">Esta actividad ya venció</p>
              <p className="text-red-600 text-sm">No es posible realizar entregas después de la fecha límite</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitySubmissionComponent;