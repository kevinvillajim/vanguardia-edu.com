/**
 * 🎛️ CONFIGURACIONES CENTRALIZADAS - VanguardIA
 * 
 * Este archivo centraliza TODAS las configuraciones de la aplicación.
 * 
 * 📋 ÍNDICE DE CONFIGURACIONES:
 * 
 * 1. 🔄 ACTIVIDAD Y TOKENS
 *    - Detección de actividad del usuario
 *    - Renovación automática de tokens
 *    - Configuración por roles de usuario
 * 
 * 2. 🌐 API Y COMUNICACIÓN
 *    - URLs de endpoints
 *    - Timeouts y reintentos
 *    - Configuración de uploads
 * 
 * 3. 🎨 INTERFAZ DE USUARIO
 *    - Temas y colores
 *    - Animaciones y transiciones
 *    - Layout y responsive
 * 
 * 4. 📚 SISTEMA DE CURSOS
 *    - Estructura de cursos
 *    - Componentes disponibles
 *    - Validaciones y límites
 * 
 * 💡 CÓMO USAR:
 * 
 * // Importar configuración específica
 * import { ACTIVITY_CONFIG, API_CONFIG } from '@/config';
 * 
 * // Importar configuración por categoría
 * import { getActivityConfigForRole } from '@/config/activity.config';
 * 
 * // Importar todo (solo si necesitas múltiples configuraciones)
 * import * as Config from '@/config';
 */

// =============================================================================
// IMPORTACIONES INTERNAS
// =============================================================================
import { 
  DEFAULT_ACTIVITY_CONFIG,
  ACTIVITY_PRESETS,
  getActivityConfigForRole,
  formatTime,
  validateActivityConfig,
  type ActivityConfig,
} from './activity.config';

import {
  DEFAULT_API_CONFIG,
  API_PRESETS,
  UPLOAD_CONFIGS,
  getApiConfig,
  isFileTypeAllowed,
  isFileSizeAllowed,
  formatFileSize,
  type ApiConfig,
} from './api.config';

import {
  DEFAULT_UI_CONFIG,
  UI_THEMES,
  ANIMATION_PRESETS,
  LAYOUT_PRESETS,
  getUiConfig,
  generateBreakpointClasses,
  shouldShowAnimations,
  getComponentConfig as getUiComponentConfigInternal,
  type UiConfig,
} from './ui.config';

import {
  DEFAULT_COURSE_CONFIG,
  COURSE_PRESETS,
  getCourseConfig,
  validateCourseStructure,
  getComponentConfig as getCourseComponentConfigInternal,
  isComponentMandatoryByDefault,
  getComponentLimits,
  getDefaultQuizConfig,
  getMediaCompletionPercentage,
  getMediaConfig,
  type CourseConfig,
} from './course.config';

// =============================================================================
// 🔄 ACTIVIDAD Y TOKENS
// =============================================================================
export {
  // Configuraciones principales
  DEFAULT_ACTIVITY_CONFIG as ACTIVITY_CONFIG,
  ACTIVITY_PRESETS,
  
  // Funciones útiles
  getActivityConfigForRole,
  formatTime as formatActivityTime,
  validateActivityConfig,
  
  // Tipos
  type ActivityConfig,
} from './activity.config';

// =============================================================================
// 🌐 API Y COMUNICACIÓN  
// =============================================================================
export {
  // Configuraciones principales
  DEFAULT_API_CONFIG as API_CONFIG,
  API_PRESETS,
  UPLOAD_CONFIGS,
  
  // Funciones útiles
  getApiConfig,
  isFileTypeAllowed,
  isFileSizeAllowed,
  formatFileSize,
  
  // Tipos
  type ApiConfig,
} from './api.config';

// =============================================================================
// 🎨 INTERFAZ DE USUARIO
// =============================================================================
export {
  // Configuraciones principales
  DEFAULT_UI_CONFIG as UI_CONFIG,
  UI_THEMES,
  ANIMATION_PRESETS,
  LAYOUT_PRESETS,
  
  // Funciones útiles
  getUiConfig,
  generateBreakpointClasses,
  shouldShowAnimations,
  getComponentConfig as getUiComponentConfig,
  
  // Tipos
  type UiConfig,
} from './ui.config';

// =============================================================================
// 📚 SISTEMA DE CURSOS
// =============================================================================
export {
  // Configuraciones principales
  DEFAULT_COURSE_CONFIG as COURSE_CONFIG,
  COURSE_PRESETS,
  
  // Funciones útiles
  getCourseConfig,
  validateCourseStructure,
  getComponentConfig as getCourseComponentConfig,
  isComponentMandatoryByDefault,
  getComponentLimits,
  getDefaultQuizConfig,
  getMediaCompletionPercentage,
  getMediaConfig,
  
  // Tipos
  type CourseConfig,
} from './course.config';

// =============================================================================
// 🎯 CONFIGURACIÓN UNIFICADA
// =============================================================================

/**
 * Configuración global de la aplicación
 * Combina todas las configuraciones en un solo objeto
 */
export const APP_CONFIG = {
  activity: DEFAULT_ACTIVITY_CONFIG,
  api: DEFAULT_API_CONFIG, 
  ui: DEFAULT_UI_CONFIG,
  course: DEFAULT_COURSE_CONFIG,
} as const;

/**
 * Obtener configuración completa según el entorno
 */
export function getAppConfig(environment?: 'development' | 'production' | 'testing') {
  const env = environment || import.meta.env.MODE || 'development';
  
  return {
    activity: getActivityConfigForRole(), // Usar configuración por defecto
    api: getApiConfig(env),
    ui: getUiConfig(), // Usar configuración por defecto
    course: getCourseConfig(), // Usar configuración por defecto
    environment: env,
  };
}

/**
 * Configuraciones rápidas para diferentes tipos de usuario
 */
export const USER_CONFIGS = {
  // Configuración para profesores
  teacher: {
    activity: getActivityConfigForRole('teacher'),
    ui: getUiConfig('EDUCATIONAL'),
    course: getCourseConfig('ACADEMIC'),
  },
  
  // Configuración para estudiantes
  student: {
    activity: getActivityConfigForRole('student'),
    ui: getUiConfig('LIGHT'),
    course: getCourseConfig('BASIC'),
  },
  
  // Configuración para administradores
  admin: {
    activity: getActivityConfigForRole('admin'),
    ui: getUiConfig('DARK', 'FAST', 'SPACIOUS'),
    course: getCourseConfig('ACADEMIC'),
  },
} as const;

/**
 * Obtener configuración específica para un usuario
 */
export function getUserConfig(userRole: 'teacher' | 'student' | 'admin') {
  return USER_CONFIGS[userRole] || USER_CONFIGS.student;
}

// =============================================================================
// 🔧 UTILIDADES DE CONFIGURACIÓN
// =============================================================================

/**
 * Validar todas las configuraciones
 */
export function validateAllConfigs(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Validar configuración de actividad
    const activityErrors = validateActivityConfig(DEFAULT_ACTIVITY_CONFIG);
    errors.push(...activityErrors);
    
    // Validar configuración de UI (verificar breakpoints)
    const { breakpoints } = DEFAULT_UI_CONFIG;
    const bpValues = Object.values(breakpoints);
    for (let i = 1; i < bpValues.length; i++) {
      if (bpValues[i] <= bpValues[i - 1]) {
        errors.push('Los breakpoints deben estar en orden ascendente');
        break;
      }
    }
    
    // Validar configuración de curso (verificar límites)
    if (DEFAULT_COURSE_CONFIG.structure.maxComponentsPerModule < 1) {
      errors.push('Debe permitir al menos 1 componente por módulo');
    }
    
  } catch (error) {
    errors.push(`Error validando configuraciones: ${error.message}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Información del sistema de configuración
 */
export const CONFIG_INFO = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  totalConfigs: 4,
  features: [
    'Configuración por roles de usuario',
    'Validación automática',
    'Presets predefinidos',  
    'Variables de entorno',
    'Configuración unificada'
  ]
};

/**
 * Debug: Log de todas las configuraciones actuales
 */
export function debugConfigs() {
  if (import.meta.env.MODE === 'development') {
    console.group('🎛️ VanguardIA - Configuraciones Actuales');
    
    console.log('📊 Información del sistema:', CONFIG_INFO);
    console.log('🔄 Actividad:', DEFAULT_ACTIVITY_CONFIG);
    console.log('🌐 API:', DEFAULT_API_CONFIG);
    console.log('🎨 UI:', DEFAULT_UI_CONFIG);
    console.log('📚 Cursos:', DEFAULT_COURSE_CONFIG);
    
    const validation = validateAllConfigs();
    console.log('✅ Validación:', validation);
    
    console.groupEnd();
  }
}

// =============================================================================
// 📝 TIPOS EXPORTADOS
// =============================================================================

export type {
  ActivityConfig,
  ApiConfig,
  UiConfig,
  CourseConfig,
};

// Tipo para la configuración completa de la aplicación
export type AppConfigType = typeof APP_CONFIG;

// Tipo para configuraciones de usuario
export type UserConfigType = typeof USER_CONFIGS[keyof typeof USER_CONFIGS];

// =============================================================================
// 🚀 EXPORT POR DEFECTO (para importación completa)
// =============================================================================

export default {
  ...APP_CONFIG,
  getAppConfig,
  getUserConfig,
  validateAllConfigs,
  debugConfigs,
  CONFIG_INFO,
};