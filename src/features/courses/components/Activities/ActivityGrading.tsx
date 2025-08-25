/**
 * Calificación de Actividades - MVP
 * 
 * Componente para que profesores vean entregas y califiquen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Download, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  X,
  Save,
  File,
  MessageSquare
} from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import { Activity, ActivitySubmission, ActivityStats } from '../../../../domain/entities/Activity';
import { activityService } from '../../../../services/activityService';
import { createComponentLogger } from '../../../../shared/utils/logger';

const logger = createComponentLogger('ActivityGrading');

interface ActivityGradingProps {
  activity: Activity;
  onClose: () => void;
}

export const ActivityGrading: React.FC<ActivityGradingProps> = ({
  activity,
  onClose
}) => {
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ActivitySubmission | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  
  const [gradeForm, setGradeForm] = useState({
    score: 0,
    feedback: ''
  });

  // Cargar entregas
  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [submissionsResult, statsResult] = await Promise.all([
        activityService.getActivitySubmissions(activity.id),
        activityService.getActivityStats(activity.id)
      ]);

      if (submissionsResult.success) {
        setSubmissions(submissionsResult.data || []);
      }

      if (statsResult.success) {
        setStats(statsResult.data || null);
      }
    } catch (error) {
      logger.error('Error loading submissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activity.id]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const openGradeModal = (submission: ActivitySubmission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      score: submission.score || 0,
      feedback: submission.feedback || ''
    });
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubmission) return;

    setIsGrading(true);

    try {
      const result = await activityService.gradeSubmission({
        submissionId: selectedSubmission.id,
        score: gradeForm.score,
        feedback: gradeForm.feedback.trim() || undefined
      });

      if (result.success) {
        logger.success('Submission graded successfully');
        setSelectedSubmission(null);
        // Recargar entregas
        await loadSubmissions();
      } else {
        logger.error('Error grading submission:', result.error);
      }
    } catch (error) {
      logger.error('Error grading submission:', error);
    } finally {
      setIsGrading(false);
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
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'graded':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'graded':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Cargando entregas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Entregas: {activity.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Revisa y califica las entregas de tus estudiantes
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Estadísticas */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                  <div className="text-sm text-blue-700">Total estudiantes</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
                  <div className="text-sm text-green-700">Entregados</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.graded}</div>
                  <div className="text-sm text-purple-700">Calificados</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.onTime}</div>
                  <div className="text-sm text-yellow-700">A tiempo</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.late}</div>
                  <div className="text-sm text-red-700">Tarde</div>
                </div>
              </div>
            )}

            {/* Lista de entregas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Entregas de estudiantes ({submissions.length})
              </h3>

              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aún no hay entregas para esta actividad</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {submissions.map((submission) => {
                    const isLate = new Date(submission.submittedAt) > new Date(activity.dueDate);
                    
                    return (
                      <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Estudiante ID: {submission.studentId}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Entregado el {new Date(submission.submittedAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {isLate && (
                                <span className="ml-2 text-red-600 font-medium">(Tarde)</span>
                              )}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                              {getStatusIcon(submission.status)}
                              <span className="ml-1">
                                {submission.status === 'submitted' ? 'Por calificar' : 
                                 submission.status === 'graded' ? 'Calificado' : 'Borrador'}
                              </span>
                            </div>
                            
                            {submission.status === 'graded' && (
                              <div className="text-lg font-bold text-green-600">
                                {submission.score}/{submission.maxScore}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Archivos */}
                        {submission.files && submission.files.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Archivos:</h5>
                            <div className="space-y-1">
                              {submission.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                                  <div className="flex items-center">
                                    <File className="w-4 h-4 text-gray-500 mr-2" />
                                    <span className="text-sm">{file.originalName}</span>
                                    <span className="text-xs text-gray-500 ml-2">
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
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Comentarios del estudiante:</h5>
                            <div className="bg-blue-50 rounded p-3 text-sm text-gray-700">
                              {submission.studentNotes}
                            </div>
                          </div>
                        )}

                        {/* Feedback del profesor */}
                        {submission.feedback && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Tu feedback:</h5>
                            <div className="bg-green-50 rounded p-3 text-sm text-gray-700">
                              {submission.feedback}
                            </div>
                          </div>
                        )}

                        {/* Botón calificar */}
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant={submission.status === 'graded' ? 'ghost' : 'primary'}
                            size="sm"
                            onClick={() => openGradeModal(submission)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {submission.status === 'graded' ? 'Editar calificación' : 'Calificar'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de calificación */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Calificar entrega - Estudiante {selectedSubmission.studentId}
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrade} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación (máximo {activity.maxScore} puntos)
                </label>
                <input
                  type="number"
                  min="0"
                  max={activity.maxScore}
                  step="0.1"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, score: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios y feedback (opcional)
                </label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Proporciona feedback constructivo al estudiante..."
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedSubmission(null)}
                  disabled={isGrading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isGrading}
                  leftIcon={!isGrading ? <Save className="w-4 h-4" /> : undefined}
                >
                  {isGrading ? 'Guardando...' : 'Guardar Calificación'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityGrading;