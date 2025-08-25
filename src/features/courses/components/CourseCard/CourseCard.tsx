import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Course } from '../../../../shared/types';
import { Card, MediaImage } from '../../../../shared/components';
import { Star } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
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

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant = 'default',
  className = ''
}) => {

  const formatDuration = (hours: number | string | null | undefined) => {
    // Convert to number and handle various input types
    const numericHours = hours === null || hours === undefined ? 0 : Number(hours);
    
    // Check if conversion resulted in a valid number
    if (isNaN(numericHours) || numericHours === 0) return '';
    
    return numericHours === 1 ? '1 hora' : `${numericHours} horas`;
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Link to={`/courses/${course.slug}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-video relative overflow-hidden">
              {course.banner_image ? (
                <MediaImage
                  src={course.banner_image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  courseId={course.id}
                  fallbackStrategy="after-error"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {course.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              {course.is_featured && (
                <div className="absolute top-2 right-2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Destacado
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                {course.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className={`px-2 py-1 rounded-full ${difficultyColors[course.difficulty_level]}`}>
                  {difficultyLabels[course.difficulty_level]}
                </span>
              </div>
              
              <p className="text-xs text-gray-600">
                {course.teacher.name}
              </p>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={`${className} ${variant === 'featured' ? 'lg:col-span-2' : ''}`}
    >
      <Link to={`/courses/${course.slug}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
          <div className={`${variant === 'featured' ? 'aspect-[2/1]' : 'aspect-video'} relative overflow-hidden`}>
            {course.banner_image ? (
              <MediaImage
                src={course.banner_image}
                alt={course.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                courseId={course.id}
                fallbackStrategy="after-error"
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
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4" /> Destacado
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
            <div className="mb-3">
              <h3 className="font-bold text-xl text-gray-900 line-clamp-2">
                {course.title}
              </h3>
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
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="font-medium">{course.rating}</span>
                <span className="text-gray-400">({course.enrollment_count})</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {course.teacher.avatar ? (
                  <MediaImage
                    src={course.teacher.avatar}
                    alt={course.teacher.name}
                    className="w-8 h-8 rounded-full object-cover"
                    fallbackStrategy="after-error"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-medium">
                    {course.teacher.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{course.teacher.name}</p>
                  {course.category && (
                    <p className="text-xs text-gray-500">{course.category.name}</p>
                  )}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors duration-200"
              >
                Ver curso
              </motion.button>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default CourseCard;