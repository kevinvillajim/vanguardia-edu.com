/**
 * Servicio de auto-guardado híbrido para cursos
 * Combina guardado fijo cada 5 minutos + guardado inteligente por inactividad
 */

import { logger } from '../shared/utils/logger';

interface HybridAutoSaveConfig {
  fixedInterval: number;      // 5 minutos fijo
  inactivityDelay: number;    // 30 segundos sin actividad  
  minChanges: number;         // Mínimo cambios sustanciales
  debounceTime: number;       // Debounce para cambios rápidos
}

interface SaveCallback {
  (data: any): Promise<void>;
}

interface DataProvider {
  (): any;
}

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export class HybridAutoSaveService {
  private config: HybridAutoSaveConfig;
  private fixedTimer: NodeJS.Timeout | null = null;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private changeCount = 0;
  private lastActivity = Date.now();
  private isActive = false;
  private currentStatus: AutoSaveStatus = 'idle';
  private statusCallbacks: Array<(status: AutoSaveStatus) => void> = [];

  constructor(config?: Partial<HybridAutoSaveConfig>) {
    this.config = {
      fixedInterval: 5 * 60 * 1000,  // 5 minutos
      inactivityDelay: 30 * 1000,    // 30 segundos
      minChanges: 3,                 // Mínimo 3 cambios
      debounceTime: 2000,            // 2 segundos debounce
      ...config
    };
  }

  /**
   * Iniciar el sistema de auto-guardado híbrido
   */
  start(
    courseId: number, 
    dataProvider: DataProvider, 
    saveCallback: SaveCallback
  ): void {
    if (this.isActive) {
      this.stop();
    }

    this.isActive = true;
    this.changeCount = 0;
    this.lastActivity = Date.now();

    logger.debug('🔄 Iniciando auto-guardado híbrido', {
      courseId,
      config: this.config
    });

    // Guardado fijo cada 5 minutos
    this.startFixedSave(courseId, dataProvider, saveCallback);
  }

  /**
   * Detener el sistema de auto-guardado
   */
  stop(): void {
    this.isActive = false;
    
    if (this.fixedTimer) {
      clearInterval(this.fixedTimer);
      this.fixedTimer = null;
    }
    
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.changeCount = 0;
    this.setStatus('idle');
    logger.debug('⏹️ Auto-guardado híbrido detenido');
  }

  /**
   * Notificar cambio para auto-guardado inteligente
   */
  notifyChange(
    courseId: number,
    dataProvider: DataProvider,
    saveCallback: SaveCallback,
    isSubstantialChange = false
  ): void {
    if (!this.isActive) return;

    // Incrementar contador solo para cambios sustanciales
    if (isSubstantialChange) {
      this.changeCount++;
    }
    
    this.lastActivity = Date.now();

    // Limpiar timer anterior
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce para evitar múltiples notificaciones rápidas
    this.debounceTimer = setTimeout(() => {
      this.scheduleIntelligentSave(courseId, dataProvider, saveCallback);
    }, this.config.debounceTime);
  }

  /**
   * Guardado manual forzado
   */
  async forceSave(
    courseId: number,
    data: any,
    saveCallback: SaveCallback
  ): Promise<void> {
    this.setStatus('saving');
    
    try {
      await this.executeSave(courseId, data, saveCallback, 'manual');
      this.changeCount = 0;
      this.setStatus('saved');
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  /**
   * Obtener estado actual del auto-guardado
   */
  getStatus(): AutoSaveStatus {
    return this.currentStatus;
  }

  /**
   * Suscribirse a cambios de estado
   */
  onStatusChange(callback: (status: AutoSaveStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Retornar función de desuscripción
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Guardado fijo cada 5 minutos (plan de contingencia)
   */
  private startFixedSave(
    courseId: number,
    dataProvider: DataProvider,
    saveCallback: SaveCallback
  ): void {
    this.fixedTimer = setInterval(async () => {
      if (this.changeCount > 0 && this.isActive) {
        logger.debug('⏰ Ejecutando guardado fijo (5 min)', { 
          courseId, 
          changeCount: this.changeCount 
        });
        
        try {
          const data = dataProvider();
          await this.executeSave(courseId, data, saveCallback, 'auto');
          this.changeCount = 0;
        } catch (error) {
          logger.error('❌ Error en guardado fijo:', error);
        }
      }
    }, this.config.fixedInterval);
  }

  /**
   * Guardado inteligente por inactividad
   */
  private scheduleIntelligentSave(
    courseId: number,
    dataProvider: DataProvider,
    saveCallback: SaveCallback
  ): void {
    // Limpiar timer anterior
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Programar guardado por inactividad
    this.inactivityTimer = setTimeout(async () => {
      if (this.changeCount >= this.config.minChanges && this.isActive) {
        logger.debug('🧠 Ejecutando guardado inteligente', {
          courseId,
          changeCount: this.changeCount,
          inactivityTime: this.config.inactivityDelay
        });

        try {
          const data = dataProvider();
          await this.executeSave(courseId, data, saveCallback, 'auto');
          this.changeCount = 0;
        } catch (error) {
          logger.error('❌ Error en guardado inteligente:', error);
        }
      }
    }, this.config.inactivityDelay);
  }

  /**
   * Ejecutar guardado con manejo de errores
   */
  private async executeSave(
    courseId: number,
    data: any,
    saveCallback: SaveCallback,
    type: 'auto' | 'manual'
  ): Promise<void> {
    if (type === 'auto') {
      this.setStatus('saving');
    }

    try {
      await saveCallback(data);
      
      if (type === 'auto') {
        this.setStatus('saved');
        // Volver a idle después de 2 segundos
        setTimeout(() => {
          if (this.currentStatus === 'saved') {
            this.setStatus('idle');
          }
        }, 2000);
      }
      
      logger.debug(`✅ ${type === 'auto' ? 'Auto-guardado' : 'Guardado manual'} completado`, {
        courseId,
        type
      });
    } catch (error) {
      if (type === 'auto') {
        this.setStatus('error');
      }
      
      logger.error(`❌ Error en ${type === 'auto' ? 'auto-guardado' : 'guardado manual'}:`, error);
      throw error;
    }
  }

  /**
   * Cambiar estado y notificar suscriptores
   */
  private setStatus(status: AutoSaveStatus): void {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.statusCallbacks.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          logger.error('Error en callback de status:', error);
        }
      });
    }
  }
}

// Instancia singleton para uso global
export const hybridAutoSaveService = new HybridAutoSaveService();