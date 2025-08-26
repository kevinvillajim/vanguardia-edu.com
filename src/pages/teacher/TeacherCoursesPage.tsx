import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  Eye,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../../shared/layouts/dashboard/DashboardLayout';
import { courseService } from '../../services/courseService';
import { Course } from '../../domain/entities/Course';
import { logger } from '../../shared/utils/logger';
import { getConfig } from '../../config';
import Button from '../../components/ui/Button/Button';
import { buildMediaUrl } from '../../shared/utils/mediaUtils';

interface TeacherCoursesPageProps {}

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onCopy: (course: Course) => void;
  onDelete?: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onCopy, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusBadge = () => {
    if (course.isPublished) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Publicado
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Borrador
        </span>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Banner Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
        {course.bannerImage ? (
          <img 
            src={buildMediaUrl(course.bannerImage)} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onEdit(course);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      onCopy(course);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(course);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            {course.enrollmentCount || 0} estudiantes
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <BookOpen className="w-4 h-4 mr-2" />
            {course.units?.length || 0} unidades
          </div>
          {course.durationHours && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              {course.durationHours}h
            </div>
          )}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Eye className="w-4 h-4 mr-2" />
            {course.viewCount || 0} vistas
          </div>
        </div>

        {/* Category */}
        {course.category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {course.category.name}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onEdit(course)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCopy(course)}
          >
            <Copy className="w-4 h-4" />
          </Button>
          {/* Botón eliminar - solo si está habilitado */}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(course)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const TeacherCoursesPage: React.FC<TeacherCoursesPageProps> = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  
  const config = getConfig();
  const canDelete = config.permissions.teacher.canDeleteCourses;

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const result = await courseService.getTeacherCourses();
      if (result.success && result.courses) {
        setCourses(result.courses);
        logger.info('📚 Cursos del profesor cargados:', result.courses.length);
      } else {
        logger.error('❌ Error cargando cursos del profesor:', result.error);
      }
    } catch (error) {
      logger.error('❌ Error inesperado cargando cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    navigate(`/teacher/courses/${course.id}/edit`);
  };

  const handleCopyCourse = async (course: Course) => {
    try {
      logger.info('📋 Duplicando curso:', course.title);
      
      // Crear una copia del curso con un nuevo título
      const copiedCourseData = {
        title: `${course.title} (Copia)`,
        description: course.description,
        difficulty_level: course.difficultyLevel || 'beginner',
        duration_hours: course.durationHours || 0,
        categoryId: course.category?.id,
        bannerImage: course.bannerImage,
        learningObjectives: course.learningObjectives || [],
        prerequisites: course.prerequisites || [],
      };

      const result = await courseService.createCourse(copiedCourseData);
      
      if (result.success) {
        logger.success('✅ Curso duplicado exitosamente');
        // Recargar la lista de cursos
        loadCourses();
        
        // Navegar a editar el curso duplicado
        if (result.course?.id) {
          navigate(`/teacher/courses/${result.course.id}/edit`);
        }
      } else {
        alert(`Error al duplicar el curso: ${result.error}`);
      }
    } catch (error) {
      logger.error('❌ Error duplicando curso:', error);
      alert('Error inesperado al duplicar el curso');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!canDelete) {
      alert('No tienes permisos para eliminar cursos. Esta funcionalidad está deshabilitada en la configuración del sistema.');
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el curso "${course.title}"?\n\nEsta acción eliminará:\n- El curso completo\n- Todas sus unidades y módulos\n- Todo el contenido asociado\n\nEsta acción NO se puede deshacer.`
    );

    if (confirmed) {
      if (!course.id) {
        alert('Error: ID del curso no válido');
        return;
      }

      try {
        logger.info('🗑️ Eliminando curso:', course.title);
        
        const result = await courseService.deleteCourse(course.id);
        
        if (result.success) {
          logger.success('✅ Curso eliminado exitosamente');
          // Recargar la lista de cursos
          loadCourses();
        } else {
          alert(`Error al eliminar el curso: ${result.error}`);
        }
      } catch (error) {
        logger.error('❌ Error eliminando curso:', error);
        alert('Error inesperado al eliminar el curso');
      }
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && course.isPublished) ||
                         (filterStatus === 'draft' && !course.isPublished);

    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mis Cursos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona tus cursos, edita contenido y monitorea el progreso de tus estudiantes
            </p>
          </div>
          <Link to="/teacher/courses/create">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Crear Curso
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos los cursos</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No hay cursos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || filterStatus !== 'all' 
                ? 'No se encontraron cursos que coincidan con los filtros aplicados'
                : 'Comienza creando tu primer curso'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <div className="mt-6">
                <Link to="/teacher/courses/create">
                  <Button variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear mi primer curso
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onCopy={handleCopyCourse}
                onDelete={canDelete ? handleDeleteCourse : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherCoursesPage;