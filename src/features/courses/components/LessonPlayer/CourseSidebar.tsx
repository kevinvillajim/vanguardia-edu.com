import React from 'react';
import { motion } from 'framer-motion';
import { CourseDetail } from '../../../../services/courses/courseService';
import { Button } from "@/shared/components/ui/Button/Button";

interface CourseSidebarProps {
  course: CourseDetail;
  currentLessonId: number;
  onLessonSelect: (lessonId: number) => void;
  onClose: () => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  course,
  currentLessonId,
  onLessonSelect,
  onClose
}) => {
  const getLessonIcon = (type: string, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) return '✅';
    if (isCurrent) return '▶️';
    
    switch (type) {
      case 'video': return '🎥';
      case 'text': return '📝';
      case 'quiz': return '❓';
      case 'interactive': return '🎮';
      default: return '📄';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const calculateModuleProgress = (module: any) => {
    const completedLessons = module.lessons.filter((lesson: any) => lesson.is_completed).length;
    return module.lessons.length > 0 ? (completedLessons / module.lessons.length) * 100 : 0;
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Contenido del Curso</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            ✕
          </Button>
        </div>
        
        <div>
          <h4 className="font-medium text-white mb-1">{course.title}</h4>
          <div className="text-sm text-gray-400">
            {course.modules.length} módulos • {course.total_lessons} lecciones
          </div>
        </div>
      </div>

      {/* Modules and Lessons */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {course.modules.map((module, moduleIndex) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: moduleIndex * 0.1 }}
              className="mb-4"
            >
              {/* Module Header */}
              <div className="bg-gray-700 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white text-sm">
                    {moduleIndex + 1}. {module.title}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {module.lessons.length} lecciones
                  </span>
                </div>
                
                {/* Module Progress */}
                <div className="w-full bg-gray-600 rounded-full h-1">
                  <div 
                    className="bg-[var(--color-primary)] h-1 rounded-full transition-all duration-300"
                    style={{ width: `${calculateModuleProgress(module)}%` }}
                  />
                </div>
              </div>

              {/* Lessons */}
              <div className="space-y-1">
                {module.lessons.map((lesson, lessonIndex) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const isCompleted = lesson.is_completed || false;
                  
                  return (
                    <motion.button
                      key={lesson.id}
                      onClick={() => onLessonSelect(lesson.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        isCurrent
                          ? 'bg-[var(--color-primary)] text-white shadow-lg'
                          : isCompleted
                          ? 'bg-green-800/30 hover:bg-green-800/50 text-green-200'
                          : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg flex-shrink-0">
                          {getLessonIcon(lesson.type, isCompleted, isCurrent)}
                        </span>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono opacity-75">
                              {lessonIndex + 1}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {lesson.title}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs opacity-75">
                            <span className="capitalize">{lesson.type}</span>
                            <span>•</span>
                            <span>{formatDuration(lesson.duration_minutes)}</span>
                            {lesson.is_preview && (
                              <>
                                <span>•</span>
                                <span className="text-blue-300">Vista previa</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {isCurrent && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Progreso del curso</span>
            <span className="text-white font-medium">
              0% completado
            </span>
          </div>
          
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
              style={{ width: '0%' }}
            />
          </div>
          
          <div className="text-xs text-gray-400 mt-2">
            0 de {course.total_lessons} lecciones completadas
          </div>
        </div>
      </div>
    </div>
  );
};