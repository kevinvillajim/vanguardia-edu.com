import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Course, courseService } from '../../../../services/courses/courseService';
import { Card } from '../../ui/Card/Card';
import { Button } from '../../ui/Button/Button';

interface TeacherCourseCardProps {
  course: Course;
  className?: string;
  onCourseUpdate?: () => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export const TeacherCourseCard: React.FC<TeacherCourseCardProps> = ({
  course,
  className = '',
  onCourseUpdate
}) => {
  const [publishLoading, setPublishLoading] = useState(false);
  const formatPrice = (price: number | string | null | undefined) => {
    const numericPrice = price === null || price === undefined ? 0 : Number(price);
    if (isNaN(numericPrice)) {
      return 'Gratis';
    }
    return numericPrice === 0 ? 'Gratis' : `$${numericPrice.toFixed(2)}`;
  };

  const formatDuration = (hours: number | string | null | undefined) => {
    const numericHours = hours === null || hours === undefined ? 0 : Number(hours);
    if (isNaN(numericHours) || numericHours === 0) return '';
    return numericHours === 1 ? '1 hora' : `${numericHours} horas`;
  };

  const handlePublishToggle = async () => {
    setPublishLoading(true);
    try {
      if (course.is_published) {
        await courseService.unpublishCourse(course.id);
      } else {
        await courseService.publishCourse(course.id);
      }
      onCourseUpdate?.();
    } catch (error) {
      console.error('Error toggling course publish status:', error);
      alert('Error al cambiar el estado de publicación del curso');
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
        <div className="aspect-video relative overflow-hidden">
          {course.banner_image ? (
            <img
              src={course.banner_image}
              alt={course.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {course.title.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Overlay con badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {course.is_featured && (
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                ⭐ Destacado
              </span>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[course.difficulty_level]}`}>
              {difficultyLabels[course.difficulty_level]}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-xl text-gray-900 line-clamp-2 flex-1">
              {course.title}
            </h3>
            <div className="ml-4 text-right">
              <span className="text-2xl font-bold text-[var(--color-primary)]">
                {formatPrice(course.price)}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(course.duration_hours)}
              </span>
              
              {course.total_lessons && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {course.total_lessons} lecciones
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <span className="font-medium">{course.enrollment_count || 0} estudiantes</span>
            </div>
          </div>
          
          {/* Teacher Management Actions */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
            <Link to={`/courses/${course.slug}`}>
              <Button variant="outline" size="sm" fullWidth>
                Ver Curso
              </Button>
            </Link>
            
            <Link to={`/courses/${course.id}/students`}>
              <Button variant="primary" size="sm" fullWidth>
                Gestionar
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant="ghost" size="sm" fullWidth>
              Editar
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              fullWidth
              className={course.is_published ? 'text-orange-600' : 'text-green-600'}
              onClick={handlePublishToggle}
              loading={publishLoading}
            >
              {publishLoading 
                ? 'Procesando...'
                : course.is_published 
                  ? 'Despublicar' 
                  : 'Publicar'
              }
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};