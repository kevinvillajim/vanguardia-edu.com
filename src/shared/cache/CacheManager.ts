/**
 * Sistema de caché avanzado para máxima escalabilidad
 * Implementa múltiples estrategias de cache con invalidación inteligente
 */

import { logger } from '../utils/logger';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
  version: string;
  tags: string[];
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  totalEntries: number;
  memoryUsage: number;
  averageAccessTime: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enablePersistence: boolean;
  compressionThreshold: number;
  enableMetrics: boolean;
}

/**
 * Estrategias de invalidación de cache
 */
export enum InvalidationStrategy {
  TTL = 'ttl',
  LRU = 'lru', 
  LFU = 'lfu',
  FIFO = 'fifo',
  TAG_BASED = 'tag-based'
}

/**
 * Manager de cache multi-nivel con estrategias avanzadas
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private accessTimes: number[] = [];
  private stats: CacheStats = {
    hitRate: 0,
    missRate: 0,
    totalHits: 0,
    totalMisses: 0,
    totalEntries: 0,
    memoryUsage: 0,
    averageAccessTime: 0
  };

  private cleanupTimer?: NodeJS.Timeout;
  private readonly config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      cleanupInterval: 60 * 1000, // 1 minuto
      enablePersistence: true,
      compressionThreshold: 10240, // 10KB
      enableMetrics: true,
      ...config
    };

    this.startCleanupTimer();
    this.loadFromPersistence();
    
    logger.debug('🗄️ CacheManager initialized:', {
      maxSize: this.config.maxSize,
      defaultTTL: this.config.defaultTTL,
      enablePersistence: this.config.enablePersistence
    });
  }

  /**
   * Obtener valor del cache con métricas
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.recordMiss();
        return null;
      }

      // Verificar TTL
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.recordMiss();
        return null;
      }

      // Actualizar estadísticas de acceso
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      
      this.recordHit();
      
      // Decomprimir si es necesario
      const data = await this.decompressIfNeeded(entry.data);
      
      logger.debug('💾 Cache HIT:', { key, accessCount: entry.accessCount });
      return data as T;

    } finally {
      this.recordAccessTime(performance.now() - startTime);
    }
  }

  /**
   * Guardar valor en cache con configuración avanzada
   */
  async set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      tags?: string[];
      compress?: boolean;
      version?: string;
    } = {}
  ): Promise<void> {
    try {
      // Comprimir datos si es necesario
      const processedData = await this.compressIfNeeded(
        data, 
        options.compress ?? this.shouldCompress(data)
      );

      const entry: CacheEntry<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl: options.ttl ?? this.config.defaultTTL,
        accessCount: 0,
        lastAccessed: Date.now(),
        version: options.version ?? '1.0.0',
        tags: options.tags ?? []
      };

      // Aplicar estrategias de eviction si el cache está lleno
      if (this.cache.size >= this.config.maxSize) {
        this.evictEntries();
      }

      this.cache.set(key, entry);
      this.updateStats();
      
      // Persistir si está habilitado
      if (this.config.enablePersistence) {
        this.saveToPersistence(key, entry);
      }

      logger.debug('💾 Cache SET:', { 
        key, 
        ttl: entry.ttl,
        tags: entry.tags,
        compressed: processedData !== data
      });

    } catch (error) {
      logger.error('❌ Cache SET failed:', { key, error });
    }
  }

  /**
   * Invalidar cache por tags
   */
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.updateStats();
    logger.info(`🗑️ Invalidated ${invalidated} entries by tags:`, tags);
    
    return invalidated;
  }

  /**
   * Invalidar por patrón de clave
   */
  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.updateStats();
    logger.info(`🗑️ Invalidated ${invalidated} entries by pattern:`, pattern);
    
    return invalidated;
  }

  /**
   * Precarga de datos críticos
   */
  async warmup(keysAndFactories: Array<{
    key: string;
    factory: () => Promise<any>;
    ttl?: number;
    tags?: string[];
  }>): Promise<void> {
    logger.info('🔥 Starting cache warmup:', { count: keysAndFactories.length });
    
    const promises = keysAndFactories.map(async ({ key, factory, ttl, tags }) => {
      try {
        const data = await factory();
        await this.set(key, data, { ttl, tags });
        logger.debug('🔥 Warmed up:', key);
      } catch (error) {
        logger.error('❌ Warmup failed for key:', { key, error });
      }
    });

    await Promise.allSettled(promises);
    logger.success('✅ Cache warmup completed');
  }

  /**
   * Obtener o establecer (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: {
      ttl?: number;
      tags?: string[];
      version?: string;
    } = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    logger.debug('🔄 Cache MISS - executing factory:', key);
    const data = await factory();
    await this.set(key, data, options);
    
    return data;
  }

  /**
   * Cache con refresh en background
   */
  async getWithRefresh<T>(
    key: string,
    factory: () => Promise<T>,
    options: {
      ttl?: number;
      refreshThreshold?: number; // Porcentaje de TTL para refresh
      tags?: string[];
    } = {}
  ): Promise<T> {
    const entry = this.cache.get(key);
    const refreshThreshold = options.refreshThreshold ?? 0.8;

    if (entry && !this.isExpired(entry)) {
      // Verificar si necesita refresh en background
      const age = Date.now() - entry.timestamp;
      const shouldRefresh = age > (entry.ttl * refreshThreshold);

      if (shouldRefresh) {
        // Refresh en background sin bloquear
        factory().then(data => {
          this.set(key, data, options).catch(error => {
            logger.error('❌ Background refresh failed:', { key, error });
          });
        });
        
        logger.debug('🔄 Background refresh triggered for:', key);
      }

      entry.accessCount++;
      entry.lastAccessed = Date.now();
      return entry.data;
    }

    // No existe o expiró, obtener síncronamente
    const data = await factory();
    await this.set(key, data, options);
    return data;
  }

  /**
   * Estadísticas del cache
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.totalHits + this.stats.totalMisses;
    
    return {
      ...this.stats,
      hitRate: totalRequests > 0 ? (this.stats.totalHits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.stats.totalMisses / totalRequests) * 100 : 0,
      totalEntries: this.cache.size,
      memoryUsage: this.calculateMemoryUsage(),
      averageAccessTime: this.calculateAverageAccessTime()
    };
  }

  /**
   * Exportar cache para debugging
   */
  export(): Array<{ key: string; entry: CacheEntry }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({ key, entry }));
  }

  /**
   * Limpiar cache completamente
   */
  clear(): void {
    this.cache.clear();
    this.stats.totalEntries = 0;
    this.updateStats();
    logger.info('🗑️ Cache cleared completely');
  }

  /**
   * Destruir instancia y limpiar recursos
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
    logger.info('💀 CacheManager destroyed');
  }

  /**
   * Métodos privados
   */

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const before = this.cache.size;
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.updateStats();
      logger.debug('🧹 Cache cleanup:', { before, after: this.cache.size, removed });
    }
  }

  private evictEntries(): void {
    // Estrategia LRU: remover los menos recientemente usados
    const entries = Array.from(this.cache.entries());
    entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    const toRemove = Math.ceil(this.config.maxSize * 0.1); // Remover 10%
    
    for (let i = 0; i < toRemove && entries.length > 0; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }

    logger.debug('🚮 Cache eviction:', { removed: toRemove });
  }

  private shouldCompress(data: any): boolean {
    const serialized = JSON.stringify(data);
    return serialized.length > this.config.compressionThreshold;
  }

  private async compressIfNeeded(data: any, force: boolean = false): Promise<any> {
    if (!force && !this.shouldCompress(data)) {
      return data;
    }

    try {
      // Usar compression simple con base64
      const serialized = JSON.stringify(data);
      const compressed = btoa(serialized);
      return { __compressed: true, data: compressed };
    } catch (error) {
      logger.warn('⚠️ Compression failed, storing uncompressed:', error);
      return data;
    }
  }

  private async decompressIfNeeded(data: any): Promise<any> {
    if (!data || typeof data !== 'object' || !data.__compressed) {
      return data;
    }

    try {
      const decompressed = atob(data.data);
      return JSON.parse(decompressed);
    } catch (error) {
      logger.error('❌ Decompression failed:', error);
      return data;
    }
  }

  private recordHit(): void {
    this.stats.totalHits++;
  }

  private recordMiss(): void {
    this.stats.totalMisses++;
  }

  private recordAccessTime(time: number): void {
    this.accessTimes.push(time);
    
    // Mantener solo las últimas 1000 mediciones
    if (this.accessTimes.length > 1000) {
      this.accessTimes = this.accessTimes.slice(-1000);
    }
  }

  private calculateAverageAccessTime(): number {
    if (this.accessTimes.length === 0) return 0;
    
    const sum = this.accessTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.accessTimes.length;
  }

  private calculateMemoryUsage(): number {
    let size = 0;
    
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry).length * 2; // Aproximación en bytes
    }
    
    return size;
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
  }

  private saveToPersistence(key: string, entry: CacheEntry): void {
    try {
      const persistKey = `cache_${key}`;
      localStorage.setItem(persistKey, JSON.stringify(entry));
    } catch (error) {
      logger.warn('⚠️ Failed to persist cache entry:', { key, error });
    }
  }

  private loadFromPersistence(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith('cache_')) {
          const cacheKey = key.replace('cache_', '');
          const data = localStorage.getItem(key);
          
          if (data) {
            const entry: CacheEntry = JSON.parse(data);
            
            // Verificar si no ha expirado
            if (!this.isExpired(entry)) {
              this.cache.set(cacheKey, entry);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
      
      logger.debug('📂 Loaded from persistence:', { entries: this.cache.size });
    } catch (error) {
      logger.warn('⚠️ Failed to load from persistence:', error);
    }
  }
}

// Instancia global del cache manager
export const globalCacheManager = new CacheManager({
  maxSize: 5000,
  defaultTTL: 10 * 60 * 1000, // 10 minutos
  enablePersistence: true,
  enableMetrics: true
});