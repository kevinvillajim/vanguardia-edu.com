import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../shared/layouts/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner, ProgressBar } from '../../shared/components';
import { GetAdminDashboardUseCase, AdminStats } from '../../application/admin/GetAdminDashboardUseCase';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { CourseRepository } from '../../infrastructure/repositories/CourseRepository';
import { EnrollmentRepository } from '../../infrastructure/repositories/EnrollmentRepository';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  BarChart3, 
  BookOpen, 
  PenTool, 
  Trophy,
  User,
  PartyPopper,
  HelpCircle,
  Settings
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Initialize use cases - memoized to prevent recreation on every render
  const { userRepository, courseRepository, enrollmentRepository, getAdminDashboardUseCase } = useMemo(() => {
    const userRepo = new UserRepository();
    const courseRepo = new CourseRepository();
    const enrollmentRepo = new EnrollmentRepository();
    return {
      userRepository: userRepo,
      courseRepository: courseRepo,
      enrollmentRepository: enrollmentRepo,
      getAdminDashboardUseCase: new GetAdminDashboardUseCase(
        userRepo,
        courseRepo,
        enrollmentRepo
      )
    };
  }, []);

  // Mock user data - in real app this would come from auth context
  const user = { id: 1, name: 'Administrador', role: 1 };

  // Navigation items for admin
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      name: 'Cursos',
      href: '/admin/courses',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: 'Reportes',
      href: '/admin/reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Sistema',
      href: '/admin/system',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

      const statsData = await getAdminDashboardUseCase.execute();
      setStats(statsData);
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
          className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          
          <div className="relative">
            <h1 className="text-4xl font-bold mb-3">
              <div className="flex items-center gap-2"><Shield className="w-5 h-5" /> Panel de Administración</div>
            </h1>
            <p className="text-indigo-100 text-lg">
              Gestiona usuarios, cursos y supervisa el rendimiento de la plataforma
            </p>
            <div className="flex gap-4 mt-6">
              <Link to="/admin/users">
                <Button variant="secondary" size="lg">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Gestionar Usuarios</div>
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-indigo-600">
                  <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Ver Reportes</div>
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Usuarios Totales',
              value: stats?.users.total_users || 0,
              subtitle: `+${stats?.users.new_this_month || 0} este mes`,
              icon: Users,
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-600',
              iconBg: 'bg-blue-100',
              trend: stats?.users.growth_rate || 0
            },
            {
              title: 'Cursos Publicados',
              value: stats?.courses.published_courses || 0,
              subtitle: `${stats?.courses.total_courses || 0} total`,
              icon: BookOpen,
              bgColor: 'bg-green-50',
              textColor: 'text-green-600',
              iconBg: 'bg-green-100',
              trend: stats?.courses.growth_rate || 0
            },
            {
              title: 'Inscripciones',
              value: stats?.enrollments.total_enrollments || 0,
              subtitle: `${stats?.enrollments.completion_rate || 0}% completado`,
              icon: PenTool,
              bgColor: 'bg-purple-50',
              textColor: 'text-purple-600',
              iconBg: 'bg-purple-100',
              trend: stats?.enrollments.growth_rate || 0
            },
            {
              title: 'Certificados',
              value: stats?.certificates.total_certificates || 0,
              subtitle: `+${stats?.certificates.new_this_month || 0} este mes`,
              icon: Trophy,
              bgColor: 'bg-yellow-50',
              textColor: 'text-yellow-600',
              iconBg: 'bg-yellow-100',
              trend: stats?.certificates.growth_rate || 0
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
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      stat.trend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {stat.trend >= 0 ? '↗' : '↘'} {Math.abs(stat.trend)}%
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribución de Roles */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Usuarios</CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Por tipo de rol
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {stats?.users.role_distribution && Object.entries(stats.users.role_distribution).map(([role, count], index) => {
                    const total = stats.users.total_users;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    
                    const roleLabels = {
                      admin: 'Administradores',
                      teacher: 'Profesores',
                      student: 'Estudiantes'
                    };

                    const roleColors = {
                      admin: 'bg-red-500',
                      teacher: 'bg-blue-500',
                      student: 'bg-green-500'
                    };

                    return (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${roleColors[role as keyof typeof roleColors]}`}></div>
                          <span className="text-sm font-medium text-gray-900">
                            {roleLabels[role as keyof typeof roleLabels] || role}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24">
                            <ProgressBar value={percentage} size="sm" />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cursos Más Populares */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Cursos Más Populares</CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Por número de inscripciones
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {stats?.courses.most_popular && stats.courses.most_popular.length > 0 ? (
                    stats.courses.most_popular.map((course, index) => (
                      <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.enrollment_count} estudiantes</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Popular
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-10 h-10 mb-2 text-gray-400" />
                      <p className="text-gray-500 text-sm">No hay datos de cursos</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actividad Reciente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente del Sistema</CardTitle>
              <p className="text-gray-600 text-sm mt-1">
                Últimas acciones de usuarios en la plataforma
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {stats?.activity && stats.activity.length > 0 ? (
                  stats.activity.map((activity, index) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'enrollment': return <PenTool className="w-5 h-5" />;
                        case 'completion': return <PartyPopper className="w-5 h-5" />;
                        case 'user_registration': return <User className="w-5 h-5" />;
                        case 'course_creation': return <BookOpen className="w-5 h-5" />;
                        default: return <BookOpen className="w-5 h-5" />;
                      }
                    };

                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-600">{activity.user_name}</p>
                            <span className="text-gray-400">•</span>
                            <p className="text-xs text-gray-600">{activity.course_title}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.date).toLocaleDateString()}
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Administrativas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'Gestionar Usuarios',
                    description: 'Crear, editar usuarios',
                    icon: Users,
                    action: '/admin/users',
                    color: 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                  },
                  {
                    title: 'Supervisar Cursos',
                    description: 'Aprobar y gestionar',
                    icon: BookOpen,
                    action: '/admin/courses',
                    color: 'bg-green-50 hover:bg-green-100 text-green-600'
                  },
                  {
                    title: 'Ver Reportes',
                    description: 'Analíticas completas',
                    icon: BarChart3,
                    action: '/admin/reports',
                    color: 'bg-purple-50 hover:bg-purple-100 text-purple-600'
                  },
                  {
                    title: 'Configuración',
                    description: 'Ajustes del sistema',
                    icon: Settings,
                    action: '/admin/system',
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

export default AdminDashboardPage;