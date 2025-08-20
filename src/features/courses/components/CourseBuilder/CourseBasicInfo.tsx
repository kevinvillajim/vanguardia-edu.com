import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CourseData } from '../../pages/CreateCoursePage';
import { Card } from '../../../../shared/components/ui/Card/Card';
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from '../../../../shared/components/ui/Input/Input';

interface CourseBasicInfoProps {
  courseData: CourseData;
  onUpdate: (updates: Partial<CourseData>) => void;
  validationErrors: string[];
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Principiante', description: 'No requiere conocimientos previos' },
  { value: 'intermediate', label: 'Intermedio', description: 'Requiere conocimientos básicos' },
  { value: 'advanced', label: 'Avanzado', description: 'Requiere experiencia previa' }
] as const;

export const CourseBasicInfo: React.FC<CourseBasicInfoProps> = ({
  courseData,
  onUpdate,
  validationErrors
}) => {
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasError = (field: string) => {
    return validationErrors.some(error => error.toLowerCase().includes(field.toLowerCase()));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBannerPreview(result);
        onUpdate({ banner_image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addObjective = () => {
    onUpdate({
      learning_objectives: [...courseData.learning_objectives, '']
    });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = courseData.learning_objectives.map((obj, i) => 
      i === index ? value : obj
    );
    onUpdate({ learning_objectives: newObjectives });
  };

  const removeObjective = (index: number) => {
    const newObjectives = courseData.learning_objectives.filter((_, i) => i !== index);
    onUpdate({ learning_objectives: newObjectives });
  };

  const addPrerequisite = () => {
    onUpdate({
      prerequisites: [...courseData.prerequisites, '']
    });
  };

  const updatePrerequisite = (index: number, value: string) => {
    const newPrerequisites = courseData.prerequisites.map((req, i) => 
      i === index ? value : req
    );
    onUpdate({ prerequisites: newPrerequisites });
  };

  const removePrerequisite = (index: number) => {
    const newPrerequisites = courseData.prerequisites.filter((_, i) => i !== index);
    onUpdate({ prerequisites: newPrerequisites });
  };

  return (
    <div className="space-y-6">
      {/* Basic Course Information */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
          <p className="text-sm text-gray-600 mt-1">
            Completa los datos principales de tu curso
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Title */}
            <div className="lg:col-span-2">
              <Input
                label="Título del Curso"
                placeholder="Ej: Introducción a la Ciberseguridad"
                value={courseData.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                required
                error={hasError('título')}
                fullWidth
              />
              {hasError('título') && (
                <p className="text-sm text-red-600 mt-1">El título es obligatorio</p>
              )}
            </div>

            {/* Course Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Curso *
              </label>
              <textarea
                rows={4}
                placeholder="Describe qué aprenderán los estudiantes en este curso..."
                value={courseData.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none ${
                  hasError('descripción') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
              />
              {hasError('descripción') && (
                <p className="text-sm text-red-600 mt-1">La descripción es obligatoria</p>
              )}
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Dificultad
              </label>
              <div className="space-y-2">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                    <input
                      type="radio"
                      name="difficulty"
                      value={option.value}
                      checked={courseData.difficulty_level === option.value}
                      onChange={(e) => onUpdate({ difficulty_level: e.target.value as any })}
                      className="mt-1 text-[var(--color-primary)]"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio del Curso
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={courseData.is_free}
                    onChange={() => onUpdate({ is_free: true, price: 0 })}
                    className="text-[var(--color-primary)]"
                  />
                  <span className="text-sm text-gray-900">Gratis</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!courseData.is_free}
                    onChange={() => onUpdate({ is_free: false })}
                    className="text-[var(--color-primary)]"
                  />
                  <span className="text-sm text-gray-900">De pago</span>
                </label>
                
                {!courseData.is_free && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-6"
                  >
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="99.99"
                      value={courseData.price}
                      onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                      leftIcon={<span className="text-gray-500">$</span>}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Course Banner */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Imagen del Curso</h3>
          <p className="text-sm text-gray-600 mt-1">
            Agrega una imagen atractiva para tu curso (recomendado: 1200x675px)
          </p>
        </div>
        
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-200">
            {bannerPreview || courseData.banner_image ? (
              <div className="space-y-4">
                <img
                  src={bannerPreview || courseData.banner_image}
                  alt="Course banner preview"
                  className="max-w-full h-48 object-cover rounded-lg mx-auto"
                />
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar Imagen
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBannerPreview(null);
                      onUpdate({ banner_image: undefined });
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl">🖼️</div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Agregar imagen del curso
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Formatos soportados: JPG, PNG, GIF (máx. 5MB)
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar Imagen
                  </Button>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Objetivos de Aprendizaje</h3>
          <p className="text-sm text-gray-600 mt-1">
            Define qué conocimientos y habilidades obtendrán los estudiantes
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          {courseData.learning_objectives.map((objective, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-mono w-6">{index + 1}.</span>
              <Input
                placeholder="Ej: Comprender los fundamentos de la ciberseguridad"
                value={objective}
                onChange={(e) => updateObjective(index, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeObjective(index)}
                className="text-red-600 hover:text-red-700"
              >
                🗑️
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={addObjective}
            leftIcon={<span>+</span>}
          >
            Agregar Objetivo
          </Button>
        </div>
      </Card>

      {/* Prerequisites */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Requisitos Previos</h3>
          <p className="text-sm text-gray-600 mt-1">
            Especifica qué conocimientos necesitan los estudiantes antes de tomar el curso
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          {courseData.prerequisites.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No hay requisitos previos definidos</p>
              <Button
                variant="outline"
                size="sm"
                onClick={addPrerequisite}
              >
                Agregar Primer Requisito
              </Button>
            </div>
          ) : (
            <>
              {courseData.prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-mono w-6">{index + 1}.</span>
                  <Input
                    placeholder="Ej: Conocimientos básicos de informática"
                    value={prerequisite}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrerequisite(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    🗑️
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={addPrerequisite}
                leftIcon={<span>+</span>}
              >
                Agregar Requisito
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};