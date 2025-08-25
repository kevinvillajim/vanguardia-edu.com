import { ApiClient } from '../infrastructure/api/ApiClient';
import { useAuthStore } from '../shared/store/authStore';
import { 
  ActivityConfig, 
  getActivityConfigForRole, 
  formatActivityTime as formatTime 
} from '../config';
import { logger } from '../shared/utils/logger';

class UserActivityService {
  private lastActivityTime: number = Date.now();
  private windowFocusTime: number = Date.now();
  private inactivityTimer: NodeJS.Timeout | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private tokenCheckTimer: NodeJS.Timeout | null = null;
  private isListening: boolean = false;
  private isWindowFocused: boolean = true;
  private config: ActivityConfig;
  private apiClient: ApiClient;
  private tokenRefreshRetries: number = 0;
  private maxTokenRefreshRetries: number = 3;
  private isRefreshingToken: boolean = false;
  private lastTokenCheck: number = 0;

  constructor() {
    // Usar configuración por defecto, se actualizará cuando se inicie el monitoreo
    this.config = getActivityConfigForRole();
    this.apiClient = new ApiClient();
  }

  /**
   * Iniciar el monitoreo de actividad
   */
  startMonitoring(userRole?: string, customConfig?: Partial<ActivityConfig>): void {
    if (this.isListening) {
      this.stopMonitoring();
    }

    // Obtener configuración específica para el rol del usuario
    this.config = getActivityConfigForRole(userRole);
    
    // Aplicar configuración personalizada si se proporciona
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
    
    this.lastActivityTime = Date.now();
    this.windowFocusTime = Date.now();
    this.isWindowFocused = !document.hidden;
    this.isListening = true;
    this.tokenRefreshRetries = 0; // Reset retry counter
    this.lastTokenCheck = 0; // Reset token check throttling

    logger.info('🔍 UserActivityService: Iniciando monitoreo de actividad', {
      userRole: userRole || 'default',
      inactivityTimeout: formatTime(this.config.inactivityTimeout),
      refreshBuffer: formatTime(this.config.refreshBuffer),
      focusGracePeriod: formatTime(this.config.focusGracePeriod || 0),
      events: this.config.activityEvents.length
    });

    // Registrar listeners de eventos
    this.registerEventListeners();
    
    // Iniciar timers
    this.scheduleInactivityCheck();
    this.scheduleTokenRefresh();
    this.startTokenCheck();
  }

  /**
   * Detener el monitoreo de actividad
   */
  stopMonitoring(): void {
    if (!this.isListening) return;

    logger.info('⏹️ UserActivityService: Deteniendo monitoreo');
    
    this.isListening = false;
    this.removeEventListeners();
    
    // Limpiar todos los timers
    [this.inactivityTimer, this.tokenRefreshTimer, this.tokenCheckTimer].forEach(timer => {
      if (timer) {
        clearTimeout(timer);
      }
    });
    
    this.inactivityTimer = null;
    this.tokenRefreshTimer = null;
    this.tokenCheckTimer = null;
  }

  /**
   * Registrar actividad manual (para actividades específicas de la app)
   */
  recordActivity(): void {
    if (!this.isListening) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;
    
    // Solo actualizar si ha pasado más del throttle configurado (evitar spam)
    if (timeSinceLastActivity > (this.config.activityThrottle || 1000)) {
      this.lastActivityTime = now;
      
      logger.activity('UserActivityService: Actividad registrada', {
        timeSinceLastActivity: formatTime(timeSinceLastActivity),
        windowFocused: this.isWindowFocused
      });
      
      // Reiniciar timer de inactividad
      this.scheduleInactivityCheck();
    }
  }

  /**
   * Obtener tiempo desde la última actividad
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivityTime;
  }

  /**
   * Verificar si el usuario está activo
   */
  isUserActive(): boolean {
    const timeSinceLastActivity = this.getTimeSinceLastActivity();
    const timeSinceFocus = Date.now() - this.windowFocusTime;
    
    // Si la ventana no está enfocada, dar un período de gracia
    if (!this.isWindowFocused) {
      const gracePeriod = this.config.focusGracePeriod || 0;
      return timeSinceFocus < gracePeriod;
    }
    
    return timeSinceLastActivity < this.config.inactivityTimeout;
  }

  /**
   * Obtener estadísticas de actividad
   */
  getActivityStats() {
    const timeSinceLastActivity = this.getTimeSinceLastActivity();
    const timeSinceFocus = Date.now() - this.windowFocusTime;
    
    return {
      lastActivity: formatTime(timeSinceLastActivity),
      lastFocus: formatTime(timeSinceFocus),
      isActive: this.isUserActive(),
      isWindowFocused: this.isWindowFocused,
      isListening: this.isListening,
      config: {
        inactivityTimeout: formatTime(this.config.inactivityTimeout),
        refreshBuffer: formatTime(this.config.refreshBuffer),
        focusGracePeriod: formatTime(this.config.focusGracePeriod || 0)
      }
    };
  }

  /**
   * Registrar listeners de eventos DOM
   */
  private registerEventListeners(): void {
    this.config.activityEvents.forEach(eventName => {
      document.addEventListener(eventName, this.handleActivity, true);
    });
    
    // Listener especial para cuando la ventana vuelve a tener foco
    window.addEventListener('focus', this.handleWindowFocus);
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Remover listeners de eventos DOM
   */
  private removeEventListeners(): void {
    this.config.activityEvents.forEach(eventName => {
      document.removeEventListener(eventName, this.handleActivity, true);
    });
    
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Handler de actividad (throttled)
   */
  private handleActivity = (): void => {
    this.recordActivity();
  };

  /**
   * Handler cuando la ventana recibe foco
   */
  private handleWindowFocus = (): void => {
    const wasUnfocused = !this.isWindowFocused;
    this.isWindowFocused = true;
    this.windowFocusTime = Date.now();
    
    logger.debug('👀 UserActivityService: Ventana enfocada', {
      wasUnfocused,
      timeUnfocused: wasUnfocused ? formatTime(Date.now() - this.windowFocusTime) : '0s'
    });
    
    this.recordActivity();
    this.checkTokenRefresh();
  };

  /**
   * Handler cuando la ventana pierde foco
   */
  private handleWindowBlur = (): void => {
    this.isWindowFocused = false;
    logger.debug('😴 UserActivityService: Ventana sin foco');
  };

  /**
   * Handler de cambio de visibilidad
   */
  private handleVisibilityChange = (): void => {
    const isVisible = !document.hidden;
    
    if (isVisible && !this.isWindowFocused) {
      // Página se vuelve visible
      this.isWindowFocused = true;
      this.windowFocusTime = Date.now();
      logger.debug('👀 UserActivityService: Página visible');
      this.recordActivity();
      this.checkTokenRefresh();
    } else if (!isVisible && this.isWindowFocused) {
      // Página se oculta
      this.isWindowFocused = false;
      logger.debug('😴 UserActivityService: Página oculta');
    }
  };

  /**
   * Programar verificación de inactividad
   */
  private scheduleInactivityCheck(): void {
    // Limpiar timer existente
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, this.config.inactivityTimeout);
  }

  /**
   * Iniciar verificaciones periódicas del token
   */
  private startTokenCheck(): void {
    const checkInterval = this.config.tokenCheckInterval || 30000; // 30 segundos por defecto
    
    this.tokenCheckTimer = setTimeout(() => {
      this.performTokenCheck();
      if (this.isListening) {
        this.startTokenCheck(); // Reprogramar
      }
    }, checkInterval);
  }

  /**
   * Realizar verificación del token
   */
  private performTokenCheck(): void {
    const authStore = useAuthStore.getState();
    const token = authStore.token;
    
    if (!token) return;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Log periódico del estado (solo debugging por ser repetitivo)
      logger.debug('🔍 UserActivityService: Verificación de token', {
        timeUntilExpiration: formatTime(timeUntilExpiration),
        refreshBuffer: formatTime(this.config.refreshBuffer),
        userActive: this.isUserActive()
      });
      
      // Si el token está cerca de expirar y hay actividad, renovar
      // Agregar verificación adicional para evitar múltiples renovaciones simultáneas
      if (timeUntilExpiration <= this.config.refreshBuffer && 
          this.isUserActive() && 
          this.tokenRefreshRetries < this.maxTokenRefreshRetries &&
          !this.isRefreshingToken) {
        logger.auth('UserActivityService: Token necesita renovación');
        this.handleTokenRefresh();
      }
    } catch (error) {
      logger.error('❌ Error en verificación de token:', error);
    }
  }

  /**
   * Manejar inactividad del usuario
   */
  private handleInactivity(): void {
    // Verificar si realmente está inactivo considerando el foco de la ventana
    if (this.isUserActive()) {
      logger.debug('✅ UserActivityService: Usuario aún activo, reprogramando verificación');
      this.scheduleInactivityCheck();
      return;
    }

    const timeSinceLastActivity = this.getTimeSinceLastActivity();
    const timeSinceFocus = Date.now() - this.windowFocusTime;
    
    logger.debug('⏰ UserActivityService: Verificando inactividad', {
      timeSinceLastActivity: formatTime(timeSinceLastActivity),
      timeSinceFocus: formatTime(timeSinceFocus),
      threshold: formatTime(this.config.inactivityTimeout),
      windowFocused: this.isWindowFocused,
      gracePeriod: formatTime(this.config.focusGracePeriod || 0)
    });

    logger.warn('😴 UserActivityService: Usuario inactivo, cerrando sesión');
    this.handleInactiveLogout();
  }

  /**
   * Cerrar sesión por inactividad
   */
  private async handleInactiveLogout(): void {
    try {
      // Mostrar notificación al usuario
      if ('Notification' in window) {
        new Notification('Sesión cerrada', {
          body: 'Tu sesión se cerró por inactividad. Por favor, inicia sesión nuevamente.',
          icon: '/favicon.ico'
        });
      }
      
      // Cerrar sesión
      const authStore = useAuthStore.getState();
      await authStore.logout();
      
      logger.warn('👋 UserActivityService: Sesión cerrada por inactividad');
    } catch (error) {
      logger.error('❌ Error cerrando sesión por inactividad:', error);
    }
  }

  /**
   * Programar renovación de token
   */
  private scheduleTokenRefresh(): void {
    const authStore = useAuthStore.getState();
    const token = authStore.token;
    
    if (!token) return;
    
    try {
      // Decodificar el token para obtener la fecha de expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir a ms
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      const timeUntilRefresh = timeUntilExpiration - this.config.refreshBuffer;
      
      logger.auth('UserActivityService: Programando renovación de token', {
        expiresIn: timeUntilExpiration / 1000 / 60 + ' min',
        refreshIn: Math.max(0, timeUntilRefresh) / 1000 / 60 + ' min'
      });
      
      // Solo programar si el tiempo es positivo
      if (timeUntilRefresh > 0) {
        // Limpiar timer existente
        if (this.tokenRefreshTimer) {
          clearTimeout(this.tokenRefreshTimer);
        }
        
        this.tokenRefreshTimer = setTimeout(() => {
          this.handleTokenRefresh();
        }, timeUntilRefresh);
      } else {
        // Token expira pronto, intentar renovar inmediatamente
        this.handleTokenRefresh();
      }
    } catch (error) {
      logger.error('❌ Error programando renovación de token:', error);
    }
  }

  /**
   * Verificar si necesitamos renovar el token ahora (con throttling)
   */
  private checkTokenRefresh(): void {
    const currentTime = Date.now();
    const timeSinceLastCheck = currentTime - this.lastTokenCheck;
    
    // Solo verificar una vez cada 2 minutos para evitar spam
    if (timeSinceLastCheck < 2 * 60 * 1000) {
      return;
    }
    
    this.lastTokenCheck = currentTime;
    
    const authStore = useAuthStore.getState();
    const token = authStore.token;
    
    if (!token) return;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Si el token expira dentro del buffer de tiempo, renovar
      if (timeUntilExpiration <= this.config.refreshBuffer) {
        logger.auth('🔄 UserActivityService: Token expira pronto, renovando');
        this.handleTokenRefresh();
      }
    } catch (error) {
      logger.error('❌ Error verificando renovación de token:', error);
    }
  }

  /**
   * Manejar renovación de token
   */
  private async handleTokenRefresh(): void {
    const authStore = useAuthStore.getState();
    
    // Solo renovar si hay actividad reciente
    if (!this.isUserActive()) {
      logger.debug('😴 UserActivityService: No hay actividad reciente, no renovando token');
      return;
    }
    
    // Evitar renovaciones simultáneas
    if (this.isRefreshingToken) {
      logger.debug('🔄 UserActivityService: Ya hay una renovación en progreso, saltando');
      return;
    }
    
    // Verificar límite de reintentos
    if (this.tokenRefreshRetries >= this.maxTokenRefreshRetries) {
      logger.error('❌ UserActivityService: Límite de reintentos de token alcanzado, cerrando sesión');
      this.handleInactiveLogout();
      return;
    }
    
    this.isRefreshingToken = true;
    
    try {
      logger.auth('🔄 UserActivityService: Renovando token por actividad del usuario', {
        attempt: this.tokenRefreshRetries + 1,
        maxAttempts: this.maxTokenRefreshRetries
      });
      
      // Usar el sistema de renovación del ApiClient
      await authStore.refreshUser();
      
      // Resetear contador de reintentos en caso de éxito
      this.tokenRefreshRetries = 0;
      
      // Reprogramar la siguiente renovación
      this.scheduleTokenRefresh();
      
      logger.auth('✅ UserActivityService: Token renovado exitosamente');
    } catch (error) {
      this.tokenRefreshRetries++;
      logger.error('❌ UserActivityService: Error renovando token:', {
        error,
        attempt: this.tokenRefreshRetries,
        maxAttempts: this.maxTokenRefreshRetries
      });
      
      // Si no hemos alcanzado el límite y el usuario está activo, reintentar
      if (this.tokenRefreshRetries < this.maxTokenRefreshRetries && this.isUserActive()) {
        const retryDelay = Math.min(30000 * this.tokenRefreshRetries, 120000); // Backoff exponencial máx 2 min
        logger.debug(`🔄 UserActivityService: Reintentando renovación en ${retryDelay / 1000}s`);
        
        setTimeout(() => {
          this.handleTokenRefresh();
        }, retryDelay);
      } else {
        // Si alcanzamos el límite o no hay actividad, cerrar sesión
        logger.warn('🚨 UserActivityService: Cerrando sesión por fallos consecutivos en renovación');
        this.handleInactiveLogout();
      }
    } finally {
      this.isRefreshingToken = false;
    }
  }
}

// Singleton instance
export const userActivityService = new UserActivityService();
export default userActivityService;