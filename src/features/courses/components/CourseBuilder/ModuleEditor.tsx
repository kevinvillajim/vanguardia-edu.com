import React from 'react';
import { motion } from 'framer-motion';
import { ModuleData } from '../../pages/CreateCoursePage';
import { Card } from '../../../../shared/components/ui/Card/Card';
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from '../../../../shared/components/ui/Input/Input';

interface ModuleEditorProps {
  module: ModuleData;
  moduleIndex: number;
  onUpdate: (updates: Partial<ModuleData>) => void;
  onBack: () => void;
  onAddLesson: () => void;
  onEditLesson: (lessonIndex: number) => void;
  onDeleteLesson: (lessonIndex: number) => void;
}

export const ModuleEditor: React.FC<ModuleEditorProps> = ({
  module,
  moduleIndex,
  onUpdate,
  onBack,
  onAddLesson,
  onEditLesson,
  onDeleteLesson
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          Volver
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          Editando Módulo {moduleIndex + 1}
        </h2>
      </div>

      {/* Module Basic Info */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Información del Módulo</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <Input
            label="Título del Módulo"
            placeholder="Ej: Introducción a la Ciberseguridad"
            value={module.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            required
            fullWidth
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Módulo
            </label>
            <textarea
              rows={3}
              placeholder="Describe qué aprenderán los estudiantes en este módulo..."
              value={module.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Lessons */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lecciones</h3>
              <p className="text-sm text-gray-600 mt-1">
                Organiza el contenido de aprendizaje en lecciones
              </p>
            </div>
            <Button onClick={onAddLesson} variant="primary" size="sm">
              + Agregar Lección
            </Button>
          </div>
        </div>

        <div className="p-6">
          {module.lessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No hay lecciones aún
              </h4>
              <p className="text-gray-600 mb-4">
                Comienza agregando la primera lección de este módulo
              </p>
              <Button onClick={onAddLesson} variant="primary">
                Crear Primera Lección
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {module.lessons.map((lesson, lessonIndex) => (
                <motion.div
                  key={lessonIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 font-mono w-8">
                      {lessonIndex + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {lesson.title || `Lección ${lessonIndex + 1}`}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="capitalize">{lesson.type}</span>
                        <span>•</span>
                        <span>{lesson.duration_minutes} min</span>
                        {lesson.is_preview && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">Vista previa</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{lesson.content.length} elementos de contenido</span>
                      </div>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditLesson(lessonIndex)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteLesson(lessonIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={onAddLesson}
                  leftIcon={<span>+</span>}
                >
                  Agregar Otra Lección
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};