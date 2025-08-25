import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../shared/layouts/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, Button, CourseCard, ProgressBar, LoadingSpinner } from '../../shared/components';
import { GetStudentStatsUseCase } from '../../application/student/GetStudentStatsUseCase';
import { GetStudentCoursesUseCase } from '../../application/student/GetStudentCoursesUseCase';
import { EnrollmentRepository } from '../../infrastructure/repositories/EnrollmentRepository';
import { CourseRepository } from '../../infrastructure/repositories/CourseRepository';
import { StudentStats, StudentActivity, Enrollment } from '../../domain/entities/Enrollment';
import { Course } from '../../domain/entities/Course';
import { 
  AlertTriangle, 
  BookOpen, 
  GraduationCap, 
  Book, 
  Trophy, 
  Medal,
  BarChart3, 
  Settings,
  PenTool,
  PartyPopper,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [recentActivity, setRecentActivity] = useState<StudentActivity[]>([]);

  // Initialize use cases - memoized to prevent recreation on every render
  const { enrollmentRepository, courseRepository, getStudentStatsUseCase, getStudentCoursesUseCase } = useMemo(() => {
    const enrollmentRepo = new EnrollmentRepository();
    const courseRepo = new CourseRepository();
    return {
      enrollmentRepository: enrollmentRepo,
      courseRepository: courseRepo,
      getStudentStatsUseCase: new GetStudentStatsUseCase(enrollmentRepo),
      getStudentCoursesUseCase: new GetStudentCoursesUseCase(enrollmentRepo)
    };
  }, []);

  // Mock user data - in real app this would come from auth context
  const user = { id: 1, name: 'Estudiante', role: 2 };

  // Navigation items for student
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/student/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Mis Cursos',
      href: '/student/courses',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: 'Certificados',
      href: '/student/certificates',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      name: 'Progreso',
      href: '/student/progress',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsData, coursesData, activityData] = await Promise.all([
        getStudentStatsUseCase.execute(user.id),
        getStudentCoursesUseCase.execute(user.id, { page: 1, perPage: 5 }),
        enrollmentRepository.getStudentActivity(user.id, 10),
      ]);

      setStats(statsData);
      setEnrolledCourses(coursesData.data);
      setRecentActivity(activityData);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Error cargando el dashboard');
    } finally {
      setIsLoading(false);
    }
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
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          
          <div className="relative">
            <h1 className="text-4xl font-bold mb-3">
              👋 ¡Bienvenido, {user.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              Continúa tu aprendizaje en tecnología y alcanza tus objetivos
            </p>
            <div className="flex gap-4 mt-6">
              <Link to="/student/courses">
                <Button variant="secondary" size="lg">
                  🔍 Explorar Cursos
                </Button>
              </Link>
              <Link to="/student/progress">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Ver Progreso</div>
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Cursos Inscritos',
              value: stats?.totalEnrollments || 0,
              icon: BookOpen,
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-600',
              iconBg: 'bg-blue-100'
            },
            {
              title: 'Cursos Completados',
              value: stats?.completedCourses || 0,
              icon: GraduationCap,
              bgColor: 'bg-green-50',
              textColor: 'text-green-600',
              iconBg: 'bg-green-100'
            },
            {
              title: 'En Progreso',
              value: stats?.inProgressCourses || 0,
              icon: Book,
              bgColor: 'bg-yellow-50',
              textColor: 'text-yellow-600',
              iconBg: 'bg-yellow-100'
            },
            {
              title: 'Certificados',
              value: stats?.totalCertificates || 0,
              icon: Trophy,
              bgColor: 'bg-purple-50',
              textColor: 'text-purple-600',
              iconBg: 'bg-purple-100'
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
                  <Link to="/student/courses">
                    <Button variant="outline" size="sm">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  Continúa donde lo dejaste
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {enrolledCourses && enrolledCourses.length > 0 ? (
                    enrolledCourses.map((enrollment, index) => (
                      <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{enrollment.course.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {enrollment.course.level || 'Principiante'}
                              </span>
                              <span>{enrollment.progressPercentage || 0}% completado</span>
                            </div>
                            <ProgressBar 
                              value={enrollment.progressPercentage || 0} 
                              variant="success" 
                              size="sm"
                            />
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <Link to={`/student/courses/${enrollment.course.slug}`}>
                              <Button variant="primary" size="sm">
                                Continuar
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
                        Explora nuestro catálogo y comienza a aprender
                      </p>
                      <Link to="/student/courses">
                        <Button variant="primary">
                          Explorar Cursos
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
                  Tu progreso en los últimos días
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'enrollment': return <PenTool className="w-5 h-5" />;
                          case 'completion': return <PartyPopper className="w-5 h-5" />;
                          case 'achievement': return <Trophy className="w-5 h-5" />;
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
                    title: 'Explorar Cursos',
                    description: 'Encuentra nuevos cursos',
                    icon: '🔍',
                    action: '/student/courses',
                    color: 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                  },
                  {
                    title: 'Mis Certificados',
                    description: 'Ver logros obtenidos',
                    icon: Medal,
                    action: '/student/certificates',
                    color: 'bg-green-50 hover:bg-green-100 text-green-600'
                  },
                  {
                    title: 'Mi Progreso',
                    description: 'Ver estadísticas',
                    icon: BarChart3,
                    action: '/student/progress',
                    color: 'bg-purple-50 hover:bg-purple-100 text-purple-600'
                  },
                  {
                    title: 'Configuración',
                    description: 'Ajustes de perfil',
                    icon: Settings,
                    action: '/student/profile',
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

export default StudentDashboardPage;