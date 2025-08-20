import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { courseService, CourseEnrollment } from '../../../services/courses/courseService';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from "@/shared/components/ui/Button/Button";
import { Card } from '../../../shared/components/ui/Card/Card';

export const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar que el usuario sea estudiante
    if (!hasRole('student')) {
      navigate('/unauthorized');
      return;
    }
    
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    setLoading(true);
    try {
      const response = await courseService.getMyEnrollments();
      setEnrollments(response.data);
    } catch (err: any) {
      setError(err.message || 'Error cargando tus cursos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number | string | null | undefined) => {
    const numericMinutes = minutes === null || minutes === undefined ? 0 : Number(minutes);
    if (isNaN(numericMinutes)) return '';
    
    const hours = Math.floor(numericMinutes / 60);
    const mins = numericMinutes % 60;
    
    if (hours === 0) return mins > 0 ? `${mins}min` : '';
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'active':
        return 'En progreso';
      case 'dropped':
        return 'Abandonado';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 rounded-xl h-24"></div>
              ))}
            </div>

            {/* Courses Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadMyCourses} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const activeCourses = enrollments.filter(e => e.status === 'active').length;
  const averageProgress = totalCourses > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / totalCourses)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]"></div>
        
        <div className="relative container mx-auto px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Mis Cursos
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/90 max-w-2xl mx-auto mb-8"
          >
            Continúa tu aprendizaje con los cursos en los que estás inscrito
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-3xl font-bold">{totalCourses}</span>
              <p className="text-sm text-white/80">Cursos inscritos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-3xl font-bold">{completedCourses}</span>
              <p className="text-sm text-white/80">Completados</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-3xl font-bold">{averageProgress}%</span>
              <p className="text-sm text-white/80">Progreso promedio</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{activeCourses}</div>
            <div className="text-gray-600">Cursos Activos</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{completedCourses}</div>
            <div className="text-gray-600">Cursos Completados</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {enrollments.filter(e => e.status === 'dropped').length}
            </div>
            <div className="text-gray-600">Cursos Abandonados</div>
          </Card>
        </motion.div>

        {/* Courses List */}
        {totalCourses === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 text-8xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No estás inscrito en ningún curso
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Contacta con tu instructor para obtener acceso a los cursos de ciberseguridad.
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
            >
              Ir al Dashboard
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mis Cursos Inscritos
              </h2>
              <p className="text-gray-600">
                Accede a tus cursos y continúa tu progreso de aprendizaje
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    <div className="aspect-video relative overflow-hidden">
                      {enrollment.course.banner_image ? (
                        <img
                          src={enrollment.course.banner_image}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {enrollment.course.title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                          {enrollment.course.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                          {getStatusLabel(enrollment.status)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {enrollment.course.description}
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progreso:</span>
                          <span className="font-medium">{Math.round(enrollment.progress_percentage)}%</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Inscrito:</span>
                          <span className="text-gray-900">{formatDate(enrollment.enrolled_at)}</span>
                        </div>
                        
                        {enrollment.completed_at && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completado:</span>
                            <span className="text-green-600">{formatDate(enrollment.completed_at)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Instructor:</span>
                          <span className="text-gray-900">{enrollment.course.teacher.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/courses/${enrollment.course.slug}`)}
                          variant="primary"
                          size="sm"
                          fullWidth
                          disabled={enrollment.status === 'dropped'}
                        >
                          {enrollment.status === 'completed' ? 'Revisar' : 'Continuar'}
                        </Button>
                        
                        {enrollment.status === 'active' && enrollment.progress_percentage > 0 && (
                          <Button
                            onClick={() => navigate(`/courses/${enrollment.course.id}/lessons/1`)}
                            variant="outline"
                            size="sm"
                          >
                            Lección
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;