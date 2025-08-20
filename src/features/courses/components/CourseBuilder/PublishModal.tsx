import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CourseData } from '../../pages/CreateCoursePage';
import { courseService } from '../../../../services/courses/courseService';
import { Card } from '../../../../shared/components/ui/Card/Card';
import { Button } from "@/shared/components/ui/Button/Button";

interface PublishModalProps {
  courseData: CourseData;
  onClose: () => void;
  onPublish: (publishData: any) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  courseData,
  onClose,
  onPublish
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishOptions, setPublishOptions] = useState({
    publish_immediately: true,
    send_notifications: true,
    allow_reviews: true,
    is_featured: false
  });

  const totalLessons = courseData.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const totalDuration = courseData.modules.reduce((sum, module) => 
    sum + module.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.duration_minutes, 0), 0
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      // Preparar los datos para enviar al backend
      const publishData = {
        ...courseData,
        ...publishOptions,
        total_lessons: totalLessons,
        total_duration_minutes: totalDuration,
        status: publishOptions.publish_immediately ? 'published' : 'draft'
      };

      // Simular la publicación (en una implementación real, esto iría al backend)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En una implementación real:
      // const result = await courseService.createCourse(publishData);
      
      onPublish(publishData);
    } catch (error) {
      console.error('Error publishing course:', error);
      // Manejar error
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Publicar Curso</h2>
              <p className="text-gray-600 mt-1">Revisa los detalles antes de publicar</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Course Summary */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Resumen del Curso</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Título:</span>
                  <span className="font-medium text-right">{courseData.title}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Módulos:</span>
                  <span className="font-medium">{courseData.modules.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Lecciones totales:</span>
                  <span className="font-medium">{totalLessons}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración total:</span>
                  <span className="font-medium">{formatDuration(totalDuration)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-medium">
                    {courseData.is_free ? 'Gratis' : `$${courseData.price.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-medium capitalize">{courseData.difficulty_level}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Publishing Options */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Opciones de Publicación</h3>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={publishOptions.publish_immediately}
                    onChange={(e) => setPublishOptions(prev => ({
                      ...prev,
                      publish_immediately: e.target.checked
                    }))}
                    className="mt-1 text-[var(--color-primary)]"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Publicar inmediatamente</p>
                    <p className="text-sm text-gray-600">
                      El curso estará disponible para los estudiantes de inmediato
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={publishOptions.send_notifications}
                    onChange={(e) => setPublishOptions(prev => ({
                      ...prev,
                      send_notifications: e.target.checked
                    }))}
                    className="mt-1 text-[var(--color-primary)]"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Enviar notificaciones</p>
                    <p className="text-sm text-gray-600">
                      Notificar a tus seguidores sobre el nuevo curso
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={publishOptions.allow_reviews}
                    onChange={(e) => setPublishOptions(prev => ({
                      ...prev,
                      allow_reviews: e.target.checked
                    }))}
                    className="mt-1 text-[var(--color-primary)]"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Permitir reseñas</p>
                    <p className="text-sm text-gray-600">
                      Los estudiantes podrán dejar reseñas y calificaciones
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={publishOptions.is_featured}
                    onChange={(e) => setPublishOptions(prev => ({
                      ...prev,
                      is_featured: e.target.checked
                    }))}
                    className="mt-1 text-[var(--color-primary)]"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Destacar curso</p>
                    <p className="text-sm text-gray-600">
                      Mostrar este curso en las secciones destacadas
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* Course Checklist */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Lista de Verificación</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg 
                    className={`w-5 h-5 ${courseData.title ? 'text-green-500' : 'text-gray-400'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={courseData.title ? 'text-gray-900' : 'text-gray-500'}>
                    Título del curso
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <svg 
                    className={`w-5 h-5 ${courseData.description ? 'text-green-500' : 'text-gray-400'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={courseData.description ? 'text-gray-900' : 'text-gray-500'}>
                    Descripción del curso
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <svg 
                    className={`w-5 h-5 ${courseData.modules.length > 0 ? 'text-green-500' : 'text-gray-400'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={courseData.modules.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                    Al menos un módulo
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <svg 
                    className={`w-5 h-5 ${totalLessons > 0 ? 'text-green-500' : 'text-gray-400'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={totalLessons > 0 ? 'text-gray-900' : 'text-gray-500'}>
                    Al menos una lección
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <svg 
                    className={`w-5 h-5 ${courseData.learning_objectives.length > 0 ? 'text-green-500' : 'text-orange-400'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={courseData.learning_objectives.length > 0 ? 'text-gray-900' : 'text-orange-600'}>
                    Objetivos de aprendizaje (recomendado)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <svg 
                    className={`w-5 h-5 ${courseData.banner_image ? 'text-green-500' : 'text-orange-400'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={courseData.banner_image ? 'text-gray-900' : 'text-orange-600'}>
                    Imagen del curso (recomendado)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Warning Message */}
          {!publishOptions.publish_immediately && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.66-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">
                    El curso se guardará como borrador
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Podrás publicarlo más tarde desde tu dashboard de instructor.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPublishing}
          >
            Cancelar
          </Button>
          
          <Button
            variant="primary"
            onClick={handlePublish}
            loading={isPublishing}
            disabled={!courseData.title || courseData.modules.length === 0 || totalLessons === 0}
          >
            {isPublishing 
              ? 'Publicando...' 
              : publishOptions.publish_immediately 
                ? 'Publicar Curso' 
                : 'Guardar como Borrador'
            }
          </Button>
        </div>
      </motion.div>
    </div>
  );
};