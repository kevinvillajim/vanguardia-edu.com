import React from 'react';
import { Clock, Users, BookOpen, Eye, Star, User } from 'lucide-react';
import { Course } from '../../../domain/entities/Course';
import { buildMediaUrl } from '../../utils/mediaUtils';
import { Button } from '../../../components/ui';

interface CourseCardProps {
  course: Course;
  onViewMore: () => void;
  showTeacher?: boolean;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewMore,
  showTeacher = true,
  className = ''
}) => {
  const bannerUrl = course.bannerImage ? buildMediaUrl(course.bannerImage) : null;
  const defaultBanner = '/images/default-course-banner.jpg';

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${className}`}>
      {/* Banner del curso */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={bannerUrl || defaultBanner}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge de estado */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : course.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {course.status === 'published' ? 'Publicado' : 
             course.status === 'draft' ? 'Borrador' : 'Inactivo'}
          </span>
        </div>

        {/* Categoría */}
        {course.category && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {course.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Contenido de la card */}
      <div className="p-6">
        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 min-h-[3.5rem]">
          <span className="line-clamp-2">{course.title}</span>
        </h3>

        {/* Descripción corta */}
        <p className="text-gray-600 text-sm mb-4 min-h-[4.5rem]">
          <span className="line-clamp-3">{course.description}</span>
        </p>

        {/* Profesor */}
        {showTeacher && course.teacher && (
          <div className="flex items-center mb-4 pb-4 border-b">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {course.teacher.firstName} {course.teacher.lastName}
              </p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>
        )}

        {/* Métricas del curso */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {course.duration && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{Math.ceil(course.duration / 60)}h</span>
              </div>
            )}
            
            {course.enrollmentCount !== undefined && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{course.enrollmentCount}</span>
              </div>
            )}
            
            {course.totalUnits && (
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>{course.totalUnits} unidades</span>
              </div>
            )}
          </div>

          {/* Rating si existe */}
          {course.averageRating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {course.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Objetivos de aprendizaje (preview) */}
        {course.learningObjectives && course.learningObjectives.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Aprenderás:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {course.learningObjectives.slice(0, 2).map((objective, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="truncate">{objective}</span>
                </li>
              ))}
              {course.learningObjectives.length > 2 && (
                <li className="text-blue-600 font-medium text-xs">
                  +{course.learningObjectives.length - 2} objetivos más...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Botón Ver más */}
        <Button
          onClick={onViewMore}
          variant="outline"
          className="w-full"
          leftIcon={<Eye className="w-4 h-4" />}
        >
          Ver más...
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;