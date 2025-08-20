import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { courseService, CourseDetail } from '../../../services/courses/courseService';
import { LessonPlayer } from '../components/LessonPlayer/LessonPlayer';
import { CourseSidebar } from '../components/LessonPlayer/CourseSidebar';
import { LessonNavigation } from '../components/LessonPlayer/LessonNavigation';
import { ProgressTracker } from '../components/LessonPlayer/ProgressTracker';
import { NotesPanel } from '../components/LessonPlayer/NotesPanel';
import { Button } from "@/shared/components/ui/Button/Button";

interface LessonData {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'interactive';
  duration_minutes: number;
  content: any[];
  is_completed: boolean;
  module_title: string;
  module_id: number;
}

export const LessonViewPage: React.FC = () => {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (courseId && lessonId) {
      loadCourseAndLesson();
    }
  }, [courseId, lessonId]);

  const loadCourseAndLesson = async () => {
    if (!courseId || !lessonId) return;
    
    setLoading(true);
    try {
      // Cargar datos del curso
      const courseResponse = await courseService.getCourse(parseInt(courseId));
      setCourse(courseResponse);

      // Buscar la lección actual en los módulos
      let foundLesson: LessonData | null = null;
      
      for (const module of courseResponse.modules) {
        const lesson = module.lessons.find(l => l.id === parseInt(lessonId));
        if (lesson) {
          foundLesson = {
            ...lesson,
            module_title: module.title,
            module_id: module.id,
            is_completed: false // Esto vendría del backend con el progreso del usuario
          };
          break;
        }
      }

      if (foundLesson) {
        setCurrentLesson(foundLesson);
        setIsCompleted(foundLesson.is_completed);
      } else {
        setError('Lección no encontrada');
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando la lección');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson || !courseId) return;
    
    try {
      // Marcar lección como completada en el backend
      // await courseService.markLessonComplete(courseId, currentLesson.id);
      
      setIsCompleted(true);
      setLessonProgress(100);
      
      // Navegar automáticamente a la siguiente lección
      const nextLesson = getNextLesson();
      if (nextLesson) {
        setTimeout(() => {
          navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  const handleProgressUpdate = (progress: number) => {
    setLessonProgress(progress);
    
    // Auto-completar cuando llega al 90%
    if (progress >= 90 && !isCompleted) {
      handleLessonComplete();
    }
  };

  const getAllLessons = () => {
    if (!course) return [];
    
    const allLessons: Array<LessonData & { moduleIndex: number; lessonIndex: number }> = [];
    
    course.modules.forEach((module, moduleIndex) => {
      module.lessons.forEach((lesson, lessonIndex) => {
        allLessons.push({
          ...lesson,
          module_title: module.title,
          module_id: module.id,
          is_completed: false, // Esto vendría del backend
          moduleIndex,
          lessonIndex
        });
      });
    });
    
    return allLessons;
  };

  const getCurrentLessonIndex = () => {
    const allLessons = getAllLessons();
    return allLessons.findIndex(lesson => lesson.id === currentLesson?.id);
  };

  const getNextLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    return currentIndex >= 0 && currentIndex < allLessons.length - 1 
      ? allLessons[currentIndex + 1] 
      : null;
  };

  const getPreviousLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const navigateToLesson = (lessonId: number) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  const calculateCourseProgress = () => {
    if (!course) return 0;
    
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const completedLessons = 0; // Esto vendría del backend con el progreso real
    
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a las lecciones</p>
          <Button onClick={() => navigate('/auth/login')} variant="primary">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Lección no encontrada'}</p>
          <Button onClick={() => navigate(`/courses/${courseId}`)} variant="primary">
            Volver al Curso
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="text-white hover:bg-gray-700"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Volver al Curso
          </Button>
          
          <div className="text-white">
            <h1 className="font-semibold">{course.title}</h1>
            <p className="text-sm text-gray-300">{currentLesson.module_title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProgressTracker 
            courseProgress={calculateCourseProgress()}
            lessonProgress={lessonProgress}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotesOpen(!notesOpen)}
            className="text-white hover:bg-gray-700"
          >
            📝 Notas
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-gray-700"
          >
            {sidebarOpen ? '👁️' : '📋'}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Lesson Player */}
          <div className="flex-1 relative">
            <LessonPlayer
              lesson={currentLesson}
              onProgressUpdate={handleProgressUpdate}
              onComplete={handleLessonComplete}
              isCompleted={isCompleted}
            />
          </div>

          {/* Lesson Navigation */}
          <LessonNavigation
            currentLesson={currentLesson}
            previousLesson={getPreviousLesson()}
            nextLesson={getNextLesson()}
            onNavigate={navigateToLesson}
            isCompleted={isCompleted}
          />
        </div>

        {/* Course Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 border-l border-gray-700 overflow-hidden"
            >
              <CourseSidebar
                course={course}
                currentLessonId={currentLesson.id}
                onLessonSelect={navigateToLesson}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Panel */}
        <AnimatePresence>
          {notesOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 border-l border-gray-700 overflow-hidden"
            >
              <NotesPanel
                courseId={courseId!}
                lessonId={currentLesson.id.toString()}
                onClose={() => setNotesOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md mx-4 text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Lección Completada!
              </h3>
              <p className="text-gray-600 mb-6">
                Has completado "{currentLesson.title}" exitosamente
              </p>
              
              <div className="space-y-3">
                {getNextLesson() ? (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigateToLesson(getNextLesson()!.id)}
                  >
                    Continuar con la Siguiente Lección
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigate(`/courses/${courseId}`)}
                  >
                    Completar Curso
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setIsCompleted(false)}
                >
                  Revisar Lección
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonViewPage;