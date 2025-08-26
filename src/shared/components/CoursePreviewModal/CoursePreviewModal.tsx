import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Course } from '../../../domain/entities/Course';
import Modal from '../../../components/ui/Modal/Modal';
import { Button } from '../../../components/ui';
import { CourseCard } from '../CourseCard/CourseCard';
import { CourseDetail } from '../CourseDetail/CourseDetail';

interface CoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  title?: string;
}

export const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({
  isOpen,
  onClose,
  course,
  title = 'Vista Previa del Curso'
}) => {
  const [viewMode, setViewMode] = useState<'card' | 'detail'>('card');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Vista Card
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detail'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Vista Detallada
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {viewMode === 'card' ? (
            <div className="max-w-md mx-auto">
              <CourseCard
                course={course}
                onViewMore={() => setViewMode('detail')}
                showTeacher={true}
                className="shadow-lg"
              />
            </div>
          ) : (
            <CourseDetail course={course} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t">
          {viewMode === 'detail' && (
            <Button
              onClick={() => setViewMode('card')}
              variant="outline"
            >
              ← Volver a Card
            </Button>
          )}
          <div className={viewMode === 'card' ? 'ml-auto' : ''}>
            <Button
              onClick={onClose}
              variant="primary"
            >
              Cerrar Vista Previa
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CoursePreviewModal;