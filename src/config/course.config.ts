/**
 * Configuración del Sistema de Cursos y Educación
 * 
 * Centraliza toda la configuración relacionada con:
 * - Tipos de componentes de curso
 * - Validaciones de contenido
 * - Límites y restricciones
 * - Configuración de quiz y evaluaciones
 * - Metadatos de cursos
 */

export interface CourseConfig {
  // Estructura de cursos
  structure: {
    maxUnitsPerCourse: number;
    maxModulesPerUnit: number;
    maxComponentsPerModule: number;
    maxActivitiesPerCourse: number;
  };
  
  // Componentes disponibles
  components: {
    [key: string]: {
      name: string;
      icon: string;
      description: string;
      maxPerModule?: number;
      required?: boolean;
      validation?: {
        minLength?: number;
        maxLength?: number;
        required?: string[];
      };
    };
  };
  
  // Configuración de quiz
  quiz: {
    minQuestions: number;
    maxQuestions: number;
    defaultTimeLimit: number; // minutos
    defaultAttempts: number;
    passingScore: number; // porcentaje
    questionTypes: string[];
  };
  
  // Configuración de progreso
  progress: {
    completionThreshold: number; // porcentaje para marcar como completado
    trackingEnabled: boolean;
    mandatoryComponents: string[]; // tipos que son obligatorios por defecto
    media: {
      video: {
        minCompletionPercentage: number; // porcentaje mínimo para videos (0-100)
      };
      audio: {
        minCompletionPercentage: number; // porcentaje mínimo para audio (0-100)
      };
    };
  };
  
  // Validaciones de contenido
  validation: {
    title: {
      minLength: number;
      maxLength: number;
    };
    description: {
      minLength: number;
      maxLength: number;
    };
    content: {
      minLength: number;
      maxLength: number;
    };
  };
  
  // Metadatos
  metadata: {
    difficulties: string[];
    categories: string[];
    tags: string[];
    languages: string[];
  };
}

/**
 * Configuración por defecto del sistema de cursos
 */
export const DEFAULT_COURSE_CONFIG: CourseConfig = {
  // 🏗️ ESTRUCTURA DE CURSOS
  structure: {
    maxUnitsPerCourse: 20,      // Máximo 20 unidades por curso
    maxModulesPerUnit: 10,      // Máximo 10 módulos por unidad
    maxComponentsPerModule: 15, // Máximo 15 componentes por módulo
    maxActivitiesPerCourse: 50, // Máximo 50 actividades por curso
  },
  
  // 🧩 COMPONENTES DISPONIBLES
  components: {
    banner: {
      name: 'Banner',
      icon: '🖼️',
      description: 'Imagen de cabecera para el módulo',
      maxPerModule: 1, // Solo un banner por módulo
      validation: {
        required: ['title', 'img']
      }
    },
    
    video: {
      name: 'Video',
      icon: '🎥', 
      description: 'Contenido de video educativo',
      validation: {
        required: ['title', 'src'],
        minLength: 5, // mínimo 5 segundos
      }
    },
    
    reading: {
      name: 'Lectura',
      icon: '📖',
      description: 'Contenido de texto enriquecido',
      validation: {
        required: ['title', 'text'],
        minLength: 100, // mínimo 100 caracteres
        maxLength: 10000, // máximo 10000 caracteres
      }
    },
    
    image: {
      name: 'Imagen',
      icon: '🖼️',
      description: 'Imagen ilustrativa con descripción',
      validation: {
        required: ['title', 'img']
      }
    },
    
    document: {
      name: 'Documento',
      icon: '📄',
      description: 'Archivo descargable (PDF, Word, etc.)',
      validation: {
        required: ['title', 'file_url']
      }
    },
    
    audio: {
      name: 'Audio',
      icon: '🎵',
      description: 'Contenido de audio o podcast',
      validation: {
        required: ['title', 'src']
      }
    },
    
    quiz: {
      name: 'Quiz',
      icon: '❓',
      description: 'Evaluación con preguntas y respuestas',
      maxPerModule: 5, // Máximo 5 quizzes por módulo
      validation: {
        required: ['title', 'questions'],
        minLength: 1, // mínimo 1 pregunta
      }
    },
    
    interactive: {
      name: 'Interactivo',
      icon: '🎯',
      description: 'Contenido interactivo o simulación',
      validation: {
        required: ['title', 'type', 'data']
      }
    }
  },
  
  // ❓ CONFIGURACIÓN DE QUIZ
  quiz: {
    minQuestions: 1,        // Mínimo 1 pregunta por quiz
    maxQuestions: 50,       // Máximo 50 preguntas por quiz
    defaultTimeLimit: 30,   // 30 minutos por defecto
    defaultAttempts: 3,     // 3 intentos por defecto
    passingScore: 70,       // 70% para aprobar
    questionTypes: [
      'multiple-choice',    // Opción múltiple
      'true-false',         // Verdadero/Falso
      'fill-blank',         // Completar espacios
      'match',              // Emparejar
      'order',              // Ordenar
      'short-answer'        // Respuesta corta
    ]
  },
  
  // 📊 CONFIGURACIÓN DE PROGRESO
  progress: {
    completionThreshold: 80,      // 80% para marcar como completado
    trackingEnabled: true,        // Habilitar seguimiento de progreso
    mandatoryComponents: [        // Componentes obligatorios por defecto
      'video',
      'audio', 
      'document',
      'quiz'
    ],
    media: {
      video: {
        minCompletionPercentage: Number(import.meta.env.VITE_VIDEO_MIN_COMPLETION_PERCENTAGE) || 95
      },
      audio: {
        minCompletionPercentage: Number(import.meta.env.VITE_AUDIO_MIN_COMPLETION_PERCENTAGE) || 95
      }
    }
  },
  
  // ✅ VALIDACIONES DE CONTENIDO
  validation: {
    title: {
      minLength: 3,     // Mínimo 3 caracteres
      maxLength: 100,   // Máximo 100 caracteres
    },
    description: {
      minLength: 10,    // Mínimo 10 caracteres
      maxLength: 500,   // Máximo 500 caracteres
    },
    content: {
      minLength: 1,     // Mínimo 1 caracter
      maxLength: 50000, // Máximo 50000 caracteres
    }
  },
  
  // 📋 METADATOS
  metadata: {
    difficulties: [
      'principiante',
      'intermedio', 
      'avanzado',
      'experto'
    ],
    categories: [
      'programacion',
      'diseño',
      'marketing',
      'negocios',
      'idiomas',
      'ciencias',
      'arte',
      'musica',
      'deportes',
      'cocina'
    ],
    tags: [
      'basico',
      'practico',
      'teorico',
      'proyecto',
      'certificado',
      'gratuito',
      'premium'
    ],
    languages: [
      'español',
      'ingles',
      'frances',
      'portugues',
      'italiano',
      'aleman'
    ]
  }
};

/**
 * Presets para diferentes tipos de cursos
 */
export const COURSE_PRESETS = {
  // Curso básico - estructura simple
  BASIC: {
    ...DEFAULT_COURSE_CONFIG,
    structure: {
      maxUnitsPerCourse: 5,
      maxModulesPerUnit: 5,
      maxComponentsPerModule: 8,
      maxActivitiesPerCourse: 10,
    }
  },
  
  // Curso académico - estructura compleja
  ACADEMIC: {
    ...DEFAULT_COURSE_CONFIG,
    structure: {
      maxUnitsPerCourse: 15,
      maxModulesPerUnit: 12,
      maxComponentsPerModule: 20,
      maxActivitiesPerCourse: 100,
    },
    quiz: {
      ...DEFAULT_COURSE_CONFIG.quiz,
      passingScore: 75, // Mayor exigencia académica
      defaultAttempts: 2, // Menos intentos
    }
  },
  
  // Curso práctico - enfoque en actividades
  PRACTICAL: {
    ...DEFAULT_COURSE_CONFIG,
    structure: {
      maxUnitsPerCourse: 10,
      maxModulesPerUnit: 8,
      maxComponentsPerModule: 12,
      maxActivitiesPerCourse: 80, // Más actividades prácticas
    },
    progress: {
      ...DEFAULT_COURSE_CONFIG.progress,
      completionThreshold: 85, // Mayor exigencia de completitud
      media: {
        video: {
          minCompletionPercentage: 98 // Mayor exigencia para cursos prácticos
        },
        audio: {
          minCompletionPercentage: 98 // Mayor exigencia para cursos prácticos
        }
      }
    }
  }
};

/**
 * Obtener configuración específica para un tipo de curso
 */
export function getCourseConfig(preset?: keyof typeof COURSE_PRESETS): CourseConfig {
  if (preset && COURSE_PRESETS[preset]) {
    return COURSE_PRESETS[preset];
  }
  return DEFAULT_COURSE_CONFIG;
}

/**
 * Validar estructura de curso
 */
export function validateCourseStructure(
  courseData: any, 
  config: CourseConfig = DEFAULT_COURSE_CONFIG
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar título
  if (!courseData.title || courseData.title.length < config.validation.title.minLength) {
    errors.push(`El título debe tener al menos ${config.validation.title.minLength} caracteres`);
  }
  
  if (courseData.title && courseData.title.length > config.validation.title.maxLength) {
    errors.push(`El título no puede tener más de ${config.validation.title.maxLength} caracteres`);
  }
  
  // Validar descripción
  if (courseData.description && courseData.description.length < config.validation.description.minLength) {
    errors.push(`La descripción debe tener al menos ${config.validation.description.minLength} caracteres`);
  }
  
  // Validar estructura si existen módulos
  if (courseData.modules && courseData.modules.length > config.structure.maxUnitsPerCourse) {
    errors.push(`No se pueden tener más de ${config.structure.maxUnitsPerCourse} unidades por curso`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Obtener configuración específica de un componente
 */
export function getComponentConfig(
  componentType: string,
  config: CourseConfig = DEFAULT_COURSE_CONFIG
) {
  return config.components[componentType] || null;
}

/**
 * Verificar si un componente es obligatorio por defecto
 */
export function isComponentMandatoryByDefault(
  componentType: string,
  config: CourseConfig = DEFAULT_COURSE_CONFIG
): boolean {
  return config.progress.mandatoryComponents.includes(componentType);
}

/**
 * Obtener límites para un tipo específico de componente
 */
export function getComponentLimits(
  componentType: string,
  config: CourseConfig = DEFAULT_COURSE_CONFIG
) {
  const componentConfig = config.components[componentType];
  if (!componentConfig) return null;
  
  return {
    maxPerModule: componentConfig.maxPerModule || Infinity,
    validation: componentConfig.validation || {},
    required: componentConfig.required || []
  };
}

/**
 * Generar configuración de quiz por defecto
 */
export function getDefaultQuizConfig(config: CourseConfig = DEFAULT_COURSE_CONFIG) {
  return {
    timeLimit: config.quiz.defaultTimeLimit,
    attempts: config.quiz.defaultAttempts,
    passingScore: config.quiz.passingScore,
    questionTypes: config.quiz.questionTypes,
    minQuestions: config.quiz.minQuestions,
    maxQuestions: config.quiz.maxQuestions
  };
}

/**
 * Obtener porcentaje mínimo de completado para contenido multimedia
 */
export function getMediaCompletionPercentage(
  mediaType: 'video' | 'audio',
  config: CourseConfig = DEFAULT_COURSE_CONFIG
): number {
  return config.progress.media[mediaType].minCompletionPercentage;
}

/**
 * Obtener configuración completa de media
 */
export function getMediaConfig(config: CourseConfig = DEFAULT_COURSE_CONFIG) {
  return {
    video: {
      minCompletionPercentage: config.progress.media.video.minCompletionPercentage,
      requiredPercentage: config.progress.media.video.minCompletionPercentage / 100 // Como decimal para cálculos
    },
    audio: {
      minCompletionPercentage: config.progress.media.audio.minCompletionPercentage,
      requiredPercentage: config.progress.media.audio.minCompletionPercentage / 100 // Como decimal para cálculos
    }
  };
}

export default DEFAULT_COURSE_CONFIG;