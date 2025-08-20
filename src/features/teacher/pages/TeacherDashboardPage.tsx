import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { courseService, Course } from '../../../services/courses/courseService';
import { teacherService, TeacherStats, TeacherActivity } from '../../../services/teacher/teacherService';
import { Card } from '../../../shared/components/ui/Card/Card';
import { Button } from "@/shared/components/ui/Button/Button";

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [activities, setActivities] = useState<TeacherActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      // Intentar cargar datos del servicio del profesor primero
      try {
        const [statsResponse, activitiesResponse] = await Promise.all([
          teacherService.getStats(),
          teacherService.getRecentActivity(5)
        ]);
        setStats(statsResponse);
        setActivities(activitiesResponse);
      } catch (teacherServiceError) {
        // Si falla el servicio del profesor, usar datos simulados
        console.warn('Teacher service not available, using fallback data');
      }

      // Cargar cursos del profesor
      const coursesResponse = await courseService.getCourses({ 
        teacher_id: user?.id,
        per_page: 10 
      });
      setCourses(coursesResponse.data);

      // Si no tenemos stats del servicio, calcular manualmente
      if (!stats) {
        const totalStudents = coursesResponse.data.reduce((sum, course) => sum + (course.enrollment_count || 0), 0);
        const totalLessons = coursesResponse.data.reduce((sum, course) => sum + (course.total_lessons || 0), 0);
        const avgRating = coursesResponse.data.length > 0 
          ? coursesResponse.data.reduce((sum, course) => sum + (course.rating || 0), 0) / coursesResponse.data.length
          : 0;

        setStats({
          total_courses: coursesResponse.data.length,
          total_students: totalStudents,
          total_lessons: totalLessons,
          avg_rating: Number(isNaN(avgRating) ? 0 : avgRating.toFixed(1)),
        });
      }

      // Si no tenemos actividades del servicio, usar datos simulados
      if (activities.length === 0) {
        setActivities([
          {
            id: 1,
            type: 'enrollment',
            message: 'Nuevo estudiante se inscribió a "Introducción a Ciberseguridad"',
            time: 'Hace 2 horas',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            type: 'review',
            message: 'María García dejó una reseña de 5 estrellas',
            time: 'Hace 5 horas',
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            type: 'question',
            message: 'Juan Pérez hizo una pregunta en el Módulo 3',
            time: 'Hace 1 día',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 4,
            type: 'completion',
            message: '3 estudiantes completaron "Fundamentos de Ethical Hacking"',
            time: 'Hace 2 días',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando datos del profesor');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-32 rounded-xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-24 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error cargando dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadTeacherData} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
        
        <div className="relative">
          <h1 className="text-4xl font-bold mb-3">
            👨‍🏫 ¡Hola, {user?.name}!
          </h1>
          <p className="text-blue-100 text-lg">
            Gestiona tus cursos, estudiantes y contenido desde tu panel de instructor
          </p>
          <div className="flex gap-4 mt-6">
            <Link to="/courses/create">
              <Button variant="white" size="lg">
                + Crear Nuevo Curso
              </Button>
            </Link>
            <Link to="/teacher/courses">
              <Button variant="outline-white" size="lg">
                Gestionar Mis Cursos
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Cursos Creados',
            value: stats?.total_courses || 0,
            icon: '📚',
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          {
            title: 'Estudiantes Totales',
            value: stats?.total_students || 0,
            icon: '👥',
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
          },
          {
            title: 'Lecciones Creadas',
            value: stats?.total_lessons || 0,
            icon: '🎓',
            color: 'purple',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
          },
          {
            title: 'Calificación Promedio',
            value: stats?.avg_rating || 0,
            icon: '⭐',
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mis Cursos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Mis Cursos</h2>
                <Link to="/courses/create">
                  <Button variant="outline" size="sm">
                    + Nuevo Curso
                  </Button>
                </Link>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Gestiona y edita tus cursos
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {courses.length > 0 ? (
                  courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${difficultyColors[course.difficulty_level]}`}>
                              {difficultyLabels[course.difficulty_level]}
                            </span>
                            <span>{course.enrollment_count || 0} estudiantes</span>
                            <span>{formatPrice(course.price)}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <Link to={`/courses/${course.slug}`}>
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes cursos aún
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Crea tu primer curso y comparte tu conocimiento
                    </p>
                    <Link to="/courses/create">
                      <Button variant="primary">
                        Crear Mi Primer Curso
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actividad Reciente */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
              <p className="text-gray-600 text-sm mt-1">
                Últimas interacciones en tus cursos
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity, index) => {
                    const getActivityIcon = (type: TeacherActivity['type']) => {
                      switch (type) {
                        case 'enrollment': return '👥';
                        case 'review': return '⭐';
                        case 'question': return '❓';
                        case 'completion': return '🎉';
                        default: return '📝';
                      }
                    };

                    const getActivityColor = (type: TeacherActivity['type']) => {
                      switch (type) {
                        case 'enrollment': return 'text-green-600';
                        case 'review': return 'text-yellow-600';
                        case 'question': return 'text-blue-600';
                        case 'completion': return 'text-purple-600';
                        default: return 'text-gray-600';
                      }
                    };

                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-500 text-sm">No hay actividad reciente</p>
                  </div>
                )}
                
                <div className="text-center pt-4">
                  <Button variant="ghost" size="sm">
                    Ver Toda la Actividad
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Crear Curso',
                  description: 'Diseña un nuevo curso',
                  icon: '➕',
                  action: '/courses/create',
                  color: 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                },
                {
                  title: 'Ver Estadísticas',
                  description: 'Analiza el rendimiento',
                  icon: '📊',
                  action: '/analytics',
                  color: 'bg-green-50 hover:bg-green-100 text-green-600'
                },
                {
                  title: 'Gestionar Estudiantes',
                  description: 'Administra inscripciones',
                  icon: '👨‍🎓',
                  action: '/students',
                  color: 'bg-purple-50 hover:bg-purple-100 text-purple-600'
                },
                {
                  title: 'Configuración',
                  description: 'Ajustes de perfil',
                  icon: '⚙️',
                  action: '/settings',
                  color: 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                },
              ].map((action, index) => (
                <Link key={index} to={action.action}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 rounded-xl border-2 border-transparent hover:border-gray-200 transition-all duration-200 ${action.color}`}
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm opacity-75">{action.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default TeacherDashboardPage;