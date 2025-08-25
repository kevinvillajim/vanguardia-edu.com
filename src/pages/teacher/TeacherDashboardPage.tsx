import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../shared/layouts/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner, ProgressBar } from '../../shared/components';
import { GetTeacherStatsUseCase } from '../../application/teacher/GetTeacherStatsUseCase';
import { GetTeacherCoursesUseCase } from '../../application/teacher/GetTeacherCoursesUseCase';
import { CourseRepository } from '../../infrastructure/repositories/CourseRepository';
import { EnrollmentRepository } from '../../infrastructure/repositories/EnrollmentRepository';
import { TeacherStats } from '../../domain/entities/Teacher';
import { Course } from '../../domain/entities/Course';
import { 
  AlertTriangle, 
  BookOpen, 
  CheckCircle, 
  Users, 
  BarChart3, 
  Plus,
  TrendingUp,
  PenTool,
  PartyPopper,
  HelpCircle,
  Settings,
  Award
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  // Initialize use cases - memoized to prevent recreation on every render
  const { courseRepository, enrollmentRepository, getTeacherStatsUseCase, getTeacherCoursesUseCase } = useMemo(() => {
    const courseRepo = new CourseRepository();
    const enrollmentRepo = new EnrollmentRepository();
    return {
      courseRepository: courseRepo,
      enrollmentRepository: enrollmentRepo,
      getTeacherStatsUseCase: new GetTeacherStatsUseCase(courseRepo, enrollmentRepo),
      getTeacherCoursesUseCase: new GetTeacherCoursesUseCase(courseRepo)
    };
  }, []);

  // Mock user data - in real app this would come from auth context
  const user = { id: 1, name: 'Profesor', role: 3 };

  // Navigation items for teacher
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/teacher/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Mis Cursos',
      href: '/teacher/courses',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: 'Estudiantes',
      href: '/teacher/students',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      name: 'Estadísticas',
      href: '/teacher/analytics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🎯 Dashboard: Fetching data for teacher', user.id);

      // First get courses, then use that data for stats to avoid double calls
      const coursesData = await getTeacherCoursesUseCase.execute(user.id, { page: 1, perPage: 5 });
      console.log('✅ Dashboard: Courses fetched', coursesData);
      
      const statsData = await getTeacherStatsUseCase.execute(user.id);
      console.log('✅ Dashboard: Stats fetched', statsData);

      setStats(statsData);
      setCourses(coursesData.data || []);
    } catch (error: any) {
      console.error('❌ Dashboard: Error fetching data:', error);
      setError(error.message || 'Error cargando el dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [user.id, getTeacherCoursesUseCase, getTeacherStatsUseCase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Include fetchDashboardData in dependencies

  const formatPrice = (price: number | null | undefined) => {
    const numericPrice = price === null || price === undefined ? 0 : Number(price);
    if (isNaN(numericPrice)) return 'Gratis';
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" text="Cargando dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error cargando dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="primary">
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          
          <div className="relative">
            <h1 className="text-4xl font-bold mb-3">
              👨‍🏫 ¡Hola, {user.name}!
            </h1>
            <p className="text-purple-100 text-lg">
              Gestiona tus cursos, estudiantes y contenido desde tu panel de instructor
            </p>
            <div className="flex gap-4 mt-6">
              <Link to="/teacher/courses/create">
                <Button variant="secondary" size="lg">
                  + Crear Nueva Curso
                </Button>
              </Link>
              <Link to="/teacher/courses">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-600">
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
              title: 'Cursos Totales',
              value: stats?.totalCourses || 0,
              icon: BookOpen,
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-600',
              iconBg: 'bg-blue-100'
            },
            {
              title: 'Cursos Publicadas',
              value: stats?.publishedCourses || 0,
              icon: CheckCircle,
              bgColor: 'bg-green-50',
              textColor: 'text-green-600',
              iconBg: 'bg-green-100'
            },
            {
              title: 'Estudiantes Totales',
              value: stats?.totalStudents || 0,
              icon: Users,
              bgColor: 'bg-purple-50',
              textColor: 'text-purple-600',
              iconBg: 'bg-purple-100'
            },
            {
              title: 'Progreso Promedio',
              value: `${stats?.averageProgress || 0}%`,
              icon: BarChart3,
              bgColor: 'bg-yellow-50',
              textColor: 'text-yellow-600',
              iconBg: 'bg-yellow-100'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hoverable className="transition-shadow duration-300">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </CardContent>
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mis Cursos</CardTitle>
                  <Link to="/teacher/courses/create">
                    <Button variant="outline" size="sm">
                      + Nueva Curso
                    </Button>
                  </Link>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  Gestiona y edita tus cursos
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {courses && courses.length > 0 ? (
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
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                course.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {course.isPublished ? 'Publicado' : 'Borrador'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                difficultyColors[course.level as keyof typeof difficultyColors] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {difficultyLabels[course.level as keyof typeof difficultyLabels] || course.level}
                              </span>
                              <span>{formatPrice(course.price)}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.enrollmentCount || 0} estudiantes</span>
                              <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> {course.averageProgress || 0}% progreso</span>
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <Link to={`/teacher/courses/${course.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                            </Link>
                            <Link to={`/teacher/courses/${course.id}/students`}>
                              <Button variant="ghost" size="sm">
                                Ver Estudiantes
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No tienes cursos aún
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Crea tu primera curso y comparte tu conocimiento
                      </p>
                      <Link to="/teacher/courses/create">
                        <Button variant="primary">
                          Crear Primera Curso
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actividad Reciente */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Últimas actividades de tus estudiantes
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, index) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'enrollment': return <PenTool className="w-5 h-5" />;
                          case 'completion': return <PartyPopper className="w-5 h-5" />;
                          case 'progress': return <TrendingUp className="w-5 h-5" />;
                          case 'quiz': return <HelpCircle className="w-5 h-5" />;
                          default: return <BookOpen className="w-5 h-5" />;
                        }
                      };

                      return (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-600">{activity.courseTitle}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-10 h-10 mb-2 text-gray-400" />
                      <p className="text-gray-500 text-sm">No hay actividad reciente</p>
                    </div>
                  )}
                </div>
              </CardContent>
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
            <CardContent>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'Crear Curso',
                    description: 'Nueva curso desde cero',
                    icon: Plus,
                    action: '/teacher/courses/create',
                    color: 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                  },
                  {
                    title: 'Ver Estudiantes',
                    description: 'Gestionar estudiantes',
                    icon: Users,
                    action: '/teacher/students',
                    color: 'bg-green-50 hover:bg-green-100 text-green-600'
                  },
                  {
                    title: 'Estadísticas',
                    description: 'Analizar rendimiento',
                    icon: TrendingUp,
                    action: '/teacher/analytics',
                    color: 'bg-purple-50 hover:bg-purple-100 text-purple-600'
                  },
                  {
                    title: 'Configuración',
                    description: 'Ajustes de perfil',
                    icon: Settings,
                    action: '/teacher/profile',
                    color: 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                  },
                ].map((action, index) => (
                  <Link key={index} to={action.action}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className={`p-4 rounded-xl border-2 border-transparent hover:border-gray-200 transition-all duration-200 ${action.color} cursor-pointer`}
                    >
                      <action.icon className="w-8 h-8 mb-2 text-gray-400" />
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm opacity-75">{action.description}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboardPage;