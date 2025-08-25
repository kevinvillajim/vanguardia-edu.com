import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  X, 
  Eye, 
  Globe, 
  Lock,
  Users,
  Calendar,
  DollarSign,
  Clock,
  BookOpen
} from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import { courseService } from '../../../../services/courseService';

interface CoursePublisherProps {
  courseId: number;
  courseData: {
    title: string;
    description: string;
    price: number;
    durationHours: number;
    modules: any[];
    isPublished?: boolean;
  };
  onClose: () => void;
  onPublishSuccess: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

export const CoursePublisher: React.FC<CoursePublisherProps> = ({
  courseId,
  courseData,
  onClose,
  onPublishSuccess
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [step, setStep] = useState<'validation' | 'confirm' | 'success'>('validation');

  // Validar curso antes de publicar
  const validateCourse = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validaciones básicas
    if (!courseData.title || courseData.title.length < 5) {
      errors.push({
        field: 'title',
        message: 'El título debe tener al menos 5 caracteres'
      });
    }

    if (!courseData.description || courseData.description.length < 20) {
      errors.push({
        field: 'description',
        message: 'La descripción debe tener al menos 20 caracteres'
      });
    }

    if (!courseData.price || courseData.price < 0) {
      errors.push({
        field: 'price',
        message: 'El precio debe ser válido'
      });
    }

    if (!courseData.durationHours || courseData.durationHours <= 0) {
      errors.push({
        field: 'duration',
        message: 'La duración debe ser mayor a 0'
      });
    }

    // Validar contenido
    if (!courseData.modules || courseData.modules.length === 0) {
      errors.push({
        field: 'modules',
        message: 'El curso debe tener al menos un módulo'
      });
    } else {
      // Verificar que cada módulo tenga contenido
      const modulesWithoutContent = courseData.modules.filter(
        module => !module.components || module.components.length === 0
      );
      
      if (modulesWithoutContent.length > 0) {
        errors.push({
          field: 'content',
          message: `${modulesWithoutContent.length} módulo(s) no tienen contenido`
        });
      }
    }

    return errors;
  };

  const handleValidation = () => {
    const errors = validateCourse();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setStep('confirm');
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      const result = await courseService.publishCourse(courseId);
      
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onPublishSuccess();
        }, 2000);
      } else {
        setPublishError(result.error || 'Error al publicar el curso');
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      setPublishError('Error inesperado al publicar el curso');
    } finally {
      setIsPublishing(false);
    }
  };

  const getModuleStats = () => {
    const totalComponents = courseData.modules.reduce((acc, module) => {
      return acc + (module.components?.length || 0);
    }, 0);

    const videoCount = courseData.modules.reduce((acc, module) => {
      return acc + (module.components?.filter((c: any) => c.type === 'video').length || 0);
    }, 0);

    const quizCount = courseData.modules.reduce((acc, module) => {
      return acc + (module.components?.filter((c: any) => c.type === 'quiz').length || 0);
    }, 0);

    return { totalComponents, videoCount, quizCount };
  };

  const renderValidationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Validación del Curso</h3>
        
        {validationErrors.length > 0 ? (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 mb-2">
                    Se encontraron problemas que debes corregir:
                  </p>
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">
                        • {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <Button
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              Volver a editar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-900">
                  ¡Tu curso cumple con todos los requisitos!
                </p>
              </div>
            </div>

            {/* Resumen del curso */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900 mb-3">Resumen del Curso</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Módulos:</span>
                  <span className="font-medium">{courseData.modules.length}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">{courseData.durationHours}h</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-medium">${courseData.price}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Componentes:</span>
                  <span className="font-medium">{getModuleStats().totalComponents}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <Button
          variant="ghost"
          onClick={onClose}
          fullWidth
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleValidation}
          fullWidth
          disabled={validationErrors.length > 0}
        >
          {validationErrors.length > 0 ? 'Corregir errores' : 'Continuar'}
        </Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Confirmar Publicación</h3>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900 mb-2">
                Antes de publicar, ten en cuenta:
              </p>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• El curso será visible para todos los estudiantes</li>
                <li>• Los estudiantes podrán inscribirse inmediatamente</li>
                <li>• Podrás seguir editando el contenido después de publicar</li>
                <li>• Las inscripciones activas verán las actualizaciones</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-primary-600" />
            <div className="flex-1">
              <p className="font-medium text-primary-900">
                {courseData.title}
              </p>
              <p className="text-sm text-primary-700 mt-1">
                Este curso será publicado y estará disponible para inscripciones
              </p>
            </div>
          </div>
        </div>
      </div>

      {publishError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{publishError}</p>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          variant="ghost"
          onClick={() => setStep('validation')}
          disabled={isPublishing}
          fullWidth
        >
          Atrás
        </Button>
        <Button
          variant="primary"
          onClick={handlePublish}
          disabled={isPublishing}
          loading={isPublishing}
          fullWidth
        >
          {isPublishing ? 'Publicando...' : 'Publicar Curso'}
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">¡Curso Publicado!</h3>
      <p className="text-gray-600 mb-6">
        Tu curso ha sido publicado exitosamente y ya está disponible para los estudiantes.
      </p>
      <div className="flex space-x-3">
        <Button
          variant="secondary"
          onClick={onClose}
          fullWidth
        >
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={() => window.open(`/courses/${courseId}`, '_blank')}
          fullWidth
          leftIcon={<Eye className="w-4 h-4" />}
        >
          Ver Curso
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {courseData.isPublished ? 'Actualizar Curso' : 'Publicar Curso'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          {step === 'validation' && renderValidationStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};