import React from 'react';
import { 
  Clock, 
  Users, 
  BookOpen, 
  Star, 
  User, 
  Target,
  CheckCircle,
  Calendar,
  Tag,
  Globe,
  Award
} from 'lucide-react';
import { Course } from '../../../domain/entities/Course';
import { buildMediaUrl } from '../../utils/mediaUtils';

interface CourseDetailProps {
  course: Course;
  className?: string;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({
  course,
  className = ''
}) => {
  const bannerUrl = course.bannerImage ? buildMediaUrl(course.bannerImage) : null;
  const defaultBanner = '/images/default-course-banner.jpg';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Banner del curso */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={bannerUrl || defaultBanner}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay con información básica */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Estado */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                course.status === 'published' 
                  ? 'bg-green-500 text-white' 
                  : course.status === 'draft'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}>
                {course.status === 'published' ? 'Publicado' : 
                 course.status === 'draft' ? 'Borrador' : 'Inactivo'}
              </span>

              {/* Categoría */}
              {course.category && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                  {course.category.name}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {course.title}
            </h1>
            
            {/* Métricas rápidas */}
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              {course.duration && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">{Math.ceil(course.duration / 60)} horas</span>
                </div>
              )}
              
              {course.enrollmentCount !== undefined && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm">{course.enrollmentCount} estudiantes</span>
                </div>
              )}
              
              {course.totalUnits && (
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span className="text-sm">{course.totalUnits} unidades</span>
                </div>
              )}
              
              {course.averageRating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                  <span className="text-sm">{course.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2">
            {/* Descripción */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Descripción del curso
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {course.description}
                </p>
              </div>
            </section>

            {/* Objetivos de aprendizaje */}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Objetivos de aprendizaje
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 leading-relaxed">{objective}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requisitos */}
            {course.requirements && course.requirements.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-600" />
                  Requisitos
                </h2>
                <div className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-600 font-bold mt-1">•</span>
                      <span className="text-sm text-gray-700 leading-relaxed">{requirement}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Estructura del curso */}
            {course.units && course.units.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Contenido del curso
                </h2>
                <div className="space-y-3">
                  {course.units.map((unit, index) => (
                    <div key={unit.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="font-medium text-gray-900">
                          Unidad {index + 1}: {unit.title}
                        </h3>
                        {unit.description && (
                          <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                        )}
                      </div>
                      
                      {unit.modules && unit.modules.length > 0 && (
                        <div className="px-4 py-3">
                          <div className="space-y-2">
                            {unit.modules.map((module, moduleIndex) => (
                              <div key={module.id} className="text-sm text-gray-600">
                                <span className="font-medium">
                                  {index + 1}.{moduleIndex + 1} {module.title}
                                </span>
                                {module.components && (
                                  <span className="ml-2 text-gray-500">
                                    ({module.components.length} elementos)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar de información */}
          <div className="lg:col-span-1">
            {/* Información del profesor */}
            {course.teacher && (
              <section className="mb-6 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Instructor
                </h3>
                
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {course.teacher.firstName} {course.teacher.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{course.teacher.email}</p>
                  </div>
                </div>
                
                {course.teacher.bio && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {course.teacher.bio}
                  </p>
                )}
              </section>
            )}

            {/* Detalles del curso */}
            <section className="mb-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-green-600" />
                Detalles
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-medium text-gray-900">
                    {course.level ? 
                      (course.level === 'beginner' ? 'Principiante' :
                       course.level === 'intermediate' ? 'Intermedio' : 'Avanzado')
                      : 'No especificado'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Idioma:</span>
                  <span className="font-medium text-gray-900">
                    {course.language || 'Español'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de creación:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(course.createdAt)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Última actualización:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(course.updatedAt)}
                  </span>
                </div>
              </div>
            </section>

            {/* Estadísticas adicionales */}
            <section className="p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Estadísticas
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {course.enrollmentCount || 0}
                  </div>
                  <div className="text-xs text-gray-600">Estudiantes</div>
                </div>
                
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {course.totalUnits || 0}
                  </div>
                  <div className="text-xs text-gray-600">Unidades</div>
                </div>
                
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.ceil((course.duration || 0) / 60)}h
                  </div>
                  <div className="text-xs text-gray-600">Duración</div>
                </div>
                
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {course.averageRating?.toFixed(1) || '--'}
                  </div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;