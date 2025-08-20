import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseService, CourseDetail } from '../../../services/courses/courseService';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from "@/shared/components/ui/Button/Button";
import { Card } from '../../../shared/components/ui/Card/Card';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadCourse();
    }
  }, [slug]);

  const loadCourse = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const response = await courseService.getCourseBySlug(slug);
      setCourse(response.data);
      setIsEnrolled(response.is_enrolled);
    } catch (err: any) {
      setError(err.message || 'Error cargando el curso');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course || !isAuthenticated) return;

    setEnrolling(true);
    try {
      await courseService.enrollInCourse(course.id);
      setIsEnrolled(true);
      // Mostrar mensaje de éxito
    } catch (err: any) {
      setError(err.message || 'Error al inscribirse en el curso');
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (price: number | string | null | undefined) => {
    // Convert to number and handle various input types
    const numericPrice = price === null || price === undefined ? 0 : Number(price);
    
    // Check if conversion resulted in a valid number
    if (isNaN(numericPrice)) {
      return 'Gratis';
    }
    
    return numericPrice === 0 ? 'Gratis' : `$${numericPrice.toFixed(2)}`;
  };

  const formatDuration = (minutes: number | string | null | undefined) => {
    // Convert to number and handle various input types
    const numericMinutes = minutes === null || minutes === undefined ? 0 : Number(minutes);
    
    // Check if conversion resulted in a valid number
    if (isNaN(numericMinutes)) return '';
    
    const hours = Math.floor(numericMinutes / 60);
    const mins = numericMinutes % 60;
    
    if (hours === 0) return mins > 0 ? `${mins}min` : '';
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-200 h-8 rounded w-3/4"></div>
                <div className="bg-gray-200 h-32 rounded"></div>
                <div className="bg-gray-200 h-64 rounded"></div>
              </div>
              <div className="bg-gray-200 h-96 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Curso no encontrado'}
          </h2>
          <Button onClick={() => navigate('/courses')} variant="primary">
            Ver todos los cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          {course.banner_image ? (
            <img
              src={course.banner_image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]"></div>
          )}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[course.difficulty_level]}`}>
                  {difficultyLabels[course.difficulty_level]}
                </span>
                {course.category && (
                  <span className="text-white/80 text-sm">{course.category.name}</span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{course.title}</h1>
              
              <p className="text-xl text-white/90 mb-6 max-w-3xl">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{course.teacher.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDuration(course.total_duration_minutes)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{course.total_lessons} lecciones</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{course.rating} ({course.enrollment_count} estudiantes)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contenido del curso</h2>
                
                <div className="space-y-4">
                  {course.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">
                            {moduleIndex + 1}. {module.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {module.lessons.length} lecciones
                          </span>
                        </div>
                        {module.description && (
                          <p className="text-gray-600 text-sm mt-2">{module.description}</p>
                        )}
                      </div>
                      
                      <div className="divide-y divide-gray-200">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-400 font-mono">
                                  {lessonIndex + 1}
                                </span>
                                <span className="text-gray-900">{lesson.title}</span>
                                {lesson.is_preview && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    Vista previa
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{formatDuration(lesson.duration_minutes)}</span>
                                {(lesson.is_preview || isEnrolled) ? (
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {lesson.description && (
                              <p className="text-gray-600 text-sm mt-1 ml-8">{lesson.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Instructor */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructor</h2>
                
                <div className="flex items-start gap-4">
                  {course.teacher.avatar ? (
                    <img
                      src={course.teacher.avatar}
                      alt={course.teacher.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xl font-bold">
                      {course.teacher.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {course.teacher.name}
                    </h3>
                    <p className="text-gray-600">
                      Instructor especializado en ciberseguridad
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6 sticky top-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                    {formatPrice(course.price)}
                  </div>
                  {course.price > 0 && (
                    <p className="text-sm text-gray-500">Pago único</p>
                  )}
                </div>

                {isAuthenticated ? (
                  isEnrolled ? (
                    <Button
                      fullWidth
                      size="lg"
                      variant="success"
                      onClick={() => navigate(`/courses/${course.id}/lessons/1`)}
                    >
                      Continuar aprendiendo
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      size="lg"
                      variant="primary"
                      loading={enrolling}
                      onClick={handleEnroll}
                    >
                      {enrolling ? 'Inscribiendo...' : 
                       course.price === 0 ? 'Inscribirse gratis' : 'Comprar curso'}
                    </Button>
                  )
                ) : (
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    onClick={() => navigate('/auth/login')}
                  >
                    Inicia sesión para inscribirte
                  </Button>
                )}

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
              </Card>
            </motion.div>

            {/* Course Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Estadísticas del curso</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estudiantes inscritos</span>
                    <span className="font-medium">{course.enrollment_count}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración total</span>
                    <span className="font-medium">{formatDuration(course.total_duration_minutes)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de lecciones</span>
                    <span className="font-medium">{course.total_lessons}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Módulos</span>
                    <span className="font-medium">{course.total_modules}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nivel</span>
                    <span className="font-medium">{difficultyLabels[course.difficulty_level]}</span>
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

export default CourseDetailPage;