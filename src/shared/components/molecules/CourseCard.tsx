import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../atoms';
import { Button } from '../../../components/ui/Button/Button';
import { ProgressBar } from './ProgressBar';
import { MediaImage } from '../media/MediaImage';
import { formatDuration, cn } from '../../utils';

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  bannerUrl?: string;
  duration?: number;
  lessonsCount?: number;
  level?: string;
  isEnrolled?: boolean;
  progress?: number;
  teacherName?: string;
  className?: string;
  onClick?: () => void;
  onEnroll?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  bannerUrl,
  duration,
  lessonsCount,
  level,
  isEnrolled = false,
  progress = 0,
  teacherName,
  className,
  onClick,
  onEnroll
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn('w-full', className)}
    >
      <Card variant="elevated" padding="none" className="overflow-hidden cursor-pointer" onClick={onClick}>
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
          {bannerUrl ? (
            <MediaImage
              src={bannerUrl} 
              alt={title}
              className="w-full h-full object-cover"
              courseId={id}
              fallbackStrategy="after-error"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-xl font-semibold">{title[0]}</span>
            </div>
          )}
          
          {level && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-white/90 text-xs font-medium rounded-full">
                {level}
              </span>
            </div>
          )}
          
        </div>

        <CardContent padding="lg">
          {/* Title and Description */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {description}
            </p>
          </div>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            {duration && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(duration)}
              </span>
            )}
            {lessonsCount && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {lessonsCount} lecciones
              </span>
            )}
          </div>

          {/* Teacher */}
          {teacherName && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">{teacherName}</span>
            </div>
          )}

          {/* Progress or Enroll Button */}
          {isEnrolled ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <ProgressBar value={progress} variant="success" />
            </div>
          ) : (
            <Button 
              fullWidth 
              onClick={(e) => {
                e.stopPropagation();
                onEnroll?.();
              }}
            >
              Ver curso
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};