import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { courseService, Course, CourseFilters } from '../../../services/courses/courseService';
import { CourseCard } from "@/shared/components/courses/CourseCard/CourseCard";
import { TeacherCourseCard } from "@/shared/components/courses/CourseCard/CourseCard";
import { CourseFilters as FilterComponent } from '../../../shared/components/courses/CourseFilters/CourseFilters';
import { Button } from "@/shared/components/ui/Button/Button";
import { useAuth } from '../../../contexts/AuthContext';

interface CoursesResponse {
  data: Course[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const CoursesCatalogPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determinar el tipo de vista basado en la URL
  const isPublicView = location.pathname === '/cursos';
  const isTeacherView = location.pathname.includes('/teacher/');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CourseFilters>({ per_page: 12 });
  const [searchQuery, setSearchQuery] = useState('');
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      loadCourses();
    }
  }, [filters]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (isTeacherView) {
        // Vista de profesor: cargar cursos propios
        const coursesResponse = await courseService.getTeacherCourses();
        setCourses(coursesResponse.data);
        setMeta({
          current_page: 1,
          last_page: 1,
          per_page: coursesResponse.data.length,
          total: coursesResponse.data.length,
        });
      } else {
        // Vista pública: cursos disponibles y destacados
        const [coursesResponse, featuredResponse] = await Promise.all([
          courseService.getCourses(filters),
          courseService.getFeaturedCourses(),
        ]);

        setCourses(coursesResponse.data);
        setMeta(coursesResponse.meta);
        setFeaturedCourses(featuredResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando los cursos');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    // Para profesores no hay búsqueda, solo para vista pública
    if (isTeacherView) {
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await courseService.getCourses(filters);
      setCourses(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.message || 'Error cargando los cursos');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async () => {
    // Para profesores no hay búsqueda, solo para vista pública
    if (isTeacherView) {
      return;
    }

    if (!searchQuery.trim()) {
      loadCourses();
      return;
    }

    setSearchLoading(true);
    try {
      const response = await courseService.searchCourses(searchQuery, filters);
      setCourses(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.message || 'Error en la búsqueda');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: CourseFilters) => {
    setFilters({ ...newFilters, per_page: 12 });
  };

  const handleSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  const loadMoreCourses = async () => {
    // Para profesores no hay paginación, solo para vista pública
    if (isTeacherView) {
      return;
    }

    if (meta.current_page >= meta.last_page) return;

    setSearchLoading(true);
    try {
      const newFilters = { ...filters, per_page: 12, page: meta.current_page + 1 };
      
      const response = searchQuery 
        ? await courseService.searchCourses(searchQuery, newFilters)
        : await courseService.getCourses(newFilters);

      setCourses(prev => [...prev, ...response.data]);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.message || 'Error cargando más cursos');
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Hero Section Skeleton */}
            <div className="text-center space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg w-1/2 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-2/3 mx-auto"></div>
            </div>

            {/* Featured Courses Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
                ))}
              </div>
            </div>

            {/* Filters Skeleton */}
            <div className="h-20 bg-gray-200 rounded-xl"></div>

            {/* Courses Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error cargando cursos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadInitialData} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] opacity-95"></div>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/600')] bg-cover bg-center"></div>
        
        <div className="relative container mx-auto px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            {isTeacherView ? 'Gestión de Cursos' : 'Catálogo de Cursos'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8"
          >
            {isTeacherView ? 'Administra, edita y gestiona todos tus cursos de ciberseguridad desde un solo lugar' :
             'Descubre cursos de ciberseguridad diseñados por expertos para llevarte desde principiante hasta profesional'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-3xl font-bold">{meta.total}</span>
              <p className="text-sm text-white/80">
                {isTeacherView ? 'Cursos creados' : 'Cursos disponibles'}
              </p>
            </div>
            {!isTeacherView && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-3xl font-bold">{featuredCourses.length}</span>
                <p className="text-sm text-white/80">Cursos destacados</p>
              </div>
            )}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-3xl font-bold">100%</span>
              <p className="text-sm text-white/80">
                {isTeacherView ? 'Profesionales' : 'Prácticos'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Courses - Only for public users */}
        {featuredCourses.length > 0 && !isTeacherView && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Cursos Destacados</h2>
              <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent flex-1 ml-8 rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.slice(0, 3).map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <CourseCard course={course} variant="featured" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Filters - Not needed for teachers */}
        {!isTeacherView && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <FilterComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearchQuery}
            />
          </motion.section>
        )}

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Resultados para "${searchQuery}"` : 
               isTeacherView ? 'Mis cursos creados' :
               'Todos los cursos'}
            </h2>
            <p className="text-gray-600 mt-1">
              {meta.total === 0 ? 
                (isTeacherView ? 'No has creado cursos aún' :
                 'No se encontraron cursos') : 
               meta.total === 1 ? '1 curso encontrado' : 
               `${meta.total} cursos encontrados`}
            </p>
          </div>

          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilters({ per_page: 12 });
              }}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            >
              Limpiar búsqueda
            </Button>
          )}
        </motion.div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: (index % 12) * 0.05 }}
                >
                  {isTeacherView ? (
                    <TeacherCourseCard 
                      course={course} 
                      onCourseUpdate={loadInitialData}
                    />
                  ) : (
                    <CourseCard course={course} />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Load More Button - Not for teachers */}
            {meta.current_page < meta.last_page && !isTeacherView && (
              <div className="text-center">
                <Button
                  onClick={loadMoreCourses}
                  loading={searchLoading}
                  variant="outline"
                  size="lg"
                >
                  {searchLoading ? 'Cargando...' : 'Ver más cursos'}
                </Button>
              </div>
            )}
          </motion.section>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 text-8xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {isTeacherView ? 'No has creado cursos aún' : 'No se encontraron cursos'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {isTeacherView ? 'Crea tu primer curso y comparte tu conocimiento con estudiantes.' :
               searchQuery 
                ? 'Intenta con otros términos de búsqueda o ajusta los filtros.'
                : 'Actualmente no hay cursos disponibles con los filtros seleccionados.'
              }
            </p>
            {isTeacherView ? (
              <Button
                onClick={() => navigate('/courses/create')}
                variant="primary"
              >
                Crear mi primer curso
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ per_page: 12 });
                }}
                variant="primary"
              >
                Ver todos los cursos
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoursesCatalogPage;