import React from 'react';
import { motion } from 'framer-motion';

interface ProgressTrackerProps {
  courseProgress: number;
  lessonProgress: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  courseProgress,
  lessonProgress
}) => {
  return (
    <div className="flex items-center gap-4 text-white">
      {/* Lesson Progress */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-300">Lección:</span>
        <div className="w-16 bg-gray-600 rounded-full h-2 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${lessonProgress}%` }}
            transition={{ duration: 0.3 }}
            className="bg-[var(--color-primary)] h-full rounded-full"
          />
        </div>
        <span className="text-xs text-gray-300 font-mono w-8">
          {Math.round(lessonProgress)}%
        </span>
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-gray-600" />

      {/* Course Progress */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-300">Curso:</span>
        <div className="w-20 bg-gray-600 rounded-full h-2 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${courseProgress}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full"
          />
        </div>
        <span className="text-xs text-gray-300 font-mono w-8">
          {Math.round(courseProgress)}%
        </span>
      </div>

      {/* Achievement Badge */}
      {courseProgress >= 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="flex items-center gap-1 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium"
        >
          <span>🏆</span>
          <span>Completado</span>
        </motion.div>
      )}
    </div>
  );
};