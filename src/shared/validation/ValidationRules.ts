/**
 * Sistema de validación centralizado
 * Reglas de validación que deben coincidir con el backend
 */

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FieldValidationRules {
  required?: ValidationRule<any>;
  minLength?: ValidationRule<string>;
  maxLength?: ValidationRule<string>;
  pattern?: ValidationRule<string>;
  custom?: ValidationRule<any>[];
}

/**
 * Reglas de validación por entidad
 * IMPORTANTE: Estas deben coincidir exactamente con las reglas del backend Laravel
 */
export const ValidationRules = {
  // Validaciones para Cursos
  course: {
    title: {
      required: {
        validate: (value: string) => !!value?.trim(),
        message: 'El título del curso es obligatorio'
      },
      minLength: {
        validate: (value: string) => value?.trim().length >= 5,
        message: 'El título debe tener al menos 5 caracteres'
      },
      maxLength: {
        validate: (value: string) => value?.length <= 100,
        message: 'El título no puede exceder 100 caracteres'
      }
    },
    description: {
      required: {
        validate: (value: string) => !!value?.trim(),
        message: 'La descripción del curso es obligatoria'
      },
      minLength: {
        validate: (value: string) => value?.trim().length >= 20,
        message: 'La descripción debe tener al menos 20 caracteres'
      },
      maxLength: {
        validate: (value: string) => value?.length <= 5000,
        message: 'La descripción no puede exceder 5000 caracteres'
      }
    },
    duration_hours: {
      required: {
        validate: (value: number) => typeof value === 'number' && value > 0,
        message: 'La duración debe ser mayor a 0 horas'
      },
      custom: [{
        validate: (value: number) => value <= 1000,
        message: 'La duración no puede exceder 1000 horas'
      }]
    },
    difficulty_level: {
      required: {
        validate: (value: string) => !!value,
        message: 'El nivel de dificultad es obligatorio'
      },
      pattern: {
        validate: (value: string) => ['beginner', 'intermediate', 'advanced'].includes(value),
        message: 'Nivel de dificultad inválido'
      }
    },
    learningObjectives: {
      // Ya NO es requerido en la creación inicial - se puede agregar después
      custom: [{
        validate: (value: string[]) => !value || value.every(obj => obj.trim().length > 0),
        message: 'Los objetivos de aprendizaje no pueden estar vacíos'
      }, {
        validate: (value: string[]) => !value || value.length <= 8,
        message: 'No se pueden definir más de 8 objetivos de aprendizaje'
      }, {
        validate: (value: string[]) => !value || value.every(obj => obj.length <= 150),
        message: 'Cada objetivo no puede exceder 150 caracteres'
      }]
    },
    prerequisites: {
      custom: [{
        validate: (value: string[]) => !value || value.length <= 5,
        message: 'No se pueden definir más de 5 prerrequisitos'
      }, {
        validate: (value: string[]) => !value || value.every(req => req.length <= 100),
        message: 'Cada prerrequisito no puede exceder 100 caracteres'
      }]
    }
  },

  // Validaciones para Categorías
  category: {
    name: {
      required: {
        validate: (value: string) => !!value?.trim(),
        message: 'El nombre de la categoría es requerido'
      },
      minLength: {
        validate: (value: string) => value?.trim().length >= 2,
        message: 'El nombre debe tener al menos 2 caracteres'
      },
      maxLength: {
        validate: (value: string) => value?.length <= 100,
        message: 'El nombre no puede exceder 100 caracteres'
      }
    },
    description: {
      maxLength: {
        validate: (value: string) => !value || value.length <= 500,
        message: 'La descripción no puede exceder 500 caracteres'
      }
    },
    slug: {
      pattern: {
        validate: (value: string) => !value || /^[a-z0-9-]+$/.test(value) && !value.startsWith('-') && !value.endsWith('-'),
        message: 'El slug debe contener solo letras minúsculas, números y guiones'
      }
    },
    color: {
      pattern: {
        validate: (value: string) => !value || /^#[0-9A-F]{6}$/i.test(value),
        message: 'El color debe ser un valor hexadecimal válido (ej: #FF5733)'
      }
    }
  },

  // Validaciones para Usuarios
  user: {
    name: {
      required: {
        validate: (value: string) => !!value?.trim(),
        message: 'El nombre es obligatorio'
      },
      minLength: {
        validate: (value: string) => value?.trim().length >= 2,
        message: 'El nombre debe tener al menos 2 caracteres'
      },
      maxLength: {
        validate: (value: string) => value?.length <= 100,
        message: 'El nombre no puede exceder 100 caracteres'
      }
    },
    email: {
      required: {
        validate: (value: string) => !!value?.trim(),
        message: 'El email es obligatorio'
      },
      pattern: {
        validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'El formato del email no es válido'
      },
      maxLength: {
        validate: (value: string) => value?.length <= 255,
        message: 'El email no puede exceder 255 caracteres'
      }
    },
    password: {
      required: {
        validate: (value: string) => !!value,
        message: 'La contraseña es obligatoria'
      },
      minLength: {
        validate: (value: string) => value?.length >= 8,
        message: 'La contraseña debe tener al menos 8 caracteres'
      },
      maxLength: {
        validate: (value: string) => value?.length <= 255,
        message: 'La contraseña no puede exceder 255 caracteres'
      },
      pattern: {
        validate: (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value),
        message: 'La contraseña debe tener al menos una letra minúscula, una mayúscula y un número'
      }
    }
  },

  // Validaciones comunes
  common: {
    required: (fieldName: string) => ({
      validate: (value: any) => value !== null && value !== undefined && value !== '',
      message: `El campo ${fieldName} es obligatorio`
    }),
    
    positiveNumber: (fieldName: string) => ({
      validate: (value: number) => typeof value === 'number' && value > 0,
      message: `${fieldName} debe ser un número positivo`
    }),

    nonNegativeNumber: (fieldName: string) => ({
      validate: (value: number) => typeof value === 'number' && value >= 0,
      message: `${fieldName} no puede ser negativo`
    }),

    maxArrayLength: (max: number, fieldName: string) => ({
      validate: (value: any[]) => !value || value.length <= max,
      message: `${fieldName} no puede tener más de ${max} elementos`
    }),

    minArrayLength: (min: number, fieldName: string) => ({
      validate: (value: any[]) => Array.isArray(value) && value.length >= min,
      message: `${fieldName} debe tener al menos ${min} elementos`
    })
  }
};

/**
 * Validaciones específicas de archivos
 */
export const FileValidationRules = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth: 1920,
    maxHeight: 1080
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxDuration: 3600 // 1 hour in seconds
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  audio: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']
  }
};