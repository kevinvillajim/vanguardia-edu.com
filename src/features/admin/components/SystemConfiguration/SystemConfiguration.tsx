import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  TrophyIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  certificates: {
    virtualThreshold: number;
    completeThreshold: number;
    allowRetry: boolean;
    autoGenerate: boolean;
  };
  grading: {
    interactiveWeight: number;
    activitiesWeight: number;
    passingGrade: number;
    maxQuizAttempts: number;
  };
  courses: {
    maxStudentsPerCourse: number;
    allowSelfEnrollment: boolean;
    requireApproval: boolean;
    defaultCourseDuration: number;
  };
  notifications: {
    emailOnCompletion: boolean;
    emailOnGrading: boolean;
    reminderDays: number;
    digestFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

const defaultSettings: SystemSettings = {
  certificates: {
    virtualThreshold: 80,
    completeThreshold: 70,
    allowRetry: true,
    autoGenerate: true
  },
  grading: {
    interactiveWeight: 50,
    activitiesWeight: 50,
    passingGrade: 60,
    maxQuizAttempts: 3
  },
  courses: {
    maxStudentsPerCourse: 100,
    allowSelfEnrollment: true,
    requireApproval: false,
    defaultCourseDuration: 30
  },
  notifications: {
    emailOnCompletion: true,
    emailOnGrading: true,
    reminderDays: 3,
    digestFrequency: 'weekly'
  }
};

export const SystemConfiguration: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('certificates');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // const response = await api.get('/admin/system-settings');
      // setSettings(response.data);
      
      // Simulación de carga
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading settings:', error);
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      // await api.put('/admin/system-settings', settings);
      
      // Simulación de guardado
      setTimeout(() => {
        setIsLoading(false);
        setHasChanges(false);
        alert('Configuración guardada exitosamente');
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setIsLoading(false);
      alert('Error al guardar la configuración');
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const tabs = [
    { id: 'certificates', label: 'Certificaciones', icon: TrophyIcon },
    { id: 'grading', label: 'Calificaciones', icon: ChartBarIcon },
    { id: 'courses', label: 'Cursos', icon: AcademicCapIcon },
    { id: 'notifications', label: 'Notificaciones', icon: DocumentTextIcon }
  ];

  if (isLoading && !hasChanges) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cog6ToothIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Configuración del Sistema
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gestiona los parámetros globales de la plataforma educativa
                </p>
              </div>
            </div>
            {hasChanges && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">Cambios sin guardar</span>
                </div>
                <button
                  onClick={saveSettings}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                  )}
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navegación de tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenido de configuración */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Certificaciones */}
              {activeTab === 'certificates' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <TrophyIcon className="h-6 w-6 text-yellow-500 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Configuración de Certificaciones
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Umbrales de certificación */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Umbrales de Certificación
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Certificado Virtual (% completitud mínima)
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="50"
                              max="100"
                              step="5"
                              value={settings.certificates.virtualThreshold}
                              onChange={(e) => updateSetting('certificates', 'virtualThreshold', Number(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 w-12">
                              {settings.certificates.virtualThreshold}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Porcentaje mínimo de completitud del curso interactivo
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Certificado Completo (promedio mínimo)
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="50"
                              max="100"
                              step="5"
                              value={settings.certificates.completeThreshold}
                              onChange={(e) => updateSetting('certificates', 'completeThreshold', Number(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-lg font-semibold text-green-600 dark:text-green-400 w-12">
                              {settings.certificates.completeThreshold}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Promedio final mínimo (curso interactivo + actividades)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Opciones adicionales */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Opciones de Certificación
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.certificates.allowRetry}
                            onChange={(e) => updateSetting('certificates', 'allowRetry', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            Permitir reintentos para obtener certificado completo
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.certificates.autoGenerate}
                            onChange={(e) => updateSetting('certificates', 'autoGenerate', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            Generar certificados automáticamente al cumplir requisitos
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Información de ayuda */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          <p className="font-medium mb-1">Sistema de Certificación Dual:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• <strong>Certificado Virtual:</strong> Se otorga al completar el porcentaje mínimo del curso interactivo</li>
                            <li>• <strong>Certificado Completo:</strong> Requiere Certificado Virtual + promedio final mínimo</li>
                            <li>• Los estudiantes pueden conservar el Virtual aunque no obtengan el Completo</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calificaciones */}
              {activeTab === 'grading' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <ChartBarIcon className="h-6 w-6 text-blue-500 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Configuración de Calificaciones
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Pesos de calificación */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Pesos en el Promedio Final
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Peso Curso Interactivo (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={settings.grading.interactiveWeight}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              updateSetting('grading', 'interactiveWeight', value);
                              updateSetting('grading', 'activitiesWeight', 100 - value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Peso Actividades Profesor (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={settings.grading.activitiesWeight}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              updateSetting('grading', 'activitiesWeight', value);
                              updateSetting('grading', 'interactiveWeight', 100 - value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div 
                            className="bg-blue-500 transition-all duration-300"
                            style={{ width: `${settings.grading.interactiveWeight}%` }}
                          />
                          <div 
                            className="bg-green-500 transition-all duration-300"
                            style={{ width: `${settings.grading.activitiesWeight}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Interactivo: {settings.grading.interactiveWeight}%</span>
                        <span>Actividades: {settings.grading.activitiesWeight}%</span>
                      </div>
                    </div>

                    {/* Configuraciones adicionales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nota Mínima Aprobatoria (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={settings.grading.passingGrade}
                          onChange={(e) => updateSetting('grading', 'passingGrade', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Máximo Intentos por Quiz
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={settings.grading.maxQuizAttempts}
                          onChange={(e) => updateSetting('grading', 'maxQuizAttempts', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cursos */}
              {activeTab === 'courses' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <AcademicCapIcon className="h-6 w-6 text-green-500 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Configuración de Cursos
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Máximo Estudiantes por Curso
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={settings.courses.maxStudentsPerCourse}
                          onChange={(e) => updateSetting('courses', 'maxStudentsPerCourse', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Duración Predeterminada (días)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={settings.courses.defaultCourseDuration}
                          onChange={(e) => updateSetting('courses', 'defaultCourseDuration', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.courses.allowSelfEnrollment}
                          onChange={(e) => updateSetting('courses', 'allowSelfEnrollment', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          Permitir auto-inscripción de estudiantes
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.courses.requireApproval}
                          onChange={(e) => updateSetting('courses', 'requireApproval', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          Requerir aprobación del profesor para inscripciones
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notificaciones */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <DocumentTextIcon className="h-6 w-6 text-purple-500 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Configuración de Notificaciones
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Notificaciones por Email
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailOnCompletion}
                            onChange={(e) => updateSetting('notifications', 'emailOnCompletion', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            Enviar email al completar curso
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailOnGrading}
                            onChange={(e) => updateSetting('notifications', 'emailOnGrading', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            Enviar email al recibir calificaciones
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Días para Recordatorios
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={settings.notifications.reminderDays}
                          onChange={(e) => updateSetting('notifications', 'reminderDays', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Frecuencia de Resúmenes
                        </label>
                        <select
                          value={settings.notifications.digestFrequency}
                          onChange={(e) => updateSetting('notifications', 'digestFrequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="daily">Diario</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensual</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;