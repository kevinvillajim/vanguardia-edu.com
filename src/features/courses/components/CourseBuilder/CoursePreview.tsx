import React from 'react';
import { motion } from 'framer-motion';
import { CourseData } from '../../pages/CreateCoursePage';
import { Card } from '../../../../shared/components/ui/Card/Card';

interface CoursePreviewProps {
  courseData: CourseData;
}

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

export const CoursePreview: React.FC<CoursePreviewProps> = ({ courseData }) => {
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

  const formatPrice = (price: number) => {
    return courseData.is_free ? 'Gratis' : `$${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vista Previa del Curso</h2>
          <p className="text-gray-600">Así es como verán tu curso los estudiantes</p>
        </div>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-xl"
        >
          <div className="relative h-64 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]">
            {courseData.banner_image && (
              <img
                src={courseData.banner_image}
                alt={courseData.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40" />
            
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-6">
                <div className="max-w-3xl text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[courseData.difficulty_level]}`}>
                      {difficultyLabels[courseData.difficulty_level]}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl font-bold mb-4">
                    {courseData.title || 'Título del Curso'}
                  </h1>
                  
                  <p className="text-xl text-white/90 mb-6">
                    {courseData.description || 'Descripción del curso...'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatDuration(totalDuration)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>{totalLessons} lecciones</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{courseData.modules.length} módulos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Objectives */}
            {courseData.learning_objectives.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué aprenderás?</h2>
                    <div className="space-y-3">
                      {courseData.learning_objectives.filter(obj => obj.trim()).map((objective, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Course Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Contenido del curso</h2>
                  
                  {courseData.modules.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-gray-500">No hay módulos creados aún</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courseData.modules.map((module, moduleIndex) => (
                        <div key={moduleIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">
                                {moduleIndex + 1}. {module.title || `Módulo ${moduleIndex + 1}`}
                              </h3>
                              <span className="text-sm text-gray-500">
                                {module.lessons.length} lecciones
                              </span>
                            </div>
                            {module.description && (
                              <p className="text-gray-600 text-sm mt-2">{module.description}</p>
                            )}
                          </div>
                          
                          {module.lessons.length > 0 && (
                            <div className="divide-y divide-gray-200">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm text-gray-400 font-mono">
                                        {lessonIndex + 1}
                                      </span>
                                      <span className="text-gray-900">
                                        {lesson.title || `Lección ${lessonIndex + 1}`}
                                      </span>
                                      {lesson.is_preview && (
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                          Vista previa
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                      <span>{formatDuration(lesson.duration_minutes)}</span>
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    </div>
                                  </div>
                                  {lesson.description && (
                                    <p className="text-gray-600 text-sm mt-1 ml-8">{lesson.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Prerequisites */}
            {courseData.prerequisites.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Requisitos</h2>
                    <div className="space-y-3">
                      {courseData.prerequisites.filter(req => req.trim()).map((prerequisite, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">{prerequisite}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-6">
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                      {formatPrice(courseData.price)}
                    </div>
                    {!courseData.is_free && (
                      <p className="text-sm text-gray-500">Pago único</p>
                    )}
                  </div>

                  <button className="w-full bg-[var(--color-primary)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors duration-200">
                    {courseData.is_free ? 'Inscribirse gratis' : 'Comprar curso'}
                  </button>

                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Acceso de por vida</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Certificado de finalización</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Soporte del instructor</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Acceso móvil y desktop</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Course Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Este curso incluye</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duración total</span>
                      <span className="font-medium">{formatDuration(totalDuration)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número de lecciones</span>
                      <span className="font-medium">{totalLessons}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Módulos</span>
                      <span className="font-medium">{courseData.modules.length}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nivel</span>
                      <span className="font-medium">{difficultyLabels[courseData.difficulty_level]}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};