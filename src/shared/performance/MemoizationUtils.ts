/**
 * Utilidades avanzadas de memoización para optimización de performance
 * React.memo, useMemo, useCallback optimizados con estrategias inteligentes
 */

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { logger } from '../utils/logger';

/**
 * Configuración de memoización
 */
export interface MemoConfig {
  maxCacheSize?: number;
  ttl?: number; // Time to live en milisegundos
  enableDeepComparison?: boolean;
  enableProfiling?: boolean;
  cacheKey?: string;
}

/**
 * Estadísticas de memoización
 */
export interface MemoStats {
  hits: number;
  misses: number;
  hitRate: number;
  cacheSize: number;
  totalComputations: number;
  averageComputationTime: number;
}

/**
 * Cache inteligente con TTL y LRU
 */
class MemoCache<T = any> {
  private cache = new Map<string, {
    value: T;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
  }>();
  private stats = {
    hits: 0,
    misses: 0,
    computations: 0,
    totalComputationTime: 0
  };

  constructor(
    private maxSize = 100,
    private ttl = 5 * 60 * 1000, // 5 minutos
    private enableProfiling = false
  ) {}

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Verificar TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    if (this.enableProfiling) {
      logger.debug('💾 Memo cache HIT:', { key, accessCount: entry.accessCount });
    }

    return entry.value;
  }

  set(key: string, value: T, computationTime = 0): void {
    // Limpiar cache si está lleno (LRU)
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    });

    this.stats.computations++;
    this.stats.totalComputationTime += computationTime;

    if (this.enableProfiling) {
      logger.debug('📦 Memo cache SET:', { 
        key, 
        cacheSize: this.cache.size,
        computationTime 
      });
    }
  }

  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      computations: 0,
      totalComputationTime: 0
    };
  }

  getStats(): MemoStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      cacheSize: this.cache.size,
      totalComputations: this.stats.computations,
      averageComputationTime: this.stats.computations > 0 
        ? this.stats.totalComputationTime / this.stats.computations 
        : 0
    };
  }
}

// Cache global para memoización
const globalMemoCache = new MemoCache(500, 10 * 60 * 1000, true);

/**
 * Hook de memoización avanzada con cache persistente
 */
export function useAdvancedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  config: MemoConfig = {}
): T {
  const {
    maxCacheSize = 100,
    ttl = 5 * 60 * 1000,
    enableDeepComparison = false,
    enableProfiling = false,
    cacheKey
  } = config;

  // Cache local para este hook
  const cacheRef = useRef(new MemoCache<T>(maxCacheSize, ttl, enableProfiling));
  const previousDepsRef = useRef<React.DependencyList>();

  return useMemo(() => {
    const startTime = performance.now();
    
    // Generar clave basada en dependencias
    const key = cacheKey || generateDepsKey(deps, enableDeepComparison);
    
    // Verificar si las dependencias cambiaron
    const depsChanged = !previousDepsRef.current || 
      !shallowEqual(previousDepsRef.current, deps, enableDeepComparison);
    
    if (!depsChanged) {
      // Intentar obtener del cache
      const cached = cacheRef.current.get(key);
      if (cached !== undefined) {
        return cached;
      }
    }

    // Computar nuevo valor
    const value = factory();
    const computationTime = performance.now() - startTime;
    
    // Guardar en cache
    cacheRef.current.set(key, value, computationTime);
    previousDepsRef.current = [...deps];

    if (enableProfiling && computationTime > 1) {
      logger.debug('🧮 Advanced memo computation:', { 
        key, 
        computationTime: `${computationTime.toFixed(2)}ms`,
        depsChanged
      });
    }

    return value;
  }, deps);
}

/**
 * Hook de callback con memoización inteligente
 */
export function useAdvancedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  config: MemoConfig = {}
): T {
  const {
    enableProfiling = false,
    cacheKey
  } = config;

  const statsRef = useRef({ calls: 0, totalTime: 0 });

  return useCallback(
    ((...args: Parameters<T>) => {
      const startTime = enableProfiling ? performance.now() : 0;
      
      const result = callback(...args);
      
      if (enableProfiling) {
        const computationTime = performance.now() - startTime;
        statsRef.current.calls++;
        statsRef.current.totalTime += computationTime;
        
        if (computationTime > 1) {
          logger.debug('⚡ Advanced callback execution:', {
            key: cacheKey || 'anonymous',
            computationTime: `${computationTime.toFixed(2)}ms`,
            totalCalls: statsRef.current.calls,
            avgTime: `${(statsRef.current.totalTime / statsRef.current.calls).toFixed(2)}ms`
          });
        }
      }
      
      return result;
    }) as T,
    deps
  );
}

/**
 * Hook para datos costosos con invalidación inteligente
 */
export function useExpensiveComputation<T>(
  computation: () => T,
  deps: React.DependencyList,
  config: MemoConfig & {
    computationThreshold?: number;
    invalidateOnMount?: boolean;
  } = {}
): {
  data: T;
  isComputing: boolean;
  stats: MemoStats;
  invalidate: () => void;
} {
  const {
    computationThreshold = 10, // ms
    invalidateOnMount = false,
    ...memoConfig
  } = config;

  const [isComputing, setIsComputing] = React.useState(false);
  const computationRef = useRef<Promise<T> | null>(null);
  const cacheRef = useRef(new MemoCache<T>(1, memoConfig.ttl));
  const mountCountRef = useRef(0);

  useEffect(() => {
    mountCountRef.current++;
    if (invalidateOnMount && mountCountRef.current > 1) {
      cacheRef.current.clear();
    }
  });

  const invalidate = useCallback(() => {
    cacheRef.current.clear();
    computationRef.current = null;
  }, []);

  const data = useAdvancedMemo(
    () => {
      const key = 'computation';
      const cached = cacheRef.current.get(key);
      
      if (cached !== undefined) {
        return cached;
      }

      // Si ya hay una computación en progreso, esperarla
      if (computationRef.current) {
        throw computationRef.current;
      }

      setIsComputing(true);
      const startTime = performance.now();

      try {
        const result = computation();
        const computationTime = performance.now() - startTime;
        
        // Solo loggear si supera el threshold
        if (computationTime > computationThreshold) {
          logger.warn('🐌 Expensive computation detected:', {
            computationTime: `${computationTime.toFixed(2)}ms`,
            threshold: `${computationThreshold}ms`,
            suggestion: 'Consider optimizing or using web workers'
          });
        }

        cacheRef.current.set(key, result, computationTime);
        setIsComputing(false);
        computationRef.current = null;
        
        return result;
      } catch (error) {
        setIsComputing(false);
        computationRef.current = null;
        throw error;
      }
    },
    deps,
    memoConfig
  );

  return {
    data,
    isComputing,
    stats: cacheRef.current.getStats(),
    invalidate
  };
}

/**
 * Hook para listas grandes con renderizado optimizado
 */
export function useOptimizedList<T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactNode,
  config: {
    keyExtractor?: (item: T, index: number) => string;
    itemHeight?: number;
    windowSize?: number;
    overscan?: number;
  } = {}
): {
  visibleItems: Array<{ key: string; item: T; index: number; element: React.ReactNode }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
} {
  const {
    keyExtractor = (_, index) => index.toString(),
    itemHeight = 50,
    windowSize = 20,
    overscan = 5
  } = config;

  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(600);

  // Calcular items visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

  // Memoizar items visibles
  const visibleItems = useMemo(() => {
    const result = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      const item = items[i];
      if (item) {
        const key = keyExtractor(item, i);
        const element = renderItem(item, i);
        
        result.push({
          key,
          item,
          index: i,
          element
        });
      }
    }
    
    return result;
  }, [items, visibleRange, keyExtractor, renderItem]);

  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    scrollToIndex
  };
}

/**
 * Comparación optimizada de dependencias
 */
function shallowEqual(
  a: React.DependencyList,
  b: React.DependencyList,
  enableDeepComparison = false
): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (enableDeepComparison) {
      if (!deepEqual(a[i], b[i])) return false;
    } else {
      if (a[i] !== b[i]) return false;
    }
  }
  
  return true;
}

/**
 * Comparación profunda simple
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
        return false;
      }
    }
    
    return true;
  }
  
  return false;
}

/**
 * Generar clave basada en dependencias
 */
function generateDepsKey(
  deps: React.DependencyList,
  enableDeepComparison = false
): string {
  if (enableDeepComparison) {
    return JSON.stringify(deps);
  }
  
  return deps.map(dep => {
    if (dep === null) return 'null';
    if (dep === undefined) return 'undefined';
    if (typeof dep === 'object') return JSON.stringify(dep);
    return String(dep);
  }).join('|');
}

/**
 * Higher-Order Component para memoización automática
 */
export function withMemoization<P extends object>(
  Component: React.ComponentType<P>,
  config: {
    compareProps?: (prevProps: P, nextProps: P) => boolean;
    displayName?: string;
    enableProfiling?: boolean;
  } = {}
) {
  const {
    compareProps = (prevProps, nextProps) => shallowEqual(
      Object.values(prevProps),
      Object.values(nextProps)
    ),
    displayName = Component.displayName || Component.name,
    enableProfiling = false
  } = config;

  const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
    const startTime = enableProfiling ? performance.now() : 0;
    const areEqual = compareProps(prevProps, nextProps);
    
    if (enableProfiling) {
      const comparisonTime = performance.now() - startTime;
      logger.debug('🔍 Props comparison:', {
        component: displayName,
        areEqual,
        comparisonTime: `${comparisonTime.toFixed(3)}ms`
      });
    }
    
    return areEqual;
  });

  MemoizedComponent.displayName = `Memoized(${displayName})`;
  return MemoizedComponent;
}

/**
 * Estadísticas globales de memoización
 */
export function getMemoizationStats(): MemoStats & {
  globalCacheSize: number;
  recommendations: string[];
} {
  const stats = globalMemoCache.getStats();
  const recommendations: string[] = [];
  
  if (stats.hitRate < 50) {
    recommendations.push('Low cache hit rate - consider adjusting TTL or cache size');
  }
  
  if (stats.averageComputationTime > 10) {
    recommendations.push('High computation time detected - consider optimizing expensive operations');
  }
  
  if (stats.cacheSize > 400) {
    recommendations.push('High cache usage - consider implementing cache eviction strategies');
  }

  return {
    ...stats,
    globalCacheSize: stats.cacheSize,
    recommendations
  };
}

/**
 * Limpiar caches de memoización
 */
export function clearMemoizationCaches(): void {
  globalMemoCache.clear();
  logger.info('🧹 Memoization caches cleared');
}

// Log de estadísticas periódico en modo debug
if (import.meta.env.VITE_MODE === 'debugging') {
  setInterval(() => {
    const stats = getMemoizationStats();
    if (stats.totalComputations > 0) {
      logger.debug('📊 Memoization Stats:', stats);
    }
  }, 30000); // Cada 30 segundos
}