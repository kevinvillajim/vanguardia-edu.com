import React from 'react';
import { LessonData } from '../../pages/CreateCoursePage';
import { Card } from '../../../../shared/components/ui/Card/Card';
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from '../../../../shared/components/ui/Input/Input';

interface LessonEditorProps {
  lesson: LessonData;
  moduleIndex: number;
  lessonIndex: number;
  onUpdate: (updates: Partial<LessonData>) => void;
  onBack: () => void;
  onEditContent: (contentIndex: number) => void;
}

const LESSON_TYPES = [
  { value: 'text', label: 'Texto', icon: '📝' },
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'quiz', label: 'Quiz', icon: '❓' },
  { value: 'interactive', label: 'Interactivo', icon: '🎮' }
] as const;

export const LessonEditor: React.FC<LessonEditorProps> = ({
  lesson,
  moduleIndex,
  lessonIndex,
  onUpdate,
  onBack,
  onEditContent
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
          Volver al Módulo
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          Editando Lección {lessonIndex + 1}
        </h2>
      </div>

      {/* Lesson Basic Info */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Información de la Lección</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <Input
            label="Título de la Lección"
            placeholder="Ej: Conceptos básicos de criptografía"
            value={lesson.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            required
            fullWidth
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de la Lección
            </label>
            <textarea
              rows={3}
              placeholder="Describe brevemente qué aprenderán en esta lección..."
              value={lesson.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lesson Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Lección
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LESSON_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      lesson.type === type.value
                        ? 'border-[var(--color-primary)] bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lessonType"
                      value={type.value}
                      checked={lesson.type === type.value}
                      onChange={(e) => onUpdate({ type: e.target.value as any })}
                      className="sr-only"
                    />
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <Input
                label="Duración (minutos)"
                type="number"
                min="1"
                max="180"
                value={lesson.duration_minutes}
                onChange={(e) => onUpdate({ duration_minutes: parseInt(e.target.value) || 10 })}
                required
              />
            </div>
          </div>

          {/* Preview Option */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={lesson.is_preview}
                onChange={(e) => onUpdate({ is_preview: e.target.checked })}
                className="text-[var(--color-primary)]"
              />
              <div>
                <p className="font-medium text-gray-900">Lección de vista previa</p>
                <p className="text-sm text-gray-600">
                  Los estudiantes podrán ver esta lección antes de inscribirse al curso
                </p>
              </div>
            </label>
          </div>
        </div>
      </Card>

      {/* Content Placeholder */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Contenido de la Lección</h3>
          <p className="text-sm text-gray-600 mt-1">
            Agrega texto, videos, imágenes y otros elementos
          </p>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Editor de contenido próximamente
            </h4>
            <p className="text-gray-600 mb-4">
              El editor visual de contenido estará disponible en la siguiente versión
            </p>
            <Button variant="outline" disabled>
              Agregar Contenido
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};