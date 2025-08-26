/**
 * Hook de validación para formularios React
 * Proporciona validación en tiempo real y manejo de errores
 */

import { useState, useCallback, useRef } from 'react';
import { 
  Validator, 
  ValidationResult, 
  FieldValidationRules,
  CourseValidator,
  CategoryValidator,
  UserValidator 
} from '../shared/validation';
import { logger } from '../shared/utils/logger';

export interface UseValidationOptions<T> {
  initialData: T;
  rules: Record<keyof T, FieldValidationRules>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseValidationReturn<T> {
  data: T;
  errors: Record<keyof T, string[]>;
  isValid: boolean;
  isValidating: boolean;
  setData: (data: T) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  clearErrors: (field?: keyof T) => void;
  resetForm: () => void;
  hasErrors: boolean;
}

/**
 * Hook principal de validación
 */
export function useValidation<T extends Record<string, any>>({
  initialData,
  rules,
  validateOnChange = false,
  validateOnBlur = true
}: UseValidationOptions<T>): UseValidationReturn<T> {
  
  const [data, setDataState] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<keyof T, string[]>>({} as Record<keyof T, string[]>);
  const [isValidating, setIsValidating] = useState(false);
  
  const initialDataRef = useRef(initialData);
  
  // Validar un campo específico
  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    const fieldRules = rules[field];
    if (!fieldRules) return true;
    
    const fieldValue = data[field];
    const fieldErrors = Validator.validateField(fieldValue, fieldRules, String(field));
    
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors
    }));
    
    const isFieldValid = fieldErrors.length === 0;
    
    logger.debug(`🔍 Field validation [${String(field)}]:`, {
      value: fieldValue,
      isValid: isFieldValid,
      errors: fieldErrors
    });
    
    return isFieldValid;
  }, [data, rules]);
  
  // Validar todos los campos
  const validateAll = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      const validationResult = Validator.validate(data, rules);
      setErrors(validationResult.fieldErrors as Record<keyof T, string[]>);
      
      logger.debug('🔍 Full form validation:', {
        isValid: validationResult.isValid,
        errorCount: validationResult.errors.length,
        fields: Object.keys(validationResult.fieldErrors)
      });
      
      return validationResult.isValid;
    } finally {
      setIsValidating(false);
    }
  }, [data, rules]);
  
  // Establecer datos completos
  const setData = useCallback((newData: T) => {
    setDataState(newData);
    
    if (validateOnChange) {
      // Validar después del siguiente render
      setTimeout(() => validateAll(), 0);
    }
  }, [validateOnChange, validateAll]);
  
  // Establecer valor de campo individual
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setDataState(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores del campo al cambiar
    if (errors[field] && errors[field].length > 0) {
      setErrors(prev => ({
        ...prev,
        [field]: []
      }));
    }
    
    if (validateOnChange) {
      // Validar campo después del siguiente render
      setTimeout(() => validateField(field), 0);
    }
  }, [validateOnChange, validateField, errors]);
  
  // Limpiar errores
  const clearErrors = useCallback((field?: keyof T) => {
    if (field) {
      setErrors(prev => ({
        ...prev,
        [field]: []
      }));
    } else {
      setErrors({} as Record<keyof T, string[]>);
    }
  }, []);
  
  // Resetear formulario
  const resetForm = useCallback(() => {
    setDataState(initialDataRef.current);
    setErrors({} as Record<keyof T, string[]>);
    setIsValidating(false);
  }, []);
  
  // Computar estado de validación
  const hasErrors = Object.values(errors).some(fieldErrors => fieldErrors.length > 0);
  const isValid = !hasErrors && !isValidating;
  
  return {
    data,
    errors,
    isValid,
    isValidating,
    hasErrors,
    setData,
    setFieldValue,
    validateField,
    validateAll,
    clearErrors,
    resetForm
  };
}

/**
 * Hook especializado para validación de cursos
 */
export function useCourseValidation(initialData: any) {
  return useValidation({
    initialData,
    rules: CourseValidator.createFormValidator(),
    validateOnBlur: true
  });
}

/**
 * Hook especializado para validación de categorías
 */
export function useCategoryValidation(initialData: any) {
  return useValidation({
    initialData,
    rules: CategoryValidator.createFormValidator(),
    validateOnBlur: true
  });
}

/**
 * Hook especializado para validación de usuarios
 */
export function useUserValidation(initialData: any) {
  return useValidation({
    initialData,
    rules: UserValidator.createFormValidator(),
    validateOnBlur: true
  });
}

/**
 * Hook para validación de archivos
 */
export function useFileValidation() {
  const [validating, setValidating] = useState(false);
  
  const validateFile = useCallback(async (
    file: File, 
    type: 'image' | 'video' | 'document' | 'audio'
  ) => {
    setValidating(true);
    
    try {
      if (type === 'image') {
        return await Validator.validateImageFile(file);
      } else {
        return Validator.validateFile(file, type);
      }
    } finally {
      setValidating(false);
    }
  }, []);
  
  return {
    validateFile,
    validating
  };
}