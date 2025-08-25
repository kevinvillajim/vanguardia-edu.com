/**
 * 🔍 Sistema de Logging Inteligente - VanguardIA
 * 
 * 3 Modos de logging configurables vía .env:
 * 
 * 1. 'development' - Solo logs críticos y necesarios
 * 2. 'debugging'   - Todos los logs incluyendo repetitivos 
 * 3. 'testing'     - Sin logs (limpio para testing)
 * 
 * Configuración en .env:
 * VITE_MODE=testing
 * 
 * Uso:
 * - logger.info() - Solo en development y debugging
 * - logger.debug() - Solo en debugging 
 * - logger.error() - Siempre (crítico)
 * - logger.warn() - Siempre (importante)
 */

type LogMode = 'development' | 'debugging' | 'testing';

class Logger {
  private mode: LogMode;

  constructor() {
    this.mode = this.getLogMode();
  }

  private getLogMode(): LogMode {
    // Prioridad: VITE_MODE > MODE > fallback a development
    const viteMode = import.meta.env.VITE_MODE as LogMode;
    const envMode = import.meta.env.MODE as LogMode;
    
    if (viteMode && ['development', 'debugging', 'testing'].includes(viteMode)) {
      return viteMode;
    }
    
    if (envMode && ['development', 'debugging', 'testing'].includes(envMode)) {
      return envMode;
    }
    
    return 'development'; // fallback
  }

  /**
   * Logs informativos - Solo en development y debugging
   */
  info(message: string, data?: any) {
    if (this.mode === 'development' || this.mode === 'debugging') {
      if (data !== undefined) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Logs de debug detallados - Solo en debugging
   */
  debug(message: string, data?: any) {
    if (this.mode === 'debugging') {
      if (data !== undefined) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Errores críticos - Siempre se muestran
   */
  error(message: string, error?: any) {
    if (error !== undefined) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }

  /**
   * Advertencias importantes - Siempre se muestran
   */
  warn(message: string, data?: any) {
    if (data !== undefined) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }

  /**
   * Éxito - Solo en development y debugging
   */
  success(message: string, data?: any) {
    if (this.mode === 'development' || this.mode === 'debugging') {
      if (data !== undefined) {
        console.log(`✅ ${message}`, data);
      } else {
        console.log(`✅ ${message}`);
      }
    }
  }

  /**
   * Logs de actividad del usuario - Solo en debugging (muy repetitivos)
   */
  activity(message: string, data?: any) {
    if (this.mode === 'debugging') {
      if (data !== undefined) {
        console.log(`👆 ${message}`, data);
      } else {
        console.log(`👆 ${message}`);
      }
    }
  }

  /**
   * Logs de red/API - Development y debugging
   */
  network(message: string, data?: any) {
    if (this.mode === 'development' || this.mode === 'debugging') {
      if (data !== undefined) {
        console.log(`🌐 ${message}`, data);
      } else {
        console.log(`🌐 ${message}`);
      }
    }
  }

  /**
   * Logs de streaming/media - Solo debugging (muy detallados)
   */
  streaming(message: string, data?: any) {
    if (this.mode === 'debugging') {
      if (data !== undefined) {
        console.log(`🎵 ${message}`, data);
      } else {
        console.log(`🎵 ${message}`);
      }
    }
  }

  /**
   * Logs de tokens/auth - Development y debugging
   */
  auth(message: string, data?: any) {
    if (this.mode === 'development' || this.mode === 'debugging') {
      if (data !== undefined) {
        console.log(`🔐 ${message}`, data);
      } else {
        console.log(`🔐 ${message}`);
      }
    }
  }

  /**
   * Logs de curso/creación - Development y debugging
   */
  course(message: string, data?: any) {
    if (this.mode === 'development' || this.mode === 'debugging') {
      if (data !== undefined) {
        console.log(`📚 ${message}`, data);
      } else {
        console.log(`📚 ${message}`);
      }
    }
  }

  /**
   * Obtener el modo actual
   */
  getMode(): LogMode {
    return this.mode;
  }

  /**
   * Información del sistema de logging
   */
  getInfo() {
    return {
      mode: this.mode,
      description: this.getModeDescription(),
      env: {
        VITE_MODE: import.meta.env.VITE_MODE,
        MODE: import.meta.env.MODE,
        NODE_ENV: import.meta.env.NODE_ENV
      }
    };
  }

  private getModeDescription(): string {
    switch (this.mode) {
      case 'development':
        return 'Solo logs críticos y necesarios';
      case 'debugging':
        return 'Todos los logs incluyendo repetitivos';
      case 'testing':
        return 'Sin logs (limpio para testing)';
      default:
        return 'Modo desconocido';
    }
  }

  /**
   * Log de inicialización - Solo una vez
   */
  init(component: string) {
    if (this.mode === 'development' || this.mode === 'debugging') {
      console.log(`🚀 ${component} inicializado [${this.mode}]`);
    }
  }

  /**
   * Mostrar información del sistema de logging
   */
  showSystemInfo() {
    if (this.mode !== 'testing') {
      console.group('🔍 Sistema de Logging - VanguardIA');
      console.log('📊 Modo actual:', this.mode);
      console.log('📝 Descripción:', this.getModeDescription());
      console.log('💡 Para cambiar el modo, edita VITE_MODE en .env');
      console.log('🎯 Modos disponibles: development, debugging, testing');
      console.groupEnd();
    }
  }
}

// Instancia singleton
export const logger = new Logger();

// Inicializar el sistema de logging solo una vez
if (logger.getMode() !== 'testing') {
  logger.showSystemInfo();
}

// Mantener compatibilidad con sistema anterior
export const createComponentLogger = (componentName: string) => {
  return {
    debug: (message: string, data?: any) => logger.debug(`[${componentName}] ${message}`, data),
    info: (message: string, data?: any) => logger.info(`[${componentName}] ${message}`, data),
    warn: (message: string, data?: any) => logger.warn(`[${componentName}] ${message}`, data),
    error: (message: string, data?: any) => logger.error(`[${componentName}] ${message}`, data),
    success: (message: string, data?: any) => logger.success(`[${componentName}] ${message}`, data),
  };
};

export type LogMode = LogMode;
export default logger;