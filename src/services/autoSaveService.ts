/**
 * Servicio de autoguardado optimizado para cursos
 * Evita saturar la base de datos con guardados innecesarios
 */

import { logger } from '../shared/utils/logger';
import { Course } from '../domain/entities/Course';

interface AutoSaveOptions {
  /** Intervalo mínimo entre guardados (ms) */
  minInterval: number;
  /** Tiempo máximo sin guardar antes de forzar guardado (ms) */
  maxInterval: number;
  /** Número mínimo de cambios antes de guardar */
  minChanges: number;
}

interface PendingSave {
  courseId: number;
  data: any;
  timestamp: number;
  changeCount: number;
}

export class AutoSaveService {
  private pendingSaves = new Map<number, PendingSave>();
  private saveTimeouts = new Map<number, NodeJS.Timeout>();
  private lastSaveTime = new Map<number, number>();
  
  private readonly options: AutoSaveOptions = {
    minInterval: 10000,    // 10 segundos mínimo entre guardados
    maxInterval: 60000,    // 1 minuto máximo sin guardar
    minChanges: 3          // Mínimo 3 cambios para trigger guardado
  };

  /**
   * Programa un guardado inteligente
   */
  scheduleAutoSave(
    courseId: number, 
    courseData: any, 
    saveCallback: (data: any) => Promise<void>
  ): void {
    const now = Date.now();
    const existing = this.pendingSaves.get(courseId);
    const lastSave = this.lastSaveTime.get(courseId) || 0;
    
    // Incrementar contador de cambios
    const changeCount = existing ? existing.changeCount + 1 : 1;
    
    // Actualizar datos pendientes
    this.pendingSaves.set(courseId, {
      courseId,
      data: courseData,
      timestamp: now,
      changeCount
    });

    // Limpiar timeout anterior si existe
    const existingTimeout = this.saveTimeouts.get(courseId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Determinar cuándo guardar
    const timeSinceLastSave = now - lastSave;
    const shouldSaveNow = 
      // Han pasado muchos cambios
      changeCount >= this.options.minChanges ||
      // Ha pasado el tiempo máximo
      timeSinceLastSave >= this.options.maxInterval;

    if (shouldSaveNow && timeSinceLastSave >= this.options.minInterval) {
      // Guardar inmediatamente
      this.executeSave(courseId, courseData, saveCallback);
    } else {
      // Programar guardado
      const delay = Math.max(
        this.options.minInterval - timeSinceLastSave,
        2000 // Mínimo 2 segundos de delay
      );
      
      const timeout = setTimeout(() => {
        this.executeSave(courseId, courseData, saveCallback);
      }, delay);
      
      this.saveTimeouts.set(courseId, timeout);
      
      logger.debug('📝 AutoSave programado:', {
        courseId,
        delay: Math.round(delay / 1000) + 's',
        changeCount,
        timeSinceLastSave: Math.round(timeSinceLastSave / 1000) + 's'
      });
    }
  }

  /**
   * Ejecutar guardado inmediato
   */
  async executeSave(
    courseId: number, 
    courseData: any, 
    saveCallback: (data: any) => Promise<void>
  ): Promise<void> {
    try {
      const pending = this.pendingSaves.get(courseId);
      if (!pending) return;

      logger.info('💾 Ejecutando autoguardado:', {
        courseId,
        changeCount: pending.changeCount,
        timePending: Math.round((Date.now() - pending.timestamp) / 1000) + 's'
      });

      await saveCallback(courseData);
      
      // Limpiar estado
      this.pendingSaves.delete(courseId);
      this.saveTimeouts.delete(courseId);
      this.lastSaveTime.set(courseId, Date.now());
      
      logger.success('✅ Autoguardado exitoso:', { courseId });
      
    } catch (error) {
      logger.error('❌ Error en autoguardado:', { courseId, error });
      // Reprogramar en caso de error
      setTimeout(() => {
        this.scheduleAutoSave(courseId, courseData, saveCallback);
      }, 5000); // Retry en 5 segundos
    }
  }

  /**
   * Forzar guardado inmediato (para cuando el usuario sale de la página)
   */
  async forceSave(courseId: number, saveCallback: (data: any) => Promise<void>): Promise<void> {
    const pending = this.pendingSaves.get(courseId);
    if (!pending) return;

    logger.info('⚡ Forzando guardado inmediato:', { courseId });
    await this.executeSave(courseId, pending.data, saveCallback);
  }

  /**
   * Cancelar autoguardado pendiente
   */
  cancelAutoSave(courseId: number): void {
    const timeout = this.saveTimeouts.get(courseId);
    if (timeout) {
      clearTimeout(timeout);
      this.saveTimeouts.delete(courseId);
    }
    this.pendingSaves.delete(courseId);
    logger.debug('❌ Autoguardado cancelado:', { courseId });
  }

  /**
   * Obtener información de guardados pendientes
   */
  getPendingSaveInfo(courseId: number): {
    hasPendingChanges: boolean;
    changeCount: number;
    timePending: number;
  } | null {
    const pending = this.pendingSaves.get(courseId);
    if (!pending) return null;

    return {
      hasPendingChanges: true,
      changeCount: pending.changeCount,
      timePending: Date.now() - pending.timestamp
    };
  }

  /**
   * Configurar opciones de autoguardado
   */
  configure(options: Partial<AutoSaveOptions>): void {
    Object.assign(this.options, options);
    logger.info('⚙️ Configuración de autoguardado actualizada:', this.options);
  }
}

// Instancia singleton
export const autoSaveService = new AutoSaveService();