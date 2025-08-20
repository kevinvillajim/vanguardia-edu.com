import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { CourseBuilder } from '../components/CourseBuilder/CourseBuilder';
import { CoursePreview } from '../components/CourseBuilder/CoursePreview';
import { PublishModal } from '../components/CourseBuilder/PublishModal';
import { Card } from '../../../shared/components/ui/Card/Card';
import { Button } from "@/shared/components/ui/Button/Button";

export interface CourseData {
  title: string;
  description: string;
  category_id: number | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_free: boolean;
  banner_image?: string;
  learning_objectives: string[];
  prerequisites: string[];
  modules: ModuleData[];
}

export interface ModuleData {
  id?: number;
  title: string;
  description: string;
  order: number;
  lessons: LessonData[];
}

export interface LessonData {
  id?: number;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'interactive';
  duration_minutes: number;
  order: number;
  is_preview: boolean;
  content: LessonContent[];
}

export interface LessonContent {
  id?: number;
  type: 'text' | 'video' | 'image' | 'quiz' | 'code' | 'interactive';
  content: any;
  order: number;
}

const TABS = [
  { id: 'builder', label: 'Constructor', icon: '🏗️' },
  { id: 'preview', label: 'Vista Previa', icon: '👁️' },
  { id: 'settings', label: 'Configuración', icon: '⚙️' }
] as const;

type TabId = typeof TABS[number]['id'];

export const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabId>('builder');
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    category_id: null,
    difficulty_level: 'beginner',
    price: 0,
    is_free: true,
    learning_objectives: [],
    prerequisites: [],
    modules: []
  });
  
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && courseData.title) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [courseData, isDirty]);

  // Warn before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const saveDraft = async () => {
    if (!courseData.title) return;
    
    setSaving(true);
    try {
      localStorage.setItem('course_draft', JSON.stringify(courseData));
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('course_draft');
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setCourseData(parsedDraft);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const validateCourse = (): string[] => {
    const errors: string[] = [];
    
    if (!courseData.title.trim()) {
      errors.push('El título del curso es obligatorio');
    }
    
    if (!courseData.description.trim()) {
      errors.push('La descripción del curso es obligatoria');
    }
    
    if (courseData.modules.length === 0) {
      errors.push('El curso debe tener al menos un módulo');
    }
    
    courseData.modules.forEach((module, moduleIndex) => {
      if (!module.title.trim()) {
        errors.push(`El módulo ${moduleIndex + 1} debe tener un título`);
      }
      
      if (module.lessons.length === 0) {
        errors.push(`El módulo "${module.title}" debe tener al menos una lección`);
      }
      
      module.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title.trim()) {
          errors.push(`La lección ${lessonIndex + 1} del módulo "${module.title}" debe tener un título`);
        }
        
        if (lesson.content.length === 0) {
          errors.push(`La lección "${lesson.title}" debe tener contenido`);
        }
      });
    });
    
    return errors;
  };

  const handlePublish = () => {
    const errors = validateCourse();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setShowPublishModal(true);
    }
  };

  const handleSaveAndExit = async () => {
    await saveDraft();
    navigate('/teacher/dashboard');
  };

  const updateCourseData = (updates: Partial<CourseData>) => {
    setCourseData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'builder':
        return (
          <CourseBuilder 
            courseData={courseData}
            onUpdate={updateCourseData}
            validationErrors={validationErrors}
          />
        );
      case 'preview':
        return (
          <CoursePreview 
            courseData={courseData}
          />
        );
      case 'settings':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configuración del Curso</h3>
            <p className="text-gray-600">Configuraciones adicionales del curso...</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Load draft on component mount
  useEffect(() => {
    loadDraft();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/teacher/dashboard')}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                Volver
              </Button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {courseData.title || 'Nuevo Curso'}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Instructor: {user?.name}</span>
                  {saving && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">Guardando...</span>
                    </>
                  )}
                  {isDirty && !saving && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600">Cambios sin guardar</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAndExit}
                loading={saving}
              >
                Guardar y Salir
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublish}
                disabled={!courseData.title || courseData.modules.length === 0}
              >
                Publicar Curso
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border-b border-red-200"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-900 mb-1">
                    Errores de validación:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setValidationErrors([])}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  ✕
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Card className="min-h-[calc(100vh-200px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <PublishModal
            courseData={courseData}
            onClose={() => setShowPublishModal(false)}
            onPublish={(publishData) => {
              console.log('Publishing course:', publishData);
              navigate('/teacher/dashboard');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateCoursePage;