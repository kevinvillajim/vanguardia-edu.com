/**
 * Configuración del Sistema de Actividad del Usuario y Gestión de Tokens
 * 
 * Este archivo centraliza toda la configuración relacionada con:
 * - Detección de actividad del usuario
 * - Renovación automática de tokens de autenticación
 * - Tiempos de inactividad por rol
 * - Eventos que constituyen actividad
 * 
 * CONFIGURACIÓN RÁPIDA:
 * - Para profesores: usar 'teacher' role (15 min inactividad, 7 min renovación)
 * - Para estudiantes: usar 'student' role (10 min inactividad, 5 min renovación)  
 * - Para admins: usar 'admin' role (20 min inactividad, 8 min renovación)
 * 
 * PERSONALIZAR:
 * - Cambiar tiempos en DEFAULT_ACTIVITY_CONFIG
 * - Usar ACTIVITY_PRESETS para configuraciones predefinidas
 * - Modificar roleSpecific para roles específicos
 */

export interface ActivityConfig {
  /** Tiempo de inactividad en ms antes de cerrar sesión */
  inactivityTimeout: number;
  /** Tiempo antes de expiración para renovar token */
  refreshBuffer: number;
  /** Tiempo mínimo entre registros de actividad (anti-spam) */
  activityThrottle: number;
  /** Intervalo para verificar el estado del token */
  tokenCheckInterval: number;
  /** Tiempo de gracia después de que la ventana pierde foco */
  focusGracePeriod: number;
  /** Eventos que indican actividad del usuario */
  activityEvents: string[];
  /** Configuraciones específicas por tipo de usuario */
  roleSpecific: {
    [role: string]: Partial<ActivityConfig>;
  };
}

/**
 * Configuración por defecto del sistema de actividad
 */
export const DEFAULT_ACTIVITY_CONFIG: ActivityConfig = {
  // CONFIGURACIÓN DE TIEMPO (fácil de ajustar)
  inactivityTimeout: 10 * 60 * 1000,    // 10 minutos de inactividad total
  refreshBuffer: 5 * 60 * 1000,         // Renovar token 5 minutos antes de expirar
  activityThrottle: 1000,                // Mínimo 1 segundo entre actividades
  tokenCheckInterval: 5 * 60 * 1000,      // Verificar token cada 5 minutos (reducir frecuencia)
  focusGracePeriod: 2 * 60 * 1000,       // 2 minutos de gracia al perder foco
  
  // 👆 EVENTOS DE ACTIVIDAD (configurable)
  activityEvents: [
    'mousedown',
    'mousemove', 
    'keypress',
    'keydown',
    'keyup',
    'scroll',
    'touchstart',
    'touchmove',
    'touchend',
    'click',
    'focus',
    'blur',
    'wheel'
  ],
  
  // CONFIGURACIÓN ESPECÍFICA POR ROL
  roleSpecific: {
    // Profesores: más tiempo para crear cursos largos
    teacher: {
      inactivityTimeout: 15 * 60 * 1000,  // 15 minutos para profesores
      refreshBuffer: 7 * 60 * 1000,       // Renovar 7 minutos antes
      focusGracePeriod: 5 * 60 * 1000,    // 5 minutos de gracia
    },
    
    // Estudiantes: tiempo estándar
    student: {
      inactivityTimeout: 10 * 60 * 1000,  // 10 minutos para estudiantes
      refreshBuffer: 5 * 60 * 1000,       // Renovar 5 minutos antes
      focusGracePeriod: 2 * 60 * 1000,    // 2 minutos de gracia
    },
    
    // Administradores: tiempo extendido
    admin: {
      inactivityTimeout: 20 * 60 * 1000,  // 20 minutos para admins
      refreshBuffer: 8 * 60 * 1000,       // Renovar 8 minutos antes
      focusGracePeriod: 5 * 60 * 1000,    // 5 minutos de gracia
    }
  }
};

/**
 * Configuraciones preestablecidas para diferentes escenarios
 */
export const ACTIVITY_PRESETS = {
  // Configuración muy permisiva (desarrollo/testing)
  DEVELOPMENT: {
    ...DEFAULT_ACTIVITY_CONFIG,
    inactivityTimeout: 30 * 60 * 1000,   // 30 minutos
    refreshBuffer: 10 * 60 * 1000,       // 10 minutos
    focusGracePeriod: 10 * 60 * 1000,    // 10 minutos
  },
  
  // Configuración estricta (alta seguridad)
  STRICT: {
    ...DEFAULT_ACTIVITY_CONFIG,
    inactivityTimeout: 5 * 60 * 1000,    // 5 minutos
    refreshBuffer: 2 * 60 * 1000,        // 2 minutos
    focusGracePeriod: 30 * 1000,         // 30 segundos
  },
  
  // Configuración para sesiones largas (creación de contenido)
  EXTENDED: {
    ...DEFAULT_ACTIVITY_CONFIG,
    inactivityTimeout: 25 * 60 * 1000,   // 25 minutos
    refreshBuffer: 10 * 60 * 1000,       // 10 minutos
    focusGracePeriod: 10 * 60 * 1000,    // 10 minutos
  }
};

/**
 * Obtener configuración específica para un rol de usuario
 */
export function getActivityConfigForRole(
  userRole?: string, 
  preset?: keyof typeof ACTIVITY_PRESETS
): ActivityConfig {
  // Usar preset si se especifica
  let baseConfig = preset ? ACTIVITY_PRESETS[preset] : DEFAULT_ACTIVITY_CONFIG;
  
  // Aplicar configuraciones específicas del rol si existe
  if (userRole && baseConfig.roleSpecific[userRole]) {
    return {
      ...baseConfig,
      ...baseConfig.roleSpecific[userRole]
    };
  }
  
  return baseConfig;
}

/**
 * Formatear tiempo en formato legible
 */
export function formatTime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
  
  if (minutes === 0) {
    return `${seconds}s`;
  }
  
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

/**
 * Validar configuración de actividad
 */
export function validateActivityConfig(config: Partial<ActivityConfig>): string[] {
  const errors: string[] = [];
  
  if (config.inactivityTimeout && config.inactivityTimeout < 60000) {
    errors.push('El tiempo de inactividad no puede ser menor a 1 minuto');
  }
  
  if (config.refreshBuffer && config.inactivityTimeout && 
      config.refreshBuffer >= config.inactivityTimeout) {
    errors.push('El buffer de renovación debe ser menor al tiempo de inactividad');
  }
  
  if (config.activityThrottle && config.activityThrottle < 100) {
    errors.push('El throttle de actividad no puede ser menor a 100ms');
  }
  
  return errors;
}

// CONFIGURACIÓN DE ENTORNO
// Permitir sobrescribir la configuración desde variables de entorno
const ENV_CONFIG: Partial<ActivityConfig> = {
  inactivityTimeout: import.meta.env.VITE_ACTIVITY_TIMEOUT ? 
    parseInt(import.meta.env.VITE_ACTIVITY_TIMEOUT) : undefined,
  refreshBuffer: import.meta.env.VITE_REFRESH_BUFFER ? 
    parseInt(import.meta.env.VITE_REFRESH_BUFFER) : undefined,
};

// Aplicar configuración de entorno si está disponible
Object.keys(ENV_CONFIG).forEach(key => {
  const envValue = ENV_CONFIG[key as keyof ActivityConfig];
  if (envValue !== undefined) {
    (DEFAULT_ACTIVITY_CONFIG as any)[key] = envValue;
  }
});

export default DEFAULT_ACTIVITY_CONFIG;