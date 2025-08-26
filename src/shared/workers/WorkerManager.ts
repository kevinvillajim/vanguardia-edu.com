/**
 * Administrador de Web Workers para procesamiento en background
 * Pool de workers, comunicación optimizada y manejo de tareas pesadas
 */

import { logger } from '../utils/logger';

export interface WorkerTask<T = any, R = any> {
  id: string;
  type: string;
  data: T;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timeout?: number;
  retries?: number;
  maxRetries: number;
  createdAt: number;
  resolve?: (result: R) => void;
  reject?: (error: Error) => void;
}

export interface WorkerConfig {
  maxWorkers: number;
  taskTimeout: number;
  maxTasksPerWorker: number;
  idleTimeout: number;
  enableProfiling: boolean;
}

export interface WorkerStats {
  activeWorkers: number;
  idleWorkers: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
}

interface ManagedWorker {
  id: string;
  worker: Worker;
  isIdle: boolean;
  currentTask: WorkerTask | null;
  tasksCompleted: number;
  createdAt: number;
  lastActivity: number;
}

const DEFAULT_CONFIG: WorkerConfig = {
  maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 8),
  taskTimeout: 30000, // 30 segundos
  maxTasksPerWorker: 100,
  idleTimeout: 300000, // 5 minutos
  enableProfiling: false
};

export class WorkerManager {
  private config: WorkerConfig;
  private workers = new Map<string, ManagedWorker>();
  private taskQueue: WorkerTask[] = [];
  private stats: WorkerStats = {
    activeWorkers: 0,
    idleWorkers: 0,
    queuedTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    totalProcessingTime: 0,
    averageProcessingTime: 0
  };
  private taskIdCounter = 0;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config?: Partial<WorkerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanupTimer();
    
    logger.info('⚡ WorkerManager initialized:', {
      maxWorkers: this.config.maxWorkers,
      taskTimeout: this.config.taskTimeout
    });
  }

  /**
   * Ejecutar tarea en worker
   */
  async executeTask<T, R>(
    type: string,
    data: T,
    options: {
      priority?: WorkerTask['priority'];
      timeout?: number;
      maxRetries?: number;
    } = {}
  ): Promise<R> {
    const task: WorkerTask<T, R> = {
      id: this.generateTaskId(),
      type,
      data,
      priority: options.priority || 'normal',
      timeout: options.timeout || this.config.taskTimeout,
      retries: 0,
      maxRetries: options.maxRetries || 3,
      createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      task.resolve = resolve;
      task.reject = reject;
      
      this.enqueueTask(task);
      this.processQueue();
    });
  }

  /**
   * Encolar tarea
   */
  private enqueueTask(task: WorkerTask): void {
    // Insertar según prioridad
    const priorities = { critical: 4, high: 3, normal: 2, low: 1 };
    const taskPriority = priorities[task.priority];
    
    let insertIndex = this.taskQueue.length;
    for (let i = 0; i < this.taskQueue.length; i++) {
      if (priorities[this.taskQueue[i].priority] < taskPriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.taskQueue.splice(insertIndex, 0, task);
    this.stats.queuedTasks = this.taskQueue.length;
    
    if (this.config.enableProfiling) {
      logger.debug('📋 Task enqueued:', {
        id: task.id,
        type: task.type,
        priority: task.priority,
        queuePosition: insertIndex
      });
    }
  }

  /**
   * Procesar cola de tareas
   */
  private async processQueue(): Promise<void> {
    if (this.taskQueue.length === 0) return;

    // Buscar worker disponible
    let availableWorker = this.findIdleWorker();
    
    // Crear worker si es necesario y posible
    if (!availableWorker && this.workers.size < this.config.maxWorkers) {
      availableWorker = await this.createWorker();
    }

    // Si hay worker disponible, asignar tarea
    if (availableWorker && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      this.stats.queuedTasks = this.taskQueue.length;
      
      this.assignTaskToWorker(availableWorker, task);
      
      // Continuar procesando si hay más tareas
      if (this.taskQueue.length > 0) {
        setTimeout(() => this.processQueue(), 10);
      }
    }
  }

  /**
   * Crear nuevo worker
   */
  private async createWorker(): Promise<ManagedWorker> {
    const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generar código del worker
    const workerCode = this.generateWorkerCode();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    const worker = new Worker(workerUrl);
    
    const managedWorker: ManagedWorker = {
      id: workerId,
      worker,
      isIdle: true,
      currentTask: null,
      tasksCompleted: 0,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    // Configurar listeners
    worker.onmessage = (event) => this.handleWorkerMessage(managedWorker, event);
    worker.onerror = (error) => this.handleWorkerError(managedWorker, error);

    this.workers.set(workerId, managedWorker);
    this.updateWorkerStats();
    
    logger.debug('👷 Worker created:', { id: workerId, total: this.workers.size });
    
    return managedWorker;
  }

  /**
   * Generar código del worker
   */
  private generateWorkerCode(): string {
    return `
// Web Worker generado dinámicamente por WorkerManager
const TASK_PROCESSORS = {
  // Procesamiento de imágenes
  'image-resize': async (data) => {
    const { imageData, width, height, quality = 0.8 } = data;
    
    // Crear canvas offscreen
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Crear ImageBitmap desde los datos
    const imageBitmap = await createImageBitmap(
      new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height)
    );
    
    // Redimensionar
    ctx.drawImage(imageBitmap, 0, 0, width, height);
    
    // Convertir a blob
    const blob = await canvas.convertToBlob({ 
      type: 'image/jpeg', 
      quality 
    });
    
    return {
      blob: blob,
      width,
      height,
      size: blob.size
    };
  },

  // Compresión de datos
  'data-compress': async (data) => {
    const { input, algorithm = 'gzip' } = data;
    
    // Simular compresión (en un caso real usarías librerías como pako)
    const inputStr = JSON.stringify(input);
    const compressed = btoa(inputStr); // Base64 como ejemplo
    
    return {
      original: inputStr.length,
      compressed: compressed.length,
      ratio: compressed.length / inputStr.length,
      data: compressed
    };
  },

  // Análisis de datos complejos
  'data-analysis': async (data) => {
    const { dataset, operations = [] } = data;
    const results = {};
    
    for (const operation of operations) {
      switch (operation.type) {
        case 'average':
          results[operation.name] = dataset.reduce((sum, val) => sum + val, 0) / dataset.length;
          break;
        case 'sum':
          results[operation.name] = dataset.reduce((sum, val) => sum + val, 0);
          break;
        case 'max':
          results[operation.name] = Math.max(...dataset);
          break;
        case 'min':
          results[operation.name] = Math.min(...dataset);
          break;
        case 'median':
          const sorted = [...dataset].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          results[operation.name] = sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
          break;
      }
    }
    
    return results;
  },

  // Validación de archivos
  'file-validation': async (data) => {
    const { file, rules = [] } = data;
    const errors = [];
    const warnings = [];
    
    for (const rule of rules) {
      switch (rule.type) {
        case 'size':
          if (file.size > rule.maxSize) {
            errors.push(\`File size (\${file.size}) exceeds maximum (\${rule.maxSize})\`);
          }
          break;
        case 'extension':
          const ext = file.name.split('.').pop()?.toLowerCase();
          if (!rule.allowed.includes(ext)) {
            errors.push(\`File extension '\${ext}' not allowed\`);
          }
          break;
        case 'mime':
          if (!rule.allowed.includes(file.type)) {
            errors.push(\`MIME type '\${file.type}' not allowed\`);
          }
          break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }
    };
  },

  // Procesamiento de texto
  'text-processing': async (data) => {
    const { text, operations = [] } = data;
    let result = text;
    const stats = {};
    
    for (const operation of operations) {
      switch (operation.type) {
        case 'word-count':
          stats.wordCount = result.split(/\\s+/).filter(word => word.length > 0).length;
          break;
        case 'character-count':
          stats.characterCount = result.length;
          break;
        case 'sentiment':
          // Análisis de sentimientos básico
          const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
          const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worse'];
          
          const words = result.toLowerCase().split(/\\s+/);
          const positive = words.filter(word => positiveWords.includes(word)).length;
          const negative = words.filter(word => negativeWords.includes(word)).length;
          
          stats.sentiment = {
            positive,
            negative,
            neutral: words.length - positive - negative,
            score: (positive - negative) / words.length
          };
          break;
        case 'clean':
          result = result.replace(/[^a-zA-Z0-9\\s]/g, '').trim();
          break;
      }
    }
    
    return {
      processedText: result,
      stats
    };
  },

  // Cálculos matemáticos pesados
  'math-calculation': async (data) => {
    const { operation, values, precision = 10 } = data;
    
    switch (operation) {
      case 'factorial':
        const n = values[0];
        let result = 1;
        for (let i = 2; i <= n; i++) {
          result *= i;
        }
        return { result };
      
      case 'fibonacci':
        const count = values[0];
        const sequence = [0, 1];
        for (let i = 2; i < count; i++) {
          sequence[i] = sequence[i - 1] + sequence[i - 2];
        }
        return { sequence };
      
      case 'prime-check':
        const num = values[0];
        if (num < 2) return { isPrime: false };
        for (let i = 2; i <= Math.sqrt(num); i++) {
          if (num % i === 0) return { isPrime: false };
        }
        return { isPrime: true };
      
      case 'matrix-multiply':
        const [a, b] = values;
        const result = [];
        for (let i = 0; i < a.length; i++) {
          result[i] = [];
          for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < b.length; k++) {
              sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
          }
        }
        return { result };
    }
    
    return { error: 'Unknown operation' };
  }
};

// Message handler
self.onmessage = async function(event) {
  const { taskId, type, data, timeout } = event.data;
  
  try {
    const startTime = performance.now();
    
    // Configurar timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Task timeout')), timeout || 30000);
    });
    
    // Ejecutar tarea
    const processor = TASK_PROCESSORS[type];
    if (!processor) {
      throw new Error(\`Unknown task type: \${type}\`);
    }
    
    const taskPromise = processor(data);
    const result = await Promise.race([taskPromise, timeoutPromise]);
    
    const processingTime = performance.now() - startTime;
    
    // Enviar resultado exitoso
    self.postMessage({
      taskId,
      success: true,
      result,
      processingTime,
      timestamp: Date.now()
    });
    
  } catch (error) {
    // Enviar error
    self.postMessage({
      taskId,
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: Date.now()
    });
  }
};

// Error handler
self.onerror = function(error) {
  self.postMessage({
    success: false,
    error: {
      message: 'Worker error: ' + error.message,
      filename: error.filename,
      lineno: error.lineno
    }
  });
};
`;
  }

  /**
   * Buscar worker inactivo
   */
  private findIdleWorker(): ManagedWorker | null {
    for (const worker of this.workers.values()) {
      if (worker.isIdle) {
        return worker;
      }
    }
    return null;
  }

  /**
   * Asignar tarea a worker
   */
  private assignTaskToWorker(worker: ManagedWorker, task: WorkerTask): void {
    worker.isIdle = false;
    worker.currentTask = task;
    worker.lastActivity = Date.now();

    // Configurar timeout
    const timeoutId = setTimeout(() => {
      this.handleTaskTimeout(worker, task);
    }, task.timeout || this.config.taskTimeout);

    // Enviar tarea al worker
    worker.worker.postMessage({
      taskId: task.id,
      type: task.type,
      data: task.data,
      timeout: task.timeout
    });

    this.updateWorkerStats();

    if (this.config.enableProfiling) {
      logger.debug('📤 Task assigned to worker:', {
        taskId: task.id,
        workerId: worker.id,
        type: task.type
      });
    }
  }

  /**
   * Manejar mensaje de worker
   */
  private handleWorkerMessage(worker: ManagedWorker, event: MessageEvent): void {
    const { taskId, success, result, error, processingTime } = event.data;
    const task = worker.currentTask;

    if (!task || task.id !== taskId) {
      logger.warn('⚠️ Received message for unknown task:', taskId);
      return;
    }

    // Liberar worker
    worker.isIdle = true;
    worker.currentTask = null;
    worker.tasksCompleted++;
    worker.lastActivity = Date.now();

    if (success) {
      this.stats.completedTasks++;
      this.stats.totalProcessingTime += processingTime || 0;
      this.stats.averageProcessingTime = this.stats.totalProcessingTime / this.stats.completedTasks;
      
      if (task.resolve) {
        task.resolve(result);
      }

      if (this.config.enableProfiling) {
        logger.debug('✅ Task completed successfully:', {
          taskId,
          workerId: worker.id,
          processingTime: processingTime ? `${processingTime.toFixed(2)}ms` : 'unknown'
        });
      }
    } else {
      this.stats.failedTasks++;
      
      // Reintentar si es posible
      if (task.retries < task.maxRetries) {
        task.retries++;
        logger.warn(`🔄 Retrying task (${task.retries}/${task.maxRetries}):`, taskId);
        
        this.enqueueTask(task);
        this.processQueue();
      } else {
        if (task.reject) {
          task.reject(new Error(error?.message || 'Task failed'));
        }
        
        logger.error('❌ Task failed after max retries:', {
          taskId,
          error: error?.message
        });
      }
    }

    this.updateWorkerStats();
    
    // Terminar worker si ha completado demasiadas tareas
    if (worker.tasksCompleted >= this.config.maxTasksPerWorker) {
      this.terminateWorker(worker.id);
    }

    // Continuar procesando cola
    this.processQueue();
  }

  /**
   * Manejar error de worker
   */
  private handleWorkerError(worker: ManagedWorker, error: ErrorEvent): void {
    logger.error('❌ Worker error:', {
      workerId: worker.id,
      error: error.message
    });

    const task = worker.currentTask;
    if (task) {
      this.stats.failedTasks++;
      
      if (task.reject) {
        task.reject(new Error(`Worker error: ${error.message}`));
      }
    }

    // Terminar worker problemático
    this.terminateWorker(worker.id);
    this.updateWorkerStats();
  }

  /**
   * Manejar timeout de tarea
   */
  private handleTaskTimeout(worker: ManagedWorker, task: WorkerTask): void {
    logger.warn('⏰ Task timeout:', {
      taskId: task.id,
      workerId: worker.id,
      timeout: task.timeout
    });

    this.stats.failedTasks++;

    if (task.reject) {
      task.reject(new Error('Task timeout'));
    }

    // Terminar worker (podría estar bloqueado)
    this.terminateWorker(worker.id);
  }

  /**
   * Terminar worker
   */
  private terminateWorker(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    try {
      worker.worker.terminate();
      this.workers.delete(workerId);
      
      if (this.config.enableProfiling) {
        logger.debug('🔚 Worker terminated:', {
          workerId,
          tasksCompleted: worker.tasksCompleted,
          lifetime: Date.now() - worker.createdAt
        });
      }
    } catch (error) {
      logger.error('❌ Error terminating worker:', error);
    }

    this.updateWorkerStats();
  }

  /**
   * Actualizar estadísticas
   */
  private updateWorkerStats(): void {
    this.stats.activeWorkers = Array.from(this.workers.values()).filter(w => !w.isIdle).length;
    this.stats.idleWorkers = Array.from(this.workers.values()).filter(w => w.isIdle).length;
  }

  /**
   * Timer de limpieza
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleWorkers();
    }, 60000); // Cada minuto
  }

  /**
   * Limpiar workers inactivos
   */
  private cleanupIdleWorkers(): void {
    const now = Date.now();
    const idleWorkers = Array.from(this.workers.values())
      .filter(worker => 
        worker.isIdle && 
        (now - worker.lastActivity) > this.config.idleTimeout
      );

    for (const worker of idleWorkers) {
      this.terminateWorker(worker.id);
    }

    if (idleWorkers.length > 0) {
      logger.debug('🧹 Cleaned up idle workers:', idleWorkers.length);
    }
  }

  /**
   * Generar ID de tarea
   */
  private generateTaskId(): string {
    return `task_${++this.taskIdCounter}_${Date.now()}`;
  }

  /**
   * Obtener estadísticas
   */
  getStats(): WorkerStats & {
    totalWorkers: number;
    memoryUsage: string;
    uptime: number;
  } {
    const memoryInfo = (performance as any).memory;
    
    return {
      ...this.stats,
      totalWorkers: this.workers.size,
      memoryUsage: memoryInfo ? 
        `${(memoryInfo.usedJSHeapSize / 1048576).toFixed(2)} MB` : 
        'unknown',
      uptime: Date.now() - (this.cleanupInterval ? Date.now() : 0)
    };
  }

  /**
   * Cancelar todas las tareas pendientes
   */
  cancelAllTasks(): number {
    const cancelledCount = this.taskQueue.length;
    
    this.taskQueue.forEach(task => {
      if (task.reject) {
        task.reject(new Error('Task cancelled'));
      }
    });

    this.taskQueue = [];
    this.stats.queuedTasks = 0;

    logger.info('🚫 Cancelled all pending tasks:', cancelledCount);
    return cancelledCount;
  }

  /**
   * Destruir todos los workers
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cancelAllTasks();

    for (const workerId of this.workers.keys()) {
      this.terminateWorker(workerId);
    }

    logger.info('💀 WorkerManager destroyed');
  }
}

// Instancia global del Worker Manager
export const globalWorkerManager = new WorkerManager({
  enableProfiling: import.meta.env.VITE_MODE === 'debugging'
});

// Helpers para tareas comunes
export const processImage = (imageData: ImageData, width: number, height: number, quality?: number) =>
  globalWorkerManager.executeTask('image-resize', { imageData, width, height, quality });

export const compressData = (input: any, algorithm?: string) =>
  globalWorkerManager.executeTask('data-compress', { input, algorithm });

export const analyzeData = (dataset: number[], operations: Array<{type: string, name: string}>) =>
  globalWorkerManager.executeTask('data-analysis', { dataset, operations });

export const validateFile = (file: File, rules: Array<{type: string, [key: string]: any}>) =>
  globalWorkerManager.executeTask('file-validation', { file, rules });

export const processText = (text: string, operations: Array<{type: string}>) =>
  globalWorkerManager.executeTask('text-processing', { text, operations });

export const calculateMath = (operation: string, values: any[], precision?: number) =>
  globalWorkerManager.executeTask('math-calculation', { operation, values, precision });