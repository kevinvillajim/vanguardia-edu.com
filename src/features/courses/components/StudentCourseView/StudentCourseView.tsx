import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { 
  PlayCircleIcon, 
  BookOpenIcon, 
  ClipboardDocumentCheckIcon,
  TrophyIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

interface ModuleComponent {
  id: string;
  type: 'banner' | 'video' | 'reading' | 'image' | 'document' | 'quiz';
  title: string;
  content?: string;
  fileUrl?: string;
  duration?: number;
  isCompleted: boolean;
  isMandatory: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  components: ModuleComponent[];
  quiz?: {
    id: string;
    title: string;
    questions: number;
    timeLimit?: number;
    attempts: number;
    maxAttempts: number;
    bestScore?: number;
    isPassed: boolean;
  };
  progress: number;
}

interface CourseActivity {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'project' | 'essay' | 'presentation';
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'returned';
  score?: number;
  maxScore: number;
  feedback?: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  activities: CourseActivity[];
  progress: {
    overall: number;
    interactive: number;
    activities: number;
  };
  grades: {
    interactiveAverage: number;
    activitiesAverage: number;
    finalScore: number;
  };
  certificates: {
    virtual: boolean;
    complete: boolean;
  };
}

export const StudentCourseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [currentComponent, setCurrentComponent] = useState<ModuleComponent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del curso
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // Simulación de carga de datos
      setLoading(true);
      // const response = await api.get(`/courses/${id}/student-view`);
      // setCourseData(response.data);
      
      // Datos de ejemplo
      setCourseData({
        id: '1',
        title: 'Ciberseguridad Empresarial',
        description: 'Curso completo sobre seguridad informática para empresas',
        modules: [
          {
            id: '1',
            title: 'Módulo 1: Introducción a la Ciberseguridad',
            description: 'Conceptos fundamentales de seguridad',
            components: [
              { id: '1', type: 'banner', title: 'Bienvenida al Módulo', isCompleted: true, isMandatory: true },
              { id: '2', type: 'video', title: 'Video: Conceptos Básicos', duration: 15, isCompleted: true, isMandatory: true },
              { id: '3', type: 'reading', title: 'Lectura: Fundamentos', duration: 10, isCompleted: false, isMandatory: true },
              { id: '4', type: 'document', title: 'Material Complementario', isCompleted: false, isMandatory: false }
            ],
            quiz: {
              id: '1',
              title: 'Evaluación Módulo 1',
              questions: 10,
              timeLimit: 20,
              attempts: 1,
              maxAttempts: 3,
              bestScore: 85,
              isPassed: true
            },
            progress: 60
          }
        ],
        activities: [
          {
            id: '1',
            title: 'Proyecto: Análisis de Vulnerabilidades',
            description: 'Realizar un análisis completo de vulnerabilidades en un sistema',
            type: 'project',
            dueDate: '2025-09-01',
            status: 'pending',
            maxScore: 100
          },
          {
            id: '2',
            title: 'Ensayo: Importancia de la Ciberseguridad',
            description: 'Escribir un ensayo de 1000 palabras',
            type: 'essay',
            dueDate: '2025-08-25',
            status: 'submitted',
            maxScore: 100
          }
        ],
        progress: {
          overall: 65,
          interactive: 75,
          activities: 50
        },
        grades: {
          interactiveAverage: 82,
          activitiesAverage: 78,
          finalScore: 80
        },
        certificates: {
          virtual: false,
          complete: false
        }
      });
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'video': return PlayCircleIcon;
      case 'reading': return BookOpenIcon;
      case 'document': return DocumentTextIcon;
      case 'quiz': return ClipboardDocumentCheckIcon;
      default: return DocumentTextIcon;
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'submitted': return 'text-blue-600 dark:text-blue-400';
      case 'graded': return 'text-green-600 dark:text-green-400';
      case 'returned': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Curso no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header del curso */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {courseData.title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {courseData.description}
          </p>
          
          {/* Barra de progreso general */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progreso General
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {courseData.progress.overall}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${courseData.progress.overall}%` }}
              />
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Promedio Interactivo</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {courseData.grades.interactiveAverage}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Promedio Actividades</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {courseData.grades.activitiesAverage}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Promedio Final</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {courseData.grades.finalScore}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-purple-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Certificados</p>
                  <div className="flex space-x-2 mt-1">
                    {courseData.certificates.virtual && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        Virtual
                      </span>
                    )}
                    {courseData.certificates.complete && (
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                        Completo
                      </span>
                    )}
                    {!courseData.certificates.virtual && !courseData.certificates.complete && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido con tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 dark:bg-gray-800 p-1">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                ${selected
                  ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Contenido Interactivo
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                ${selected
                  ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
                Actividades del Profesor
              </div>
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-6">
            {/* Tab de Contenido Interactivo */}
            <Tab.Panel>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de módulos */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Módulos del Curso
                  </h3>
                  <div className="space-y-3">
                    {courseData.modules.map((module) => (
                      <div
                        key={module.id}
                        onClick={() => setSelectedModule(module)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all
                          ${selectedModule?.id === module.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {module.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {module.description}
                            </p>
                          </div>
                          {module.progress === 100 && (
                            <CheckCircleSolidIcon className="h-5 w-5 text-green-500 ml-2" />
                          )}
                        </div>
                        {/* Progreso del módulo */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Progreso</span>
                            <span>{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contenido del módulo seleccionado */}
                <div className="lg:col-span-2">
                  {selectedModule ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {selectedModule.title}
                      </h3>
                      
                      {/* Componentes del módulo */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Contenido del Módulo
                        </h4>
                        {selectedModule.components.map((component) => {
                          const Icon = getComponentIcon(component.type);
                          return (
                            <div
                              key={component.id}
                              onClick={() => setCurrentComponent(component)}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                ${currentComponent?.id === component.id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                              <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {component.title}
                                </p>
                                {component.duration && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {component.duration} minutos
                                  </p>
                                )}
                              </div>
                              {component.isMandatory && (
                                <span className="text-xs text-red-500 mr-2">*</span>
                              )}
                              {component.isCompleted && (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Quiz del módulo */}
                      {selectedModule.quiz && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                                <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                {selectedModule.quiz.title}
                              </h4>
                              <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p>• {selectedModule.quiz.questions} preguntas</p>
                                {selectedModule.quiz.timeLimit && (
                                  <p>• Tiempo límite: {selectedModule.quiz.timeLimit} minutos</p>
                                )}
                                <p>• Intentos: {selectedModule.quiz.attempts}/{selectedModule.quiz.maxAttempts}</p>
                                {selectedModule.quiz.bestScore !== undefined && (
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    Mejor puntuación: {selectedModule.quiz.bestScore}%
                                  </p>
                                )}
                              </div>
                            </div>
                            {selectedModule.quiz.isPassed && (
                              <div className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Aprobado
                              </div>
                            )}
                          </div>
                          <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                            {selectedModule.quiz.attempts > 0 ? 'Reintentar Quiz' : 'Iniciar Quiz'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                      <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Selecciona un módulo para ver su contenido
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>

            {/* Tab de Actividades del Profesor */}
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4">
                {courseData.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {activity.title}
                          </h3>
                          <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getActivityStatusColor(activity.status)} bg-opacity-10`}>
                            {activity.status === 'pending' && 'Pendiente'}
                            {activity.status === 'submitted' && 'Entregado'}
                            {activity.status === 'graded' && 'Calificado'}
                            {activity.status === 'returned' && 'Devuelto'}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Fecha límite: {formatDate(activity.dueDate)}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Tipo: {activity.type}
                          </div>
                        </div>
                      </div>
                      
                      {/* Puntuación */}
                      <div className="ml-6 text-right">
                        {activity.score !== undefined ? (
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {activity.score}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              / {activity.maxScore}
                            </p>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <p className="text-sm">Puntuación máxima</p>
                            <p className="text-xl font-semibold">{activity.maxScore}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback del profesor */}
                    {activity.feedback && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Retroalimentación del profesor:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.feedback}
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="mt-4 flex space-x-3">
                      {activity.status === 'pending' && (
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                          Entregar Actividad
                        </button>
                      )}
                      {activity.status === 'submitted' && (
                        <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors" disabled>
                          Esperando Calificación
                        </button>
                      )}
                      {(activity.status === 'graded' || activity.status === 'returned') && (
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                          Ver Detalles
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {courseData.activities.length === 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <ClipboardDocumentCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay actividades asignadas en este momento
                    </p>
                  </div>
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default StudentCourseView;