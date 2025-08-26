/**
 * Sistema de rate limiting avanzado para prevenir abuse
 * Múltiples estrategias: sliding window, token bucket, circuit breaker
 */

import { logger } from '../utils/logger';

export interface RateLimitConfig {
  // Sliding Window Rate Limiting
  requests: number;
  windowMs: number;
  
  // Token Bucket
  tokensPerInterval?: number;
  interval?: number;
  bucketSize?: number;
  
  // Circuit Breaker
  failureThreshold?: number;
  successThreshold?: number;
  timeout?: number;
  
  // Configuración general
  keyGenerator?: (identifier: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (identifier: string, limit: RateLimitInfo) => void;
  onReset?: (identifier: string) => void;
}

export interface RateLimitInfo {
  totalRequests: number;
  remainingRequests: number;
  resetTime: number;
  retryAfter: number;
  isBlocked: boolean;
  reason: string;
}

export interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number;
  refillInterval: number;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  successes: number;
  lastFailure: number;
  nextAttempt: number;
}

interface RateLimitEntry {
  requests: number[];
  bucket?: TokenBucket;
  circuitBreaker?: CircuitBreakerState;
  createdAt: number;
  lastRequest: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly config: Required<RateLimitConfig>;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.config = {
      requests: config.requests,
      windowMs: config.windowMs,
      tokensPerInterval: config.tokensPerInterval || config.requests,
      interval: config.interval || config.windowMs,
      bucketSize: config.bucketSize || config.requests * 2,
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 2,
      timeout: config.timeout || 60000, // 1 minuto
      keyGenerator: config.keyGenerator || ((id: string) => id),
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      onLimitReached: config.onLimitReached || (() => {}),
      onReset: config.onReset || (() => {})
    };

    this.startCleanupTimer();

    logger.debug('🛡️ Rate limiter initialized:', {
      requests: this.config.requests,
      windowMs: this.config.windowMs,
      strategy: this.getStrategy()
    });
  }

  /**
   * Verificar si una request está permitida
   */
  async isAllowed(identifier: string, increment = true): Promise<{
    allowed: boolean;
    info: RateLimitInfo;
  }> {
    const key = this.config.keyGenerator(identifier);
    const now = Date.now();
    
    let entry = this.store.get(key);
    if (!entry) {
      entry = this.createEntry(now);
      this.store.set(key, entry);
    }

    // Limpiar requests antiguas (sliding window)
    this.cleanupWindow(entry, now);

    // Verificar circuit breaker
    if (entry.circuitBreaker) {
      const cbResult = this.checkCircuitBreaker(entry.circuitBreaker, now);
      if (!cbResult.allowed) {
        return {
          allowed: false,
          info: {
            totalRequests: entry.requests.length,
            remainingRequests: 0,
            resetTime: cbResult.nextAttempt,
            retryAfter: Math.ceil((cbResult.nextAttempt - now) / 1000),
            isBlocked: true,
            reason: 'Circuit breaker is open'
          }
        };
      }
    }

    // Verificar token bucket si está configurado
    if (entry.bucket) {
      this.refillBucket(entry.bucket, now);
      if (entry.bucket.tokens < 1) {
        return {
          allowed: false,
          info: this.createLimitInfo(entry, now, 'Token bucket depleted')
        };
      }
    }

    // Verificar sliding window
    const slidingWindowAllowed = entry.requests.length < this.config.requests;

    if (!slidingWindowAllowed) {
      this.config.onLimitReached(identifier, this.createLimitInfo(entry, now, 'Rate limit exceeded'));
      
      return {
        allowed: false,
        info: this.createLimitInfo(entry, now, 'Rate limit exceeded')
      };
    }

    // Si está permitido e increment=true, registrar la request
    if (increment) {
      entry.requests.push(now);
      entry.lastRequest = now;
      
      // Consumir token si hay bucket
      if (entry.bucket) {
        entry.bucket.tokens = Math.max(0, entry.bucket.tokens - 1);
      }
    }

    return {
      allowed: true,
      info: this.createLimitInfo(entry, now, 'Request allowed')
    };
  }

  /**
   * Registrar éxito de request (para circuit breaker)
   */
  recordSuccess(identifier: string): void {
    const key = this.config.keyGenerator(identifier);
    const entry = this.store.get(key);
    
    if (entry?.circuitBreaker) {
      entry.circuitBreaker.successes++;
      entry.circuitBreaker.failures = Math.max(0, entry.circuitBreaker.failures - 1);
      
      // Cerrar circuit breaker si hay suficientes éxitos
      if (entry.circuitBreaker.state === 'half-open' && 
          entry.circuitBreaker.successes >= this.config.successThreshold) {
        entry.circuitBreaker.state = 'closed';
        entry.circuitBreaker.failures = 0;
        entry.circuitBreaker.successes = 0;
        
        logger.debug('🔧 Circuit breaker closed for:', identifier);
      }
    }
  }

  /**
   * Registrar fallo de request (para circuit breaker)
   */
  recordFailure(identifier: string): void {
    const key = this.config.keyGenerator(identifier);
    const entry = this.store.get(key);
    const now = Date.now();
    
    if (entry?.circuitBreaker) {
      entry.circuitBreaker.failures++;
      entry.circuitBreaker.lastFailure = now;
      entry.circuitBreaker.successes = 0;
      
      // Abrir circuit breaker si hay demasiados fallos
      if (entry.circuitBreaker.state === 'closed' && 
          entry.circuitBreaker.failures >= this.config.failureThreshold) {
        entry.circuitBreaker.state = 'open';
        entry.circuitBreaker.nextAttempt = now + this.config.timeout;
        
        logger.warn('🚨 Circuit breaker opened for:', identifier);
      }
    }
  }

  /**
   * Reset manual de límites para un identificador
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator(identifier);
    const entry = this.store.get(key);
    
    if (entry) {
      entry.requests = [];
      
      if (entry.bucket) {
        entry.bucket.tokens = entry.bucket.capacity;
        entry.bucket.lastRefill = Date.now();
      }
      
      if (entry.circuitBreaker) {
        entry.circuitBreaker.state = 'closed';
        entry.circuitBreaker.failures = 0;
        entry.circuitBreaker.successes = 0;
      }
      
      this.config.onReset(identifier);
      logger.debug('🔄 Rate limit reset for:', identifier);
    }
  }

  /**
   * Obtener información de límites
   */
  getInfo(identifier: string): RateLimitInfo | null {
    const key = this.config.keyGenerator(identifier);
    const entry = this.store.get(key);
    
    if (!entry) return null;

    const now = Date.now();
    this.cleanupWindow(entry, now);
    
    return this.createLimitInfo(entry, now, 'Info requested');
  }

  /**
   * Crear nueva entrada
   */
  private createEntry(now: number): RateLimitEntry {
    const entry: RateLimitEntry = {
      requests: [],
      createdAt: now,
      lastRequest: now
    };

    // Configurar token bucket si está habilitado
    if (this.config.tokensPerInterval !== this.config.requests || this.config.bucketSize) {
      entry.bucket = {
        tokens: this.config.bucketSize,
        lastRefill: now,
        capacity: this.config.bucketSize,
        refillRate: this.config.tokensPerInterval,
        refillInterval: this.config.interval
      };
    }

    // Configurar circuit breaker si está habilitado
    if (this.config.failureThreshold > 0) {
      entry.circuitBreaker = {
        state: 'closed',
        failures: 0,
        successes: 0,
        lastFailure: 0,
        nextAttempt: 0
      };
    }

    return entry;
  }

  /**
   * Limpiar ventana de requests antiguas
   */
  private cleanupWindow(entry: RateLimitEntry, now: number): void {
    const cutoff = now - this.config.windowMs;
    entry.requests = entry.requests.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Verificar estado del circuit breaker
   */
  private checkCircuitBreaker(cb: CircuitBreakerState, now: number): {
    allowed: boolean;
    nextAttempt: number;
  } {
    switch (cb.state) {
      case 'open':
        if (now >= cb.nextAttempt) {
          cb.state = 'half-open';
          cb.successes = 0;
          logger.debug('🔧 Circuit breaker half-open');
          return { allowed: true, nextAttempt: 0 };
        }
        return { allowed: false, nextAttempt: cb.nextAttempt };
        
      case 'half-open':
        return { allowed: true, nextAttempt: 0 };
        
      case 'closed':
      default:
        return { allowed: true, nextAttempt: 0 };
    }
  }

  /**
   * Rellenar token bucket
   */
  private refillBucket(bucket: TokenBucket, now: number): void {
    const timePassed = now - bucket.lastRefill;
    const intervalsPass = Math.floor(timePassed / bucket.refillInterval);
    
    if (intervalsPass > 0) {
      const tokensToAdd = intervalsPass * bucket.refillRate;
      bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  /**
   * Crear información de límites
   */
  private createLimitInfo(entry: RateLimitEntry, now: number, reason: string): RateLimitInfo {
    const totalRequests = entry.requests.length;
    const remainingRequests = Math.max(0, this.config.requests - totalRequests);
    
    // Calcular tiempo de reset
    let resetTime = now + this.config.windowMs;
    if (entry.requests.length > 0) {
      resetTime = entry.requests[0] + this.config.windowMs;
    }
    
    // Calcular retry after
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    
    // Verificar si está bloqueado
    const isBlocked = remainingRequests === 0 || 
      (entry.circuitBreaker?.state === 'open') ||
      (entry.bucket?.tokens === 0);

    return {
      totalRequests,
      remainingRequests,
      resetTime,
      retryAfter: Math.max(0, retryAfter),
      isBlocked,
      reason
    };
  }

  /**
   * Obtener estrategia configurada
   */
  private getStrategy(): string[] {
    const strategies = ['sliding-window'];
    
    if (this.config.tokensPerInterval !== this.config.requests || this.config.bucketSize) {
      strategies.push('token-bucket');
    }
    
    if (this.config.failureThreshold > 0) {
      strategies.push('circuit-breaker');
    }
    
    return strategies;
  }

  /**
   * Timer de limpieza de entradas antiguas
   */
  private startCleanupTimer(): void {
    const cleanupInterval = Math.min(this.config.windowMs / 2, 60000); // Max 1 minuto
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, cleanupInterval);
  }

  /**
   * Limpiar entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredCutoff = now - (this.config.windowMs * 2); // Mantener por 2x la ventana
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      // Limpiar requests antiguas
      this.cleanupWindow(entry, now);
      
      // Eliminar entradas completamente inactivas
      if (entry.lastRequest < expiredCutoff && entry.requests.length === 0) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('🧹 Rate limiter cleanup:', { 
        cleaned, 
        remaining: this.store.size 
      });
    }
  }

  /**
   * Obtener estadísticas del rate limiter
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    totalRequests: number;
    blockedRequests: number;
    strategy: string[];
    memoryUsage: number;
  } {
    const now = Date.now();
    let totalRequests = 0;
    let blockedRequests = 0;
    let activeKeys = 0;

    for (const entry of this.store.values()) {
      this.cleanupWindow(entry, now);
      totalRequests += entry.requests.length;
      
      if (entry.requests.length > 0) {
        activeKeys++;
      }
      
      if (entry.requests.length >= this.config.requests) {
        blockedRequests++;
      }
    }

    return {
      totalKeys: this.store.size,
      activeKeys,
      totalRequests,
      blockedRequests,
      strategy: this.getStrategy(),
      memoryUsage: JSON.stringify(Array.from(this.store.entries())).length
    };
  }

  /**
   * Destruir rate limiter
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.store.clear();
    logger.info('💀 Rate limiter destroyed');
  }
}

/**
 * Rate limiter global por IP/Usuario
 */
export const globalRateLimiter = new RateLimiter({
  requests: 100,
  windowMs: 60000, // 1 minuto
  tokensPerInterval: 50,
  interval: 30000, // 30 segundos
  bucketSize: 200,
  failureThreshold: 5,
  timeout: 300000, // 5 minutos
  onLimitReached: (identifier, info) => {
    logger.warn('🚨 Rate limit exceeded:', { identifier, info });
  }
});

/**
 * Rate limiter específico para APIs
 */
export const apiRateLimiter = new RateLimiter({
  requests: 60,
  windowMs: 60000, // 60 requests per minute
  tokensPerInterval: 30,
  interval: 30000,
  bucketSize: 120,
  failureThreshold: 3,
  timeout: 60000,
  keyGenerator: (endpoint: string) => `api:${endpoint}`,
  onLimitReached: (endpoint, info) => {
    logger.warn('🌐 API rate limit exceeded:', { endpoint, info });
  }
});

/**
 * Rate limiter para autenticación
 */
export const authRateLimiter = new RateLimiter({
  requests: 5,
  windowMs: 900000, // 15 minutos
  failureThreshold: 3,
  timeout: 1800000, // 30 minutos
  keyGenerator: (identifier: string) => `auth:${identifier}`,
  onLimitReached: (identifier, info) => {
    logger.error('🔐 Auth rate limit exceeded:', { identifier, info });
  }
});