/**
 * Sistema de validación centralizado
 * Ejecutor de validaciones que puede ser usado en toda la aplicación
 */

import { ValidationRules, FieldValidationRules, FileValidationRules } from './ValidationRules';
import { logger } from '../utils/logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string[]>;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Clase principal del validador
 */
export class Validator {
  /**
   * Validar un objeto completo contra sus reglas
   */
  static validate<T extends Record<string, any>>(
    data: T,
    rules: Record<keyof T, FieldValidationRules>
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      fieldErrors: {}
    };

    for (const [fieldName, fieldRules] of Object.entries(rules) as [keyof T, FieldValidationRules][]) {
      const fieldValue = data[fieldName];
      const fieldErrors = this.validateField(fieldValue, fieldRules, String(fieldName));
      
      if (fieldErrors.length > 0) {
        result.isValid = false;
        result.errors.push(...fieldErrors);
        result.fieldErrors[String(fieldName)] = fieldErrors;
      }
    }

    logger.debug('🔍 Validation result:', { 
      isValid: result.isValid, 
      errorCount: result.errors.length,
      fields: Object.keys(result.fieldErrors)
    });

    return result;
  }

  /**
   * Validar un campo individual
   */
  static validateField(
    value: any,
    rules: FieldValidationRules,
    fieldName: string
  ): string[] {
    const errors: string[] = [];

    // Validación requerida
    if (rules.required && !rules.required.validate(value)) {
      errors.push(rules.required.message);
      // Si es requerido y falla, no continuar con otras validaciones
      return errors;
    }

    // Si el valor está vacío/null/undefined y no es requerido, no validar más
    if (value === null || value === undefined || value === '') {
      return errors;
    }

    // Validación de longitud mínima
    if (rules.minLength && !rules.minLength.validate(value)) {
      errors.push(rules.minLength.message);
    }

    // Validación de longitud máxima
    if (rules.maxLength && !rules.maxLength.validate(value)) {
      errors.push(rules.maxLength.message);
    }

    // Validación de patrón
    if (rules.pattern && !rules.pattern.validate(value)) {
      errors.push(rules.pattern.message);
    }

    // Validaciones personalizadas
    if (rules.custom) {
      for (const customRule of rules.custom) {
        if (!customRule.validate(value)) {
          errors.push(customRule.message);
        }
      }
    }

    return errors;
  }

  /**
   * Validación específica para cursos
   */
  static validateCourse(courseData: any): ValidationResult {
    return this.validate(courseData, ValidationRules.course);
  }

  /**
   * Validación para creación inicial de curso (sin objetivos obligatorios)
   */
  static validateCourseCreation(courseData: any): ValidationResult {
    // Crear reglas sin learningObjectives requeridos
    const creationRules = {
      title: ValidationRules.course.title,
      description: ValidationRules.course.description,
      duration_hours: ValidationRules.course.duration_hours,
      difficulty_level: ValidationRules.course.difficulty_level,
      // learningObjectives y prerequisites son opcionales en la creación
      learningObjectives: ValidationRules.course.learningObjectives,
      prerequisites: ValidationRules.course.prerequisites
    };

    return this.validate(courseData, creationRules);
  }

  /**
   * Validación específica para categorías
   */
  static validateCategory(categoryData: any): ValidationResult {
    return this.validate(categoryData, ValidationRules.category);
  }

  /**
   * Validación específica para usuarios
   */
  static validateUser(userData: any): ValidationResult {
    return this.validate(userData, ValidationRules.user);
  }

  /**
   * Validación de archivos
   */
  static validateFile(file: File, type: 'image' | 'video' | 'document' | 'audio'): FileValidationResult {
    const rules = FileValidationRules[type];
    
    // Validar tamaño
    if (file.size > rules.maxSize) {
      return {
        isValid: false,
        error: `El archivo es muy grande. Máximo permitido: ${this.formatFileSize(rules.maxSize)}`
      };
    }

    // Validar tipo MIME
    if (!rules.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido. Tipos válidos: ${rules.allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validación de imagen con dimensiones
   */
  static async validateImageFile(file: File): Promise<FileValidationResult> {
    const basicValidation = this.validateFile(file, 'image');
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const rules = FileValidationRules.image;
        if (img.width > rules.maxWidth || img.height > rules.maxHeight) {
          resolve({
            isValid: false,
            error: `Las dimensiones son muy grandes. Máximo: ${rules.maxWidth}x${rules.maxHeight}px`
          });
        } else {
          resolve({ isValid: true });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          isValid: false,
          error: 'Error al procesar la imagen'
        });
      };

      img.src = url;
    });
  }

  /**
   * Validaciones en tiempo real para formularios
   */
  static createFieldValidator(fieldName: string, rules: FieldValidationRules) {
    return (value: any): string[] => {
      return this.validateField(value, rules, fieldName);
    };
  }

  /**
   * Crear validador completo para un formulario
   */
  static createFormValidator<T extends Record<string, any>>(
    rules: Record<keyof T, FieldValidationRules>
  ) {
    return (data: T): ValidationResult => {
      return this.validate(data, rules);
    };
  }

  /**
   * Utilidad para formatear tamaños de archivo
   */
  private static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Hooks para React
 */
export const useFieldValidation = (fieldName: string, rules: FieldValidationRules) => {
  const validate = (value: any): string[] => {
    return Validator.validateField(value, rules, fieldName);
  };

  return { validate };
};

export const useFormValidation = <T extends Record<string, any>>(
  rules: Record<keyof T, FieldValidationRules>
) => {
  const validate = (data: T): ValidationResult => {
    return Validator.validate(data, rules);
  };

  return { validate };
};