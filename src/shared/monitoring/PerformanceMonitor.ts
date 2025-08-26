/**
 * Sistema de monitoreo de performance avanzado
 * Métricas en tiempo real, alertas automáticas y reporting
 */

import { logger } from '../utils/logger';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay  
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  
  // Custom metrics
  apiResponseTime: number[];
  renderTime: number[];
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
  userInteractions: number;
  
  // Session metrics
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  
  timestamp: number;
}

export interface PerformanceAlert {
  type: 'warning' | 'critical' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  actions?: string[];
}

export interface PerformanceReport {
  period: 'hourly' | 'daily' | 'weekly';
  metrics: PerformanceMetrics;
  trends: Record<string, number[]>;
  alerts: PerformanceAlert[];
  recommendations: string[];
  score: number;
}

interface PerformanceThresholds {
  lcp: { good: number; needs_improvement: number };
  fid: { good: number; needs_improvement: number };
  cls: { good: number; needs_improvement: number };
  apiResponseTime: { good: number; needs_improvement: number };
  errorRate: { good: number; needs_improvement: number };
  memoryUsage: { good: number; needs_improvement: number };
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, needs_improvement: 4000 },
  fid: { good: 100, needs_improvement: 300 },
  cls: { good: 0.1, needs_improvement: 0.25 },
  apiResponseTime: { good: 500, needs_improvement: 1000 },
  errorRate: { good: 1, needs_improvement: 5 },
  memoryUsage: { good: 50, needs_improvement: 100 }
};

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThresholds;
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;
  private sessionStartTime = Date.now();
  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];
  
  constructor(customThresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };
    this.metrics = this.initializeMetrics();
    
    if (typeof window !== 'undefined') {
      this.setupObservers();
      this.setupEventListeners();
    }
  }

  /**
   * Inicializar métricas base
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      apiResponseTime: [],
      renderTime: [],
      memoryUsage: 0,
      cacheHitRate: 0,
      errorRate: 0,
      userInteractions: 0,
      sessionDuration: 0,
      pageViews: 1,
      bounceRate: 0,
      timestamp: Date.now()
    };
  }

  /**
   * Configurar observadores de Web Vitals
   */
  private setupObservers(): void {
    try {
      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.updateMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.updateMetric('fid', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.updateMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);

        // Navigation timing
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.responseStart) {
              this.updateMetric('ttfb', entry.responseStart - entry.requestStart);
            }
            if (entry.loadEventStart) {
              this.updateMetric('fcp', entry.loadEventStart - entry.navigationStart);
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      }

      logger.debug('📊 Performance observers configured');
    } catch (error) {
      logger.warn('⚠️ Some performance observers not supported:', error);
    }
  }

  /**
   * Configurar listeners de eventos
   */
  private setupEventListeners(): void {
    // Memory usage monitoring
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        this.updateMetric('memoryUsage', usedMB);
      }, 10000); // Cada 10 segundos
    }

    // Session duration
    setInterval(() => {
      this.metrics.sessionDuration = Date.now() - this.sessionStartTime;
    }, 5000);

    // Page visibility para bounce rate
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.calculateBounceRate();
      }
    });

    // User interactions
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.metrics.userInteractions++;
      });
    });

    logger.debug('📊 Performance event listeners configured');
  }

  /**
   * Actualizar métrica específica
   */
  private updateMetric(name: keyof PerformanceMetrics, value: number): void {
    if (name === 'apiResponseTime' || name === 'renderTime') {
      const array = this.metrics[name] as number[];
      array.push(value);
      
      // Mantener solo las últimas 100 mediciones
      if (array.length > 100) {
        array.shift();
      }
    } else {
      (this.metrics as any)[name] = value;
    }

    this.checkThresholds(name, value);
    this.notifyListeners();
    
    logger.debug('📊 Performance metric updated:', { name, value });
  }

  /**
   * Verificar umbrales y generar alertas
   */
  private checkThresholds(metric: string, value: number): void {
    const threshold = this.thresholds[metric as keyof PerformanceThresholds];
    if (!threshold) return;

    let alertType: PerformanceAlert['type'] | null = null;
    let message = '';
    let actions: string[] = [];

    if (value > threshold.needs_improvement) {
      alertType = 'critical';
      message = `${metric} crítico: ${value} > ${threshold.needs_improvement}`;
      actions = this.getRecommendations(metric, 'critical');
    } else if (value > threshold.good) {
      alertType = 'warning';
      message = `${metric} necesita mejora: ${value} > ${threshold.good}`;
      actions = this.getRecommendations(metric, 'warning');
    }

    if (alertType) {
      const alert: PerformanceAlert = {
        type: alertType,
        metric,
        value,
        threshold: threshold.good,
        message,
        timestamp: Date.now(),
        actions
      };

      this.alerts.push(alert);
      
      // Mantener solo las últimas 50 alertas
      if (this.alerts.length > 50) {
        this.alerts.shift();
      }

      logger.warn(`⚠️ Performance Alert [${alertType}]:`, alert);
    }
  }

  /**
   * Obtener recomendaciones por métrica
   */
  private getRecommendations(metric: string, severity: 'warning' | 'critical'): string[] {
    const recommendations: Record<string, Record<string, string[]>> = {
      lcp: {
        warning: ['Optimizar imágenes', 'Usar CDN', 'Preload recursos críticos'],
        critical: ['Revisar server response time', 'Implementar lazy loading', 'Optimizar CSS crítico']
      },
      fid: {
        warning: ['Reducir JavaScript blocking', 'Usar web workers'],
        critical: ['Dividir bundles', 'Defer scripts no críticos', 'Optimizar event handlers']
      },
      cls: {
        warning: ['Definir dimensiones de imágenes', 'Usar font-display swap'],
        critical: ['Evitar inserción dinámica de contenido', 'Reservar espacio para ads']
      },
      apiResponseTime: {
        warning: ['Implementar caching', 'Optimizar queries'],
        critical: ['Revisar backend performance', 'Implementar CDN', 'Usar connection pooling']
      },
      memoryUsage: {
        warning: ['Revisar memory leaks', 'Optimizar imágenes en memoria'],
        critical: ['Implementar garbage collection manual', 'Reducir cache size']
      }
    };

    return recommendations[metric]?.[severity] || ['Revisar documentación de performance'];
  }

  /**
   * Calcular bounce rate
   */
  private calculateBounceRate(): void {
    if (this.metrics.userInteractions < 2 && this.metrics.sessionDuration < 30000) {
      this.metrics.bounceRate = 1;
    } else {
      this.metrics.bounceRate = 0;
    }
  }

  /**
   * Registrar tiempo de respuesta API
   */
  recordApiResponseTime(duration: number, endpoint?: string): void {
    this.updateMetric('apiResponseTime', duration);
    
    if (endpoint) {
      logger.debug('🌐 API Response Time:', { endpoint, duration });
    }
  }

  /**
   * Registrar tiempo de render
   */
  recordRenderTime(componentName: string, duration: number): void {
    this.updateMetric('renderTime', duration);
    
    logger.debug('🎨 Render Time:', { componentName, duration });
  }

  /**
   * Registrar hit rate del cache
   */
  recordCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
    
    if (hitRate < 80) {
      this.checkThresholds('cacheHitRate', hitRate);
    }
  }

  /**
   * Registrar tasa de errores
   */
  recordError(error: Error, context?: string): void {
    this.metrics.errorRate++;
    
    logger.error('❌ Performance Error recorded:', { error: error.message, context });
  }

  /**
   * Obtener métricas actuales
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtener alertas activas
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Limpiar alertas
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Generar reporte de performance
   */
  generateReport(period: 'hourly' | 'daily' | 'weekly' = 'hourly'): PerformanceReport {
    const score = this.calculatePerformanceScore();
    const trends = this.calculateTrends();
    const recommendations = this.generateRecommendations();

    const report: PerformanceReport = {
      period,
      metrics: this.getMetrics(),
      trends,
      alerts: this.getAlerts(),
      recommendations,
      score
    };

    logger.info('📊 Performance Report generated:', { score, period });
    return report;
  }

  /**
   * Calcular score de performance
   */
  private calculatePerformanceScore(): number {
    let score = 100;
    const metrics = this.metrics;

    // Core Web Vitals (60% del score)
    if (metrics.lcp !== null) {
      if (metrics.lcp > this.thresholds.lcp.needs_improvement) score -= 20;
      else if (metrics.lcp > this.thresholds.lcp.good) score -= 10;
    }

    if (metrics.fid !== null) {
      if (metrics.fid > this.thresholds.fid.needs_improvement) score -= 15;
      else if (metrics.fid > this.thresholds.fid.good) score -= 8;
    }

    if (metrics.cls !== null) {
      if (metrics.cls > this.thresholds.cls.needs_improvement) score -= 15;
      else if (metrics.cls > this.thresholds.cls.good) score -= 8;
    }

    // API Performance (20% del score)
    const avgApiTime = metrics.apiResponseTime.length > 0 
      ? metrics.apiResponseTime.reduce((a, b) => a + b, 0) / metrics.apiResponseTime.length 
      : 0;
    
    if (avgApiTime > this.thresholds.apiResponseTime.needs_improvement) score -= 15;
    else if (avgApiTime > this.thresholds.apiResponseTime.good) score -= 8;

    // Memory Usage (10% del score)
    if (metrics.memoryUsage > this.thresholds.memoryUsage.needs_improvement) score -= 8;
    else if (metrics.memoryUsage > this.thresholds.memoryUsage.good) score -= 4;

    // Error Rate (10% del score)
    if (metrics.errorRate > this.thresholds.errorRate.needs_improvement) score -= 8;
    else if (metrics.errorRate > this.thresholds.errorRate.good) score -= 4;

    return Math.max(0, Math.round(score));
  }

  /**
   * Calcular tendencias
   */
  private calculateTrends(): Record<string, number[]> {
    return {
      apiResponseTime: [...this.metrics.apiResponseTime],
      renderTime: [...this.metrics.renderTime],
      memoryUsage: [this.metrics.memoryUsage],
      errorRate: [this.metrics.errorRate],
      cacheHitRate: [this.metrics.cacheHitRate]
    };
  }

  /**
   * Generar recomendaciones
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const score = this.calculatePerformanceScore();

    if (score < 90) {
      recommendations.push('Implementar lazy loading para imágenes');
      recommendations.push('Optimizar bundle splitting');
      recommendations.push('Revisar cache strategies');
    }

    if (score < 80) {
      recommendations.push('Implementar Service Worker');
      recommendations.push('Optimizar Critical Rendering Path');
      recommendations.push('Usar CDN para assets estáticos');
    }

    if (score < 70) {
      recommendations.push('Revisar arquitectura de componentes');
      recommendations.push('Implementar code splitting agresivo');
      recommendations.push('Optimizar queries de base de datos');
    }

    if (this.alerts.filter(a => a.type === 'critical').length > 0) {
      recommendations.push('Atender alertas críticas inmediatamente');
    }

    return recommendations;
  }

  /**
   * Suscribirse a cambios de métricas
   */
  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notificar listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.metrics);
      } catch (error) {
        logger.error('❌ Error notifying performance listener:', error);
      }
    });
  }

  /**
   * Iniciar monitoreo
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    logger.info('🚀 Performance monitoring started');
  }

  /**
   * Detener monitoreo
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
    
    logger.info('⏹️ Performance monitoring stopped');
  }

  /**
   * Destruir instancia
   */
  destroy(): void {
    this.stop();
    this.listeners = [];
    this.alerts = [];
    logger.info('💀 Performance monitor destroyed');
  }
}

// Instancia global del monitor de performance
export const globalPerformanceMonitor = new PerformanceMonitor();

// Auto-start en cliente
if (typeof window !== 'undefined') {
  globalPerformanceMonitor.start();
}