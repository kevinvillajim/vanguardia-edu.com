import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/shared/components/ui/Button/Button";

interface LessonNavigationProps {
  currentLesson: {
    id: number;
    title: string;
    type: string;
  };
  previousLesson?: {
    id: number;
    title: string;
    type: string;
  } | null;
  nextLesson?: {
    id: number;
    title: string;
    type: string;
  } | null;
  onNavigate: (lessonId: number) => void;
  isCompleted: boolean;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
  currentLesson,
  previousLesson,
  nextLesson,
  onNavigate,
  isCompleted
}) => {
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'text': return '📝';
      case 'quiz': return '❓';
      case 'interactive': return '🎮';
      default: return '📄';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border-t border-gray-700 px-6 py-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Previous Lesson */}
          <div className="flex-1">
            {previousLesson ? (
              <Button
                variant="ghost"
                onClick={() => onNavigate(previousLesson.id)}
                className="text-white hover:bg-gray-700 max-w-xs"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                <div className="text-left">
                  <div className="text-xs text-gray-400 mb-1">Anterior</div>
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    <span>{getLessonIcon(previousLesson.type)}</span>
                    {previousLesson.title}
                  </div>
                </div>
              </Button>
            ) : (
              <div></div>
            )}
          </div>

          {/* Current Lesson Info */}
          <div className="flex-1 text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg">{getLessonIcon(currentLesson.type)}</span>
              <span className="text-sm font-medium">{currentLesson.title}</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              {isCompleted && (
                <>
                  <span className="text-green-400">✅ Completado</span>
                  <span>•</span>
                </>
              )}
              <span className="capitalize">{currentLesson.type}</span>
            </div>
          </div>

          {/* Next Lesson */}
          <div className="flex-1 flex justify-end">
            {nextLesson ? (
              <Button
                variant={isCompleted ? "primary" : "ghost"}
                onClick={() => onNavigate(nextLesson.id)}
                className={`max-w-xs ${
                  isCompleted 
                    ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white" 
                    : "text-white hover:bg-gray-700"
                }`}
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              >
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">Siguiente</div>
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    {nextLesson.title}
                    <span>{getLessonIcon(nextLesson.type)}</span>
                  </div>
                </div>
              </Button>
            ) : (
              <div className="text-center text-white">
                <div className="text-xs text-gray-400 mb-1">Final del curso</div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <span>🎉</span>
                  ¡Felicitaciones!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center mt-4 gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            📖 Recursos
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            💬 Comentarios
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            🔖 Marcadores
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            ⏭️ Cambiar velocidad
          </Button>
        </div>
      </div>
    </motion.div>
  );
};