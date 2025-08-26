/**
 * Sistema de telemetría avanzado para analytics y debugging
 * Recolección automática de eventos, errores y métricas de usuario
 */

import { logger } from '../utils/logger';
import { globalPerformanceMonitor } from './PerformanceMonitor';

export interface TelemetryEvent {
  id: string;
  type: 'user_action' | 'system_event' | 'error' | 'performance' | 'business';
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  locale: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  errors: number;
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
    screenResolution: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableUserTracking: boolean;
  sampleRate: number;
  excludePatterns?: RegExp[];
}

const DEFAULT_CONFIG: TelemetryConfig = {
  enabled: true,
  batchSize: 50,
  flushInterval: 10000, // 10 segundos
  maxRetries: 3,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  enableUserTracking: true,
  sampleRate: 1.0, // 100%
  excludePatterns: [
    /\/health$/,
    /\/ping$/,
    /\.(css|js|png|jpg|gif|ico|svg)$/
  ]
};

export class TelemetryService {
  private config: TelemetryConfig;
  private events: TelemetryEvent[] = [];
  private session: UserSession;
  private flushTimer?: NodeJS.Timeout;
  private isInitialized = false;
  private eventId = 0;

  constructor(config?: Partial<TelemetryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.session = this.createSession();
    
    if (typeof window !== 'undefined' && this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Inicializar servicio de telemetría
   */
  private initialize(): void {
    if (this.isInitialized) return;

    // Configurar recolección automática
    this.setupAutoTracking();
    
    // Configurar flush automático
    this.startFlushTimer();
    
    // Event listeners para cleanup
    window.addEventListener('beforeunload', () => this.flush());
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });

    this.isInitialized = true;
    this.track('system_event', 'telemetry', 'initialized', undefined, {
      config: this.config,
      sessionId: this.session.id
    });

    logger.info('📊 Telemetry service initialized:', {
      sessionId: this.session.id,
      sampleRate: this.config.sampleRate
    });
  }

  /**
   * Crear nueva sesión
   */
  private createSession(): UserSession {
    const session: UserSession = {
      id: this.generateId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 1,
      events: 0,
      errors: 0,
      device: this.detectDevice()
    };

    // Intentar obtener geolocalización si está disponible
    this.detectLocation().then(location => {
      if (location) {
        session.location = location;
      }
    });

    return session;
  }

  /**
   * Detectar información del dispositivo
   */
  private detectDevice(): UserSession['device'] {
    const ua = navigator.userAgent;
    
    // Tipo de dispositivo
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobile|Android|iPhone|iPad/.test(ua)) {
      type = /iPad|Tablet/.test(ua) ? 'tablet' : 'mobile';
    }

    // Browser
    let browser = 'unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // OS
    let os = 'unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return {
      type,
      browser,
      os,
      screenResolution: `${screen.width}x${screen.height}`
    };
  }

  /**
   * Detectar ubicación (si está disponible y permitido)
   */
  private async detectLocation(): Promise<UserSession['location'] | null> {
    try {
      // Usar API de geolocalización del navegador (requiere permiso)
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // En un caso real, harías reverse geocoding
              resolve({
                country: 'Unknown',
                region: 'Unknown',
                city: 'Unknown'
              });
            },
            () => resolve(null),
            { timeout: 5000 }
          );
        });
      }

      return null;
    } catch (error) {
      logger.debug('🌍 Location detection failed:', error);
      return null;
    }
  }

  /**
   * Configurar tracking automático
   */
  private setupAutoTracking(): void {
    if (!this.config.enabled) return;

    // Page views
    this.trackPageView();

    // User interactions
    if (this.config.enableUserTracking) {
      this.setupUserInteractionTracking();
    }

    // Errors
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Performance
    if (this.config.enablePerformanceTracking) {
      this.setupPerformanceTracking();
    }

    logger.debug('📊 Auto-tracking configured');
  }

  /**
   * Track page view
   */
  private trackPageView(): void {
    const url = window.location.href;
    
    // Verificar si debe ser excluida
    if (this.shouldExcludeUrl(url)) return;

    this.track('user_action', 'navigation', 'page_view', url, {
      referrer: document.referrer,
      title: document.title
    });

    this.session.pageViews++;
  }

  /**
   * Configurar tracking de interacciones de usuario
   */
  private setupUserInteractionTracking(): void {
    // Clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const id = target.id;
      const className = target.className;
      
      this.track('user_action', 'interaction', 'click', tagName, {
        id,
        className,
        text: target.textContent?.slice(0, 100),
        href: tagName === 'a' ? (target as HTMLAnchorElement).href : undefined
      });
    }, true);

    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      
      this.track('user_action', 'form', 'submit', form.id || form.className, {
        action: form.action,
        method: form.method
      });
    }, true);

    // Input focus/blur para medir engagement
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'input') {
        this.track('user_action', 'form', 'input_focus', target.id || target.type);
      }
    }, true);

    logger.debug('👆 User interaction tracking configured');
  }

  /**
   * Configurar tracking de errores
   */
  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      );
    });

    logger.debug('❌ Error tracking configured');
  }

  /**
   * Configurar tracking de performance
   */
  private setupPerformanceTracking(): void {
    // Suscribirse a métricas de performance
    globalPerformanceMonitor.subscribe((metrics) => {
      this.track('performance', 'metrics', 'update', undefined, {
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        memoryUsage: metrics.memoryUsage,
        cacheHitRate: metrics.cacheHitRate
      });
    });

    // Resource timing
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.initiatorType && entry.duration > 100) {
            this.track('performance', 'resource', entry.initiatorType, entry.name, {
              duration: entry.duration,
              size: entry.transferSize,
              cached: entry.transferSize === 0
            });
          }
        });
      });
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        logger.debug('⚠️ Resource observer not supported');
      }
    }

    logger.debug('⚡ Performance tracking configured');
  }

  /**
   * Track evento personalizado
   */
  track(
    type: TelemetryEvent['type'],
    category: string,
    action: string,
    label?: string,
    properties?: Record<string, any>,
    value?: number
  ): void {
    if (!this.config.enabled || !this.shouldSample()) return;

    const event: TelemetryEvent = {
      id: this.generateId(),
      type,
      category,
      action,
      label,
      value,
      properties,
      userId: this.session.userId,
      sessionId: this.session.id,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      locale: navigator.language
    };

    this.events.push(event);
    this.session.events++;
    this.session.lastActivity = Date.now();

    // Flush si alcanzamos el batch size
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }

    logger.activity('📊 Telemetry event tracked:', {
      type,
      category,
      action,
      eventsQueued: this.events.length
    });
  }

  /**
   * Track error específicamente
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.session.errors++;
    
    this.track('error', 'javascript', 'error', error.message, {
      name: error.name,
      stack: error.stack,
      ...context
    });

    // También registrar en performance monitor
    globalPerformanceMonitor.recordError(error, JSON.stringify(context));

    logger.error('❌ Error tracked:', { error: error.message, context });
  }

  /**
   * Track evento de negocio
   */
  trackBusinessEvent(
    action: string,
    category: string = 'business',
    properties?: Record<string, any>
  ): void {
    this.track('business', category, action, undefined, properties);
  }

  /**
   * Track conversión o goal
   */
  trackConversion(goalName: string, value?: number, properties?: Record<string, any>): void {
    this.track('business', 'conversion', goalName, undefined, properties, value);
  }

  /**
   * Identificar usuario
   */
  identify(userId: string, properties?: Record<string, any>): void {
    this.session.userId = userId;
    
    this.track('system_event', 'user', 'identify', userId, properties);
    
    logger.info('👤 User identified:', { userId, sessionId: this.session.id });
  }

  /**
   * Flush eventos al servidor
   */
  async flush(): Promise<void> {
    if (this.events.length === 0 || !this.config.endpoint) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      const payload = {
        session: this.session,
        events: eventsToSend,
        timestamp: Date.now()
      };

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true // Para que funcione en beforeunload
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.debug('📤 Telemetry events sent:', { 
        count: eventsToSend.length,
        sessionId: this.session.id 
      });

    } catch (error) {
      logger.error('❌ Failed to send telemetry events:', error);
      
      // Re-agregar eventos si falla (con límite para evitar memory leaks)
      if (this.events.length < 500) {
        this.events.unshift(...eventsToSend);
      }
    }
  }

  /**
   * Verificar si URL debe ser excluida
   */
  private shouldExcludeUrl(url: string): boolean {
    if (!this.config.excludePatterns) return false;
    
    return this.config.excludePatterns.some(pattern => pattern.test(url));
  }

  /**
   * Verificar si debe hacer sampling
   */
  private shouldSample(): boolean {
    return Math.random() <= this.config.sampleRate;
  }

  /**
   * Generar ID único
   */
  private generateId(): string {
    return `${Date.now()}_${++this.eventId}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Iniciar timer de flush
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Obtener estadísticas de la sesión
   */
  getSessionStats(): UserSession {
    return { ...this.session };
  }

  /**
   * Obtener eventos en cola
   */
  getQueuedEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  /**
   * Actualizar configuración
   */
  updateConfig(config: Partial<TelemetryConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.flushInterval && this.flushTimer) {
      this.startFlushTimer();
    }

    logger.info('⚙️ Telemetry config updated:', config);
  }

  /**
   * Destruir servicio
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush final
    this.flush();
    
    this.events = [];
    this.isInitialized = false;
    
    logger.info('💀 Telemetry service destroyed');
  }
}

// Instancia global del servicio de telemetría
export const globalTelemetryService = new TelemetryService({
  endpoint: `${import.meta.env.VITE_API_BASE_URL}/api/telemetry`,
  enabled: import.meta.env.PROD, // Solo en producción por defecto
  sampleRate: parseFloat(import.meta.env.VITE_TELEMETRY_SAMPLE_RATE || '1.0')
});

// Helpers para uso fácil
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  properties?: Record<string, any>
) => {
  globalTelemetryService.track('user_action', category, action, label, properties);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  globalTelemetryService.trackError(error, context);
};

export const trackBusinessEvent = (
  action: string,
  category: string = 'business',
  properties?: Record<string, any>
) => {
  globalTelemetryService.trackBusinessEvent(action, category, properties);
};