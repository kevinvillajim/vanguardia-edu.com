import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { courseService, Course } from '../../../services/courses/courseService';
import { adminService } from '../../../services/admin/adminService';
import { TeacherCourseCard } from "@/shared/components/courses/TeacherCourseCard/TeacherCourseCard";
import { Button } from "@/shared/components/ui/Button/Button";
import { Card } from '../../../shared/components/ui/Card/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES } from '../../../utils/constants';

export const TeacherCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar que el usuario sea profesor o admin
    if (!hasRole(USER_ROLES.TEACHER) && !hasRole(USER_ROLES.ADMIN)) {
      navigate('/unauthorized');
      return;
    }
    
    loadTeacherCourses();
  }, [user, hasRole]);

  const loadTeacherCourses = async () => {
    setLoading(true);
    try {
      let response;
      
      // Si es admin, usar endpoint de admin, si es profesor usar endpoint de profesor
      if (hasRole(USER_ROLES.ADMIN)) {
        response = await adminService.getAllCourses();
      } else {
        response = await courseService.getTeacherCourses();
      }
      
      setCourses(response.data);
    } catch (err: any) {
      setError(err.message || 'Error cargando tus cursos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadTeacherCourses} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.is_published).length;
  const draftCourses = courses.filter(c => !c.is_published).length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
              <p className="text-gray-600 mt-1">
                Administra, edita y gestiona todos tus cursos desde un solo lugar
              </p>
            </div>
            <Button
              onClick={() => navigate('/courses/create')}
              variant="primary"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Crear Curso
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalCourses}</div>
            <div className="text-gray-600">Total Cursos</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{publishedCourses}</div>
            <div className="text-gray-600">Publicados</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{draftCourses}</div>
            <div className="text-gray-600">Borradores</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{totalStudents}</div>
            <div className="text-gray-600">Total Estudiantes</div>
          </Card>
        </motion.div>

        {/* Lista de Cursos */}
        {totalCourses === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 text-8xl mb-6">🎓</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No has creado cursos aún
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Crea tu primer curso y comparte tu conocimiento con estudiantes de todo el mundo.
            </p>
            <Button
              onClick={() => navigate('/courses/create')}
              variant="primary"
              size="lg"
            >
              Crear mi primer curso
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mis Cursos Creados
              </h2>
              <p className="text-gray-600">
                Gestiona el contenido, estudiantes y configuración de cada curso
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <TeacherCourseCard 
                    course={course} 
                    onCourseUpdate={loadTeacherCourses}
                  />
                </motion.div>
              ))}
            </div>

            {/* Actions Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 text-center"
            >
              <Button
                onClick={() => navigate('/courses/create')}
                variant="outline"
                size="lg"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Crear Nuevo Curso
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeacherCoursesPage;