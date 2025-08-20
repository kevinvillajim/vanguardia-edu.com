import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { CourseData, ModuleData, LessonData } from '../../pages/CreateCoursePage';
import { CourseBasicInfo } from './CourseBasicInfo';
import { ModuleEditor } from './ModuleEditor';
import { LessonEditor } from './LessonEditor';
import { ContentEditor } from './ContentEditor';
import { Card } from '../../../../shared/components/ui/Card/Card';
import { Button } from "@/shared/components/ui/Button/Button";

interface CourseBuilderProps {
  courseData: CourseData;
  onUpdate: (updates: Partial<CourseData>) => void;
  validationErrors: string[];
}

type EditorMode = 'overview' | 'module' | 'lesson' | 'content';

interface EditorState {
  mode: EditorMode;
  moduleIndex?: number;
  lessonIndex?: number;
  contentIndex?: number;
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({
  courseData,
  onUpdate,
  validationErrors
}) => {
  const [editorState, setEditorState] = useState<EditorState>({ mode: 'overview' });
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  const toggleModuleExpansion = (moduleIndex: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex);
    } else {
      newExpanded.add(moduleIndex);
    }
    setExpandedModules(newExpanded);
  };

  const addModule = () => {
    const newModule: ModuleData = {
      title: '',
      description: '',
      order: courseData.modules.length + 1,
      lessons: []
    };
    
    onUpdate({
      modules: [...courseData.modules, newModule]
    });
    
    // Auto-expand and edit the new module
    const newModuleIndex = courseData.modules.length;
    setExpandedModules(prev => new Set([...prev, newModuleIndex]));
    setEditorState({ mode: 'module', moduleIndex: newModuleIndex });
  };

  const updateModule = (moduleIndex: number, updates: Partial<ModuleData>) => {
    const updatedModules = courseData.modules.map((module, index) =>
      index === moduleIndex ? { ...module, ...updates } : module
    );
    onUpdate({ modules: updatedModules });
  };

  const deleteModule = (moduleIndex: number) => {
    const updatedModules = courseData.modules
      .filter((_, index) => index !== moduleIndex)
      .map((module, index) => ({ ...module, order: index + 1 }));
    
    onUpdate({ modules: updatedModules });
    setEditorState({ mode: 'overview' });
  };

  const addLesson = (moduleIndex: number) => {
    const module = courseData.modules[moduleIndex];
    const newLesson: LessonData = {
      title: '',
      description: '',
      type: 'text',
      duration_minutes: 10,
      order: module.lessons.length + 1,
      is_preview: false,
      content: []
    };

    updateModule(moduleIndex, {
      lessons: [...module.lessons, newLesson]
    });

    // Auto-edit the new lesson
    const newLessonIndex = module.lessons.length;
    setEditorState({ 
      mode: 'lesson', 
      moduleIndex, 
      lessonIndex: newLessonIndex 
    });
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, updates: Partial<LessonData>) => {
    const module = courseData.modules[moduleIndex];
    const updatedLessons = module.lessons.map((lesson, index) =>
      index === lessonIndex ? { ...lesson, ...updates } : lesson
    );
    
    updateModule(moduleIndex, { lessons: updatedLessons });
  };

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const module = courseData.modules[moduleIndex];
    const updatedLessons = module.lessons
      .filter((_, index) => index !== lessonIndex)
      .map((lesson, index) => ({ ...lesson, order: index + 1 }));
    
    updateModule(moduleIndex, { lessons: updatedLessons });
    setEditorState({ mode: 'module', moduleIndex });
  };

  const reorderModules = (newOrder: ModuleData[]) => {
    const reorderedModules = newOrder.map((module, index) => ({
      ...module,
      order: index + 1
    }));
    onUpdate({ modules: reorderedModules });
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Course Basic Info */}
      <CourseBasicInfo
        courseData={courseData}
        onUpdate={onUpdate}
        validationErrors={validationErrors}
      />

      {/* Modules Overview */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Estructura del Curso</h3>
              <p className="text-sm text-gray-600 mt-1">
                Organiza tu curso en módulos y lecciones
              </p>
            </div>
            <Button onClick={addModule} variant="primary" size="sm">
              + Agregar Módulo
            </Button>
          </div>
        </div>

        <div className="p-6">
          {courseData.modules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No hay módulos aún
              </h4>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primer módulo del curso
              </p>
              <Button onClick={addModule} variant="primary">
                Crear Primer Módulo
              </Button>
            </div>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={courseData.modules} 
              onReorder={reorderModules}
              className="space-y-4"
            >
              {courseData.modules.map((module, moduleIndex) => (
                <Reorder.Item
                  key={`module-${moduleIndex}`}
                  value={module}
                  className="bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {module.title || `Módulo ${moduleIndex + 1}`}
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          {module.lessons.length} lecciones
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditorState({ mode: 'module', moduleIndex })}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModuleExpansion(moduleIndex)}
                        >
                          {expandedModules.has(moduleIndex) ? '−' : '+'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteModule(moduleIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                    
                    {module.description && (
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                    )}

                    {/* Lessons List */}
                    {expandedModules.has(moduleIndex) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mt-4 pt-4 border-t border-gray-200"
                      >
                        {module.lessons.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-500 mb-3">No hay lecciones en este módulo</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addLesson(moduleIndex)}
                            >
                              + Agregar Primera Lección
                            </Button>
                          </div>
                        ) : (
                          <>
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={`lesson-${lessonIndex}`}
                                className="flex items-center justify-between p-3 bg-white rounded border border-gray-100"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-gray-400 font-mono w-6">
                                    {lessonIndex + 1}
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {lesson.title || `Lección ${lessonIndex + 1}`}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <span>{lesson.type}</span>
                                      <span>•</span>
                                      <span>{lesson.duration_minutes} min</span>
                                      {lesson.is_preview && (
                                        <>
                                          <span>•</span>
                                          <span className="text-blue-600">Vista previa</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditorState({ 
                                      mode: 'lesson', 
                                      moduleIndex, 
                                      lessonIndex 
                                    })}
                                  >
                                    ✏️
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteLesson(moduleIndex, lessonIndex)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    🗑️
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <div className="text-center pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addLesson(moduleIndex)}
                              >
                                + Agregar Lección
                              </Button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      </Card>
    </div>
  );

  const renderModuleEditor = () => {
    if (editorState.moduleIndex === undefined) return null;
    
    const module = courseData.modules[editorState.moduleIndex];
    if (!module) return null;

    return (
      <ModuleEditor
        module={module}
        moduleIndex={editorState.moduleIndex}
        onUpdate={(updates) => updateModule(editorState.moduleIndex!, updates)}
        onBack={() => setEditorState({ mode: 'overview' })}
        onAddLesson={() => addLesson(editorState.moduleIndex!)}
        onEditLesson={(lessonIndex) => setEditorState({
          mode: 'lesson',
          moduleIndex: editorState.moduleIndex,
          lessonIndex
        })}
        onDeleteLesson={(lessonIndex) => deleteLesson(editorState.moduleIndex!, lessonIndex)}
      />
    );
  };

  const renderLessonEditor = () => {
    if (editorState.moduleIndex === undefined || editorState.lessonIndex === undefined) return null;
    
    const module = courseData.modules[editorState.moduleIndex];
    const lesson = module?.lessons[editorState.lessonIndex];
    if (!lesson) return null;

    return (
      <LessonEditor
        lesson={lesson}
        moduleIndex={editorState.moduleIndex}
        lessonIndex={editorState.lessonIndex}
        onUpdate={(updates) => updateLesson(editorState.moduleIndex!, editorState.lessonIndex!, updates)}
        onBack={() => setEditorState({ mode: 'module', moduleIndex: editorState.moduleIndex })}
        onEditContent={(contentIndex) => setEditorState({
          mode: 'content',
          moduleIndex: editorState.moduleIndex,
          lessonIndex: editorState.lessonIndex,
          contentIndex
        })}
      />
    );
  };

  const renderContentEditor = () => {
    if (editorState.moduleIndex === undefined || 
        editorState.lessonIndex === undefined) return null;
    
    const module = courseData.modules[editorState.moduleIndex];
    const lesson = module?.lessons[editorState.lessonIndex];
    if (!lesson) return null;

    return (
      <ContentEditor
        lesson={lesson}
        moduleIndex={editorState.moduleIndex}
        lessonIndex={editorState.lessonIndex}
        onUpdate={(updates) => updateLesson(editorState.moduleIndex!, editorState.lessonIndex!, updates)}
        onBack={() => setEditorState({
          mode: 'lesson',
          moduleIndex: editorState.moduleIndex,
          lessonIndex: editorState.lessonIndex
        })}
      />
    );
  };

  const renderContent = () => {
    switch (editorState.mode) {
      case 'overview':
        return renderOverview();
      case 'module':
        return renderModuleEditor();
      case 'lesson':
        return renderLessonEditor();
      case 'content':
        return renderContentEditor();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-full">
      {renderContent()}
    </div>
  );
};