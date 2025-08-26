/**
 * Exportaciones centralizadas del sistema de validación
 */

import { Validator } from './Validator';
import { ValidationRules } from './ValidationRules';

export { ValidationRules, FileValidationRules } from './ValidationRules';
export type { ValidationRule, FieldValidationRules } from './ValidationRules';

export { Validator, useFieldValidation, useFormValidation } from './Validator';
export type { ValidationResult, FileValidationResult } from './Validator';

// Validadores preconfigurados para entidades principales
export const CourseValidator = {
  validate: (data: any) => Validator.validateCourse(data),
  validateCreation: (data: any) => Validator.validateCourseCreation(data),
  createFormValidator: () => Validator.createFormValidator(ValidationRules.course)
};

export const CategoryValidator = {
  validate: (data: any) => Validator.validateCategory(data),
  createFormValidator: () => Validator.createFormValidator(ValidationRules.category)
};

export const UserValidator = {
  validate: (data: any) => Validator.validateUser(data),
  createFormValidator: () => Validator.createFormValidator(ValidationRules.user)
};