import React from 'react';
import { LessonData } from '../../pages/CreateCoursePage';
import { Card } from '../../../../shared/components/ui/Card/Card';
import { Button } from "@/shared/components/ui/Button/Button";

interface ContentEditorProps {
  lesson: LessonData;
  moduleIndex: number;
  lessonIndex: number;
  onUpdate: (updates: Partial<LessonData>) => void;
  onBack: () => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  lesson,
  moduleIndex,
  lessonIndex,
  onUpdate,
  onBack
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
          Volver a la Lección
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          Editor de Contenido - {lesson.title}
        </h2>
      </div>

      {/* Content Editor Placeholder */}
      <Card>
        <div className="p-6">
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🚧</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Editor de Contenido en Desarrollo
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              El editor visual completo para crear contenido interactivo estará disponible en futuras versiones. 
              Incluirá soporte para texto enriquecido, videos, imágenes, quizzes y elementos interactivos.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Próximas características:</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {[
                  '📝 Editor de texto rico',
                  '🎥 Integración de videos',
                  '🖼️ Galería de imágenes',
                  '❓ Creador de quizzes',
                  '💻 Bloques de código',
                  '🎮 Contenido interactivo'
                ].map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};