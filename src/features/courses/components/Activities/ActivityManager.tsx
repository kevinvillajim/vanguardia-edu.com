/**
 * Gestor de Actividades - MVP
 * 
 * Componente principal que integra todas las funcionalidades de actividades
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus,
  Calendar, 
  Clock, 
  Users, 
  FileText,
  Eye,
  Edit3,
  Trash2,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import { Activity, ActivitySubmission } from '../../../../domain/entities/Activity';
import { activityService } from '../../../../services/activityService';
import { useAuth } from '../../../../shared/store/authStore';
import { createComponentLogger } from '../../../../shared/utils/logger';

// Importar componentes
import ActivityEditor from './ActivityEditor';
import ActivitySubmissionComponent from './ActivitySubmission';
import ActivityGrading from './ActivityGrading';

const logger = createComponentLogger('ActivityManager');

interface ActivityManagerProps {
  courseId: number;
  moduleId?: string;
  userRole: 'teacher' | 'student';
}

export const ActivityManager: React.FC<ActivityManagerProps> = ({
  courseId,
  moduleId,
  userRole
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, ActivitySubmission | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showActivityEditor, setShowActivityEditor] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [viewMode, setViewMode] = useState<'submission' | 'grading' | null>(null);

  // Cargar actividades
  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      let result;
      
      if (userRole === 'teacher') {
        result = await activityService.getActivitiesByCourse(courseId);
      } else {
        result = await activityService.getStudentActivities(courseId);
      }

      if (result.success) {
        const activitiesData = result.data || [];
        setActivities(activitiesData);

        // Si es estudiante, cargar sus entregas
        if (userRole === 'student') {
          const submissionPromises = activitiesData.map(async (activity) => {
            const submissionResult = await activityService.getStudentSubmission(activity.id);
            return {
              activityId: activity.id,
              submission: submissionResult.success ? submissionResult.data : null
            };
          });

          const submissionResults = await Promise.all(submissionPromises);
          const submissionsMap = submissionResults.reduce((acc, { activityId, submission }) => {
            acc[activityId] = submission;
            return acc;
          }, {} as Record<string, ActivitySubmission | null>);

          setSubmissions(submissionsMap);
        }
      }
    } catch (error) {
      logger.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userRole]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleCreateActivity = () => {
    setSelectedActivity(null);
    setShowActivityEditor(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowActivityEditor(true);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return;
    }

    const result = await activityService.deleteActivity(activityId);
    if (result.success) {
      await loadActivities();
    }
  };

  const handleActivitySaved = (activity: Activity) => {
    setShowActivityEditor(false);
    setSelectedActivity(null);
    loadActivities();
  };

  const openSubmission = (activity: Activity) => {
    setSelectedActivity(activity);
    setViewMode('submission');
  };

  const openGrading = (activity: Activity) => {
    setSelectedActivity(activity);
    setViewMode('grading');
  };

  const closeModal = () => {
    setSelectedActivity(null);
    setViewMode(null);
    // Recargar en caso de que hayan habido cambios
    loadActivities();
  };

  const getActivityStatus = (activity: Activity) => {
    const isOverdue = activityService.isActivityOverdue(activity);
    const timeInfo = activityService.getTimeUntilDue(activity);

    if (userRole === 'student') {
      const submission = submissions[activity.id];
      
      if (submission?.status === 'graded') {
        return {
          text: 'Calificado',
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />
        };
      } else if (submission?.status === 'submitted') {
        return {
          text: 'Entregado',
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <CheckCircle className="w-4 h-4" />
        };
      } else if (isOverdue) {
        return {
          text: 'Vencido',
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <AlertCircle className="w-4 h-4" />
        };
      } else {
        return {
          text: timeInfo.text,
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <Clock className="w-4 h-4" />
        };
      }
    } else {
      // Para profesores
      if (isOverdue) {
        return {
          text: 'Vencida',
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <AlertCircle className="w-4 h-4" />
        };
      } else {
        return {
          text: timeInfo.text,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <Clock className="w-4 h-4" />
        };
      }
    }
  };

  const getSubmissionScore = (activity: Activity) => {
    if (userRole !== 'student') return null;
    
    const submission = submissions[activity.id];
    if (submission?.status === 'graded') {
      return `${submission.score}/${submission.maxScore}`;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Cargando actividades...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Actividades</h2>
            <p className="text-gray-600 mt-1">
              {userRole === 'teacher' 
                ? 'Gestiona las actividades y califica entregas'
                : 'Ve tus actividades pendientes y entregadas'
              }
            </p>
          </div>
          
          {userRole === 'teacher' && (
            <Button
              variant="primary"
              onClick={handleCreateActivity}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nueva Actividad
            </Button>
          )}
        </div>

        {/* Lista de actividades */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {userRole === 'teacher' ? 'No hay actividades creadas' : 'No hay actividades disponibles'}
              </h3>
              <p className="text-gray-600 mb-4">
                {userRole === 'teacher' 
                  ? 'Crea tu primera actividad para comenzar a evaluar a tus estudiantes'
                  : 'Tu profesor aún no ha asignado actividades para este curso'
                }
              </p>
              {userRole === 'teacher' && (
                <Button
                  variant="primary"
                  onClick={handleCreateActivity}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Crear Primera Actividad
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {activities.map((activity) => {
                const status = getActivityStatus(activity);
                const score = getSubmissionScore(activity);
                
                return (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(activity.dueDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          
                          <div className="flex items-center">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            {activity.maxScore} puntos
                          </div>
                          
                          <div className="flex items-center capitalize">
                            <FileText className="w-4 h-4 mr-1" />
                            {activity.type}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                          {status.icon}
                          <span className="ml-1">{status.text}</span>
                        </div>
                        
                        {score && (
                          <div className="text-lg font-bold text-green-600">
                            {score}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-2">
                      {userRole === 'student' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openSubmission(activity)}
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          Ver Actividad
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openGrading(activity)}
                            leftIcon={<Users className="w-4 h-4" />}
                          >
                            Ver Entregas
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditActivity(activity)}
                            leftIcon={<Edit3 className="w-4 h-4" />}
                          >
                            Editar
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteActivity(activity.id)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showActivityEditor && (
        <ActivityEditor
          courseId={courseId}
          moduleId={moduleId}
          activity={selectedActivity || undefined}
          onSave={handleActivitySaved}
          onCancel={() => setShowActivityEditor(false)}
        />
      )}

      {selectedActivity && viewMode === 'submission' && (
        <ActivitySubmissionComponent
          activity={selectedActivity}
          onClose={closeModal}
        />
      )}

      {selectedActivity && viewMode === 'grading' && (
        <ActivityGrading
          activity={selectedActivity}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default ActivityManager;