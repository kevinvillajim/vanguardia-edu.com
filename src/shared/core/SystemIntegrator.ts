/**
 * Integrador central de todos los sistemas optimizados
 * Orquesta cache, monitoring, security, workers y offline sync
 */

import { logger } from '../utils/logger';
import { globalCacheManager } from '../cache/CacheManager';
import { globalPerformanceMonitor } from '../monitoring/PerformanceMonitor';
import { globalTelemetryService } from '../monitoring/TelemetryService';
import { globalSecurityService } from '../security/SecurityService';
import { globalRateLimiter, apiRateLimiter, authRateLimiter } from '../security/RateLimiter';
import { globalServiceWorkerManager } from '../offline/ServiceWorkerManager';
import { globalWorkerManager } from '../workers/WorkerManager';

export interface SystemConfig {
  cache: {
    enabled: boolean;
    maxSize: number;
    defaultTTL: number;
    enablePersistence: boolean;
  };
  monitoring: {
    enabled: boolean;
    enableProfiling: boolean;
    sampleRate: number;
    reportingInterval: number;
  };
  security: {
    enabled: boolean;
    enableRateLimiting: boolean;
    enableXSSProtection: boolean;
    enableCSRFProtection: boolean;
  };
  offline: {
    enabled: boolean;
    enableServiceWorker: boolean;
    enableBackgroundSync: boolean;
  };
  workers: {
    enabled: boolean;
    maxWorkers: number;
    taskTimeout: number;
    enableProfiling: boolean;
  };
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical' | 'down';
  systems: {
    cache: SystemStatus;
    monitoring: SystemStatus;
    security: SystemStatus;
    offline: SystemStatus;
    workers: SystemStatus;
  };
  metrics: {
    uptime: number;
    memoryUsage: number;
    performanceScore: number;
    errorRate: number;
    requestRate: number;
  };
  recommendations: string[];
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'critical' | 'down';
  uptime: number;
  metrics: Record<string, any>;
  issues: string[];
}

const DEFAULT_CONFIG: SystemConfig = {
  cache: {
    enabled: true,
    maxSize: 5000,
    defaultTTL: 10 * 60 * 1000,
    enablePersistence: true
  },
  monitoring: {
    enabled: true,
    enableProfiling: import.meta.env.VITE_MODE === 'debugging',
    sampleRate: 1.0,
    reportingInterval: 60000
  },
  security: {
    enabled: true,
    enableRateLimiting: true,
    enableXSSProtection: true,
    enableCSRFProtection: true
  },
  offline: {
    enabled: true,
    enableServiceWorker: import.meta.env.PROD,
    enableBackgroundSync: true
  },
  workers: {
    enabled: true,
    maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 8),
    taskTimeout: 30000,
    enableProfiling: import.meta.env.VITE_MODE === 'debugging'
  }
};

export class SystemIntegrator {
  private config: SystemConfig;
  private isInitialized = false;
  private startTime = Date.now();
  private healthCheckInterval?: NodeJS.Timeout;
  private integrationMetrics = {
    totalRequests: 0,
    cachedRequests: 0,
    securityViolations: 0,
    workerTasks: 0,
    offlineRequests: 0,
    errors: 0
  };

  constructor(config?: Partial<SystemConfig>) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, config);
    logger.info('🎯 SystemIntegrator created with config:', this.config);
  }

  /**
   * Inicializar todos los sistemas
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('⚠️ SystemIntegrator already initialized');
      return true;
    }

    logger.info('🚀 Initializing integrated system architecture...');

    try {
      // Inicializar sistemas en orden de dependencia
      await this.initializeCache();
      await this.initializeMonitoring();
      await this.initializeSecurity();
      await this.initializeOfflineSupport();
      await this.initializeWorkers();

      // Configurar integración entre sistemas
      this.setupSystemIntegrations();

      // Iniciar health checks
      this.startHealthChecks();

      // Configurar graceful shutdown
      this.setupGracefulShutdown();

      this.isInitialized = true;
      
      logger.success('✅ System integration completed successfully!');
      
      // Track initialization
      globalTelemetryService.trackBusinessEvent('system_initialized', 'integration', {
        config: this.config,
        initTime: Date.now() - this.startTime
      });

      return true;

    } catch (error) {
      logger.error('❌ System integration failed:', error);
      globalTelemetryService.trackError(error as Error, { phase: 'initialization' });
      return false;
    }
  }

  /**
   * Inicializar sistema de cache
   */
  private async initializeCache(): Promise<void> {
    if (!this.config.cache.enabled) {
      logger.info('📦 Cache system disabled by config');
      return;
    }

    try {
      // El cache ya está inicializado globalmente, solo configuramos warmup
      await globalCacheManager.warmup([
        {
          key: 'system:health',
          factory: async () => ({ status: 'healthy', timestamp: Date.now() }),
          ttl: 30000,
          tags: ['system']
        },
        {
          key: 'config:app',
          factory: async () => this.config,
          ttl: 300000,
          tags: ['config']
        }
      ]);

      logger.info('📦 Cache system initialized and warmed up');
    } catch (error) {
      logger.error('❌ Cache initialization failed:', error);
      throw error;
    }
  }

  /**
   * Inicializar monitoreo
   */
  private async initializeMonitoring(): Promise<void> {
    if (!this.config.monitoring.enabled) {
      logger.info('📊 Monitoring disabled by config');
      return;
    }

    try {
      // Los sistemas de monitoreo ya están iniciados globalmente
      globalPerformanceMonitor.start();
      
      // Configurar reportes periódicos
      setInterval(() => {
        const report = globalPerformanceMonitor.generateReport();
        if (report.score < 80) {
          logger.warn('⚠️ Performance degradation detected:', {
            score: report.score,
            alerts: report.alerts.length
          });
        }
      }, this.config.monitoring.reportingInterval);

      logger.info('📊 Monitoring system initialized');
    } catch (error) {
      logger.error('❌ Monitoring initialization failed:', error);
      throw error;
    }
  }

  /**
   * Inicializar seguridad
   */
  private async initializeSecurity(): Promise<void> {
    if (!this.config.security.enabled) {
      logger.info('🛡️ Security system disabled by config');
      return;
    }

    try {
      // Los sistemas de seguridad ya están inicializados globalmente
      logger.info('🛡️ Security system initialized with protections:', {
        rateLimiting: this.config.security.enableRateLimiting,
        xssProtection: this.config.security.enableXSSProtection,
        csrfProtection: this.config.security.enableCSRFProtection
      });
    } catch (error) {
      logger.error('❌ Security initialization failed:', error);
      throw error;
    }
  }

  /**
   * Inicializar soporte offline
   */
  private async initializeOfflineSupport(): Promise<void> {
    if (!this.config.offline.enabled) {
      logger.info('📡 Offline support disabled by config');
      return;
    }

    try {
      if (this.config.offline.enableServiceWorker) {
        await globalServiceWorkerManager.register();
      }

      // Configurar listeners para eventos offline
      window.addEventListener('sw-update-available', () => {
        logger.info('🔄 Service Worker update available');
        globalTelemetryService.trackBusinessEvent('sw_update_available', 'offline');
      });

      logger.info('📡 Offline support initialized');
    } catch (error) {
      logger.error('❌ Offline support initialization failed:', error);
      throw error;
    }
  }

  /**
   * Inicializar workers
   */
  private async initializeWorkers(): Promise<void> {
    if (!this.config.workers.enabled) {
      logger.info('⚡ Workers disabled by config');
      return;
    }

    try {
      // El WorkerManager ya está inicializado globalmente
      logger.info('⚡ Workers initialized:', {
        maxWorkers: this.config.workers.maxWorkers,
        taskTimeout: this.config.workers.taskTimeout
      });
    } catch (error) {
      logger.error('❌ Workers initialization failed:', error);
      throw error;
    }
  }

  /**
   * Configurar integraciones entre sistemas
   */
  private setupSystemIntegrations(): void {
    // Integración Cache + Performance Monitor
    globalPerformanceMonitor.subscribe((metrics) => {
      globalCacheManager.set('perf:current', metrics, {
        ttl: 30000,
        tags: ['performance', 'metrics']
      });
    });

    // Integración Security + Telemetry
    const originalRecordViolation = (globalSecurityService as any).recordViolation;
    if (originalRecordViolation) {
      (globalSecurityService as any).recordViolation = function(violation: any) {
        originalRecordViolation.call(this, violation);
        globalTelemetryService.trackBusinessEvent('security_violation', 'security', {
          type: violation.type,
          severity: violation.severity
        });
        this.integrationMetrics.securityViolations++;
      }.bind(this);
    }

    // Integración Workers + Performance Monitor
    const originalExecuteTask = globalWorkerManager.executeTask.bind(globalWorkerManager);
    globalWorkerManager.executeTask = async function<T, R>(type: string, data: T, options: any = {}): Promise<R> {
      const startTime = performance.now();
      try {
        const result = await originalExecuteTask(type, data, options);
        const duration = performance.now() - startTime;
        globalPerformanceMonitor.recordRenderTime(`worker:${type}`, duration);
        this.integrationMetrics.workerTasks++;
        return result;
      } catch (error) {
        globalTelemetryService.trackError(error as Error, { workerType: type });
        this.integrationMetrics.errors++;
        throw error;
      }
    }.bind(this);

    // Integración Rate Limiter + Cache
    const originalIsAllowed = globalRateLimiter.isAllowed.bind(globalRateLimiter);
    globalRateLimiter.isAllowed = async function(identifier: string, increment: boolean = true) {
      // Verificar cache primero
      const cacheKey = `ratelimit:${identifier}`;
      const cached = await globalCacheManager.get<any>(cacheKey);
      
      if (cached && !cached.allowed) {
        return { allowed: false, info: cached.info };
      }

      const result = await originalIsAllowed(identifier, increment);
      
      // Cachear resultado si está bloqueado
      if (!result.allowed) {
        await globalCacheManager.set(cacheKey, result, {
          ttl: result.info.retryAfter * 1000,
          tags: ['ratelimit']
        });
      }

      this.integrationMetrics.totalRequests++;
      return result;
    }.bind(this);

    logger.info('🔗 System integrations configured');
  }

  /**
   * Iniciar health checks periódicos
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.getSystemHealth();
      
      if (health.overall === 'critical') {
        logger.error('🚨 CRITICAL: System health degraded:', health);
        globalTelemetryService.trackBusinessEvent('system_critical', 'health', health);
      } else if (health.overall === 'warning') {
        logger.warn('⚠️ WARNING: System health issues detected:', health.recommendations);
      }

      // Cache health status
      await globalCacheManager.set('system:health', health, {
        ttl: 30000,
        tags: ['system', 'health']
      });

    }, 60000); // Cada minuto

    logger.info('💚 Health checks started');
  }

  /**
   * Configurar graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const handleShutdown = async (signal: string) => {
      logger.info(`🛑 Graceful shutdown initiated (${signal})`);
      
      try {
        // Detener health checks
        if (this.healthCheckInterval) {
          clearInterval(this.healthCheckInterval);
        }

        // Flush caches y telemetría
        await Promise.allSettled([
          globalTelemetryService.flush(),
          globalCacheManager.clear(),
          globalWorkerManager.destroy(),
          globalServiceWorkerManager.destroy()
        ]);

        logger.success('✅ Graceful shutdown completed');
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
      }
    };

    // Configurar listeners para diferentes señales
    window.addEventListener('beforeunload', () => handleShutdown('beforeunload'));
    window.addEventListener('unload', () => handleShutdown('unload'));
    
    // Para Node.js environments (testing)
    if (typeof process !== 'undefined') {
      process.on('SIGTERM', () => handleShutdown('SIGTERM'));
      process.on('SIGINT', () => handleShutdown('SIGINT'));
    }
  }

  /**
   * Obtener salud del sistema
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const cacheStats = globalCacheManager.getStats();
    const performanceStats = globalPerformanceMonitor.getStats();
    const workerStats = globalWorkerManager.getStats();
    const securityReport = globalSecurityService.generateSecurityReport();
    const swStatus = globalServiceWorkerManager.getQueueStatus();

    // Evaluar cada sistema
    const systems = {
      cache: this.evaluateCacheHealth(cacheStats),
      monitoring: this.evaluateMonitoringHealth(performanceStats),
      security: this.evaluateSecurityHealth(securityReport),
      offline: this.evaluateOfflineHealth(swStatus),
      workers: this.evaluateWorkersHealth(workerStats)
    };

    // Calcular salud general
    const systemStatuses = Object.values(systems).map(s => s.status);
    const overall = systemStatuses.includes('critical') ? 'critical' :
                   systemStatuses.includes('warning') ? 'warning' : 'healthy';

    // Métricas generales
    const metrics = {
      uptime: Date.now() - this.startTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      performanceScore: performanceStats.hitRate,
      errorRate: this.integrationMetrics.errors / Math.max(this.integrationMetrics.totalRequests, 1),
      requestRate: this.integrationMetrics.totalRequests
    };

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(systems, metrics);

    return {
      overall,
      systems,
      metrics,
      recommendations
    };
  }

  /**
   * Evaluar salud del cache
   */
  private evaluateCacheHealth(stats: any): SystemStatus {
    const issues: string[] = [];
    let status: SystemStatus['status'] = 'healthy';

    if (stats.hitRate < 70) {
      issues.push(`Low cache hit rate: ${stats.hitRate.toFixed(1)}%`);
      status = 'warning';
    }

    if (stats.memoryUsage > 100 * 1024 * 1024) { // 100MB
      issues.push(`High memory usage: ${(stats.memoryUsage / 1024 / 1024).toFixed(1)}MB`);
      status = status === 'healthy' ? 'warning' : status;
    }

    if (stats.totalEntries === 0) {
      issues.push('Cache is empty');
      status = 'warning';
    }

    return {
      status,
      uptime: Date.now() - this.startTime,
      metrics: stats,
      issues
    };
  }

  /**
   * Evaluar salud del monitoreo
   */
  private evaluateMonitoringHealth(stats: any): SystemStatus {
    const issues: string[] = [];
    let status: SystemStatus['status'] = 'healthy';

    if (stats.hitRate < 90) {
      issues.push(`Performance score below 90: ${stats.hitRate}`);
      status = 'warning';
    }

    if (stats.totalMisses > stats.totalHits) {
      issues.push('More misses than hits detected');
      status = 'warning';
    }

    return {
      status,
      uptime: Date.now() - this.startTime,
      metrics: stats,
      issues
    };
  }

  /**
   * Evaluar salud de la seguridad
   */
  private evaluateSecurityHealth(report: any): SystemStatus {
    const issues: string[] = [];
    let status: SystemStatus['status'] = 'healthy';

    const criticalViolations = report.violations.filter((v: any) => v.severity === 'critical').length;
    if (criticalViolations > 0) {
      issues.push(`${criticalViolations} critical security violations`);
      status = 'critical';
    }

    const totalViolations = report.stats.totalViolations;
    if (totalViolations > 10) {
      issues.push(`High number of security violations: ${totalViolations}`);
      status = status === 'healthy' ? 'warning' : status;
    }

    return {
      status,
      uptime: Date.now() - this.startTime,
      metrics: report.stats,
      issues
    };
  }

  /**
   * Evaluar salud del sistema offline
   */
  private evaluateOfflineHealth(swStatus: any): SystemStatus {
    const issues: string[] = [];
    let status: SystemStatus['status'] = 'healthy';

    if (swStatus.offlineQueue > 50) {
      issues.push(`Large offline queue: ${swStatus.offlineQueue} items`);
      status = 'warning';
    }

    if (swStatus.syncQueue > 20) {
      issues.push(`Large sync queue: ${swStatus.syncQueue} items`);
      status = status === 'healthy' ? 'warning' : status;
    }

    if (!swStatus.isOnline) {
      issues.push('Currently offline');
      status = 'warning';
    }

    return {
      status,
      uptime: Date.now() - this.startTime,
      metrics: swStatus,
      issues
    };
  }

  /**
   * Evaluar salud de los workers
   */
  private evaluateWorkersHealth(stats: any): SystemStatus {
    const issues: string[] = [];
    let status: SystemStatus['status'] = 'healthy';

    if (stats.queuedTasks > 100) {
      issues.push(`Large task queue: ${stats.queuedTasks} tasks`);
      status = 'warning';
    }

    if (stats.failedTasks > stats.completedTasks * 0.1) {
      issues.push(`High failure rate: ${((stats.failedTasks / stats.completedTasks) * 100).toFixed(1)}%`);
      status = 'warning';
    }

    if (stats.activeWorkers === 0 && stats.queuedTasks > 0) {
      issues.push('No active workers but tasks are queued');
      status = 'critical';
    }

    return {
      status,
      uptime: Date.now() - this.startTime,
      metrics: stats,
      issues
    };
  }

  /**
   * Generar recomendaciones basadas en salud del sistema
   */
  private generateRecommendations(systems: any, metrics: any): string[] {
    const recommendations: string[] = [];

    if (systems.cache.status !== 'healthy') {
      recommendations.push('Consider adjusting cache size or TTL settings');
    }

    if (systems.security.status === 'critical') {
      recommendations.push('URGENT: Review and address critical security violations');
    }

    if (metrics.performanceScore < 80) {
      recommendations.push('Performance optimization needed - check Core Web Vitals');
    }

    if (metrics.errorRate > 0.05) {
      recommendations.push('High error rate detected - investigate root causes');
    }

    if (metrics.memoryUsage > 100 * 1024 * 1024) {
      recommendations.push('High memory usage - consider cleanup or optimization');
    }

    if (systems.workers.status !== 'healthy') {
      recommendations.push('Worker pool issues detected - check task processing');
    }

    return recommendations;
  }

  /**
   * Merger configuración
   */
  private mergeConfig(defaultConfig: SystemConfig, userConfig?: Partial<SystemConfig>): SystemConfig {
    if (!userConfig) return defaultConfig;

    return {
      cache: { ...defaultConfig.cache, ...(userConfig.cache || {}) },
      monitoring: { ...defaultConfig.monitoring, ...(userConfig.monitoring || {}) },
      security: { ...defaultConfig.security, ...(userConfig.security || {}) },
      offline: { ...defaultConfig.offline, ...(userConfig.offline || {}) },
      workers: { ...defaultConfig.workers, ...(userConfig.workers || {}) }
    };
  }

  /**
   * Obtener métricas de integración
   */
  getIntegrationMetrics() {
    return {
      ...this.integrationMetrics,
      uptime: Date.now() - this.startTime,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Destruir integrador
   */
  async destroy(): Promise<void> {
    logger.info('💀 Destroying SystemIntegrator...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    await Promise.allSettled([
      globalWorkerManager.destroy(),
      globalServiceWorkerManager.destroy(),
      globalCacheManager.destroy(),
      globalPerformanceMonitor.destroy(),
      globalTelemetryService.destroy(),
      globalSecurityService.destroy()
    ]);

    this.isInitialized = false;
    logger.info('💀 SystemIntegrator destroyed');
  }
}

// Instancia global del integrador de sistemas
export const globalSystemIntegrator = new SystemIntegrator();

// Auto-inicializar en cliente
if (typeof window !== 'undefined') {
  globalSystemIntegrator.initialize();
}