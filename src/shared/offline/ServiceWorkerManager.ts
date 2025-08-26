/**
 * Administrador de Service Worker para soporte offline completo
 * PWA avanzada con cache strategies y background sync
 */

import { logger } from '../utils/logger';

export interface CacheConfig {
  cacheName: string;
  version: string;
  maxAge: number;
  maxEntries: number;
  strategies: CacheStrategy[];
}

export interface CacheStrategy {
  name: string;
  pattern: RegExp;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'cache-only' | 'network-only';
  cacheName?: string;
  networkTimeout?: number;
  expiration?: {
    maxAge?: number;
    maxEntries?: number;
    purgeOnQuotaError?: boolean;
  };
}

export interface OfflineQueueItem {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncData {
  tag: string;
  data: any;
  timestamp: number;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  cacheName: 'vanguardia-v1',
  version: '1.0.0',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  maxEntries: 500,
  strategies: [
    {
      name: 'static-assets',
      pattern: /\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)$/,
      strategy: 'cache-first',
      cacheName: 'static-assets-v1',
      expiration: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
        maxEntries: 200
      }
    },
    {
      name: 'api-data',
      pattern: /\/api\/(courses|categories|users)/,
      strategy: 'network-first',
      cacheName: 'api-data-v1',
      networkTimeout: 5000,
      expiration: {
        maxAge: 60 * 60 * 1000, // 1 hora
        maxEntries: 100
      }
    },
    {
      name: 'auth-api',
      pattern: /\/api\/auth/,
      strategy: 'network-only'
    },
    {
      name: 'app-shell',
      pattern: /\/(login|dashboard|courses)/,
      strategy: 'stale-while-revalidate',
      cacheName: 'app-shell-v1',
      expiration: {
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        maxEntries: 50
      }
    }
  ]
};

export class ServiceWorkerManager {
  private config: CacheConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private offlineQueue: OfflineQueueItem[] = [];
  private syncQueue: SyncData[] = [];
  private updateCheckInterval?: NodeJS.Timeout;

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.setupEventListeners();
    this.loadPersistedData();
  }

  /**
   * Registrar Service Worker
   */
  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('⚠️ Service Workers not supported');
      return false;
    }

    try {
      // Generar Service Worker dinámicamente
      const swCode = this.generateServiceWorkerCode();
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);

      this.registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
        updateViaCache: 'none'
      });

      logger.info('🔧 Service Worker registered successfully');

      // Configurar listeners
      this.setupRegistrationListeners();

      // Verificar actualizaciones
      this.startUpdateCheck();

      return true;

    } catch (error) {
      logger.error('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Generar código del Service Worker
   */
  private generateServiceWorkerCode(): string {
    return `
// Service Worker generado dinámicamente por ServiceWorkerManager
const CACHE_CONFIG = ${JSON.stringify(this.config)};
const OFFLINE_QUEUE_KEY = 'offline-queue';
const SYNC_QUEUE_KEY = 'sync-queue';

let offlineQueue = [];
let syncQueue = [];

// Event: Install
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      precacheResources()
    ])
  );
});

// Event: Activate
self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      cleanupOldCaches(),
      loadPersistedQueues()
    ])
  );
});

// Event: Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Aplicar estrategia de cache apropiada
  const strategy = findMatchingStrategy(url.pathname + url.search);
  
  if (strategy) {
    event.respondWith(handleRequest(request, strategy));
  }
});

// Event: Background Sync
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'offline-requests') {
    event.waitUntil(processOfflineQueue());
  } else if (event.tag === 'data-sync') {
    event.waitUntil(processDataSync());
  }
});

// Event: Message
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'QUEUE_REQUEST':
      queueOfflineRequest(data);
      break;
    case 'SYNC_DATA':
      queueSyncData(data);
      break;
    case 'GET_QUEUE_STATUS':
      event.ports[0].postMessage({
        offlineQueue: offlineQueue.length,
        syncQueue: syncQueue.length
      });
      break;
  }
});

// Precachear recursos críticos
async function precacheResources() {
  const cache = await caches.open(CACHE_CONFIG.cacheName);
  const criticalUrls = [
    '/',
    '/manifest.json',
    '/offline.html'
  ];
  
  return cache.addAll(criticalUrls);
}

// Limpiar caches antiguos
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = CACHE_CONFIG.strategies.map(s => s.cacheName).filter(Boolean);
  validCaches.push(CACHE_CONFIG.cacheName);
  
  return Promise.all(
    cacheNames
      .filter(name => !validCaches.includes(name))
      .map(name => {
        console.log('🗑️ Deleting old cache:', name);
        return caches.delete(name);
      })
  );
}

// Encontrar estrategia de cache
function findMatchingStrategy(path) {
  return CACHE_CONFIG.strategies.find(strategy => strategy.pattern.test(path));
}

// Manejar request con estrategia específica
async function handleRequest(request, strategy) {
  const { strategy: strategyType, cacheName, networkTimeout, expiration } = strategy;
  const cache = await caches.open(cacheName || CACHE_CONFIG.cacheName);
  
  switch (strategyType) {
    case 'cache-first':
      return handleCacheFirst(request, cache);
    case 'network-first':
      return handleNetworkFirst(request, cache, networkTimeout);
    case 'stale-while-revalidate':
      return handleStaleWhileRevalidate(request, cache);
    case 'cache-only':
      return handleCacheOnly(request, cache);
    case 'network-only':
      return handleNetworkOnly(request);
    default:
      return fetch(request);
  }
}

// Cache First Strategy
async function handleCacheFirst(request, cache) {
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

// Network First Strategy
async function handleNetworkFirst(request, cache, timeout = 5000) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      )
    ]);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return getOfflineFallback(request);
  }
}

// Stale While Revalidate Strategy
async function handleStaleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  return cachedResponse || networkPromise || getOfflineFallback(request);
}

// Cache Only Strategy
async function handleCacheOnly(request, cache) {
  return (await cache.match(request)) || getOfflineFallback(request);
}

// Network Only Strategy
async function handleNetworkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return getOfflineFallback(request);
  }
}

// Fallback offline
function getOfflineFallback(request) {
  if (request.destination === 'document') {
    return caches.match('/offline.html');
  }
  
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Queue offline request
function queueOfflineRequest(requestData) {
  const item = {
    ...requestData,
    id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    retries: 0
  };
  
  offlineQueue.push(item);
  persistQueue('offline');
  
  // Programar background sync
  self.registration.sync.register('offline-requests');
}

// Queue sync data
function queueSyncData(syncData) {
  const item = {
    ...syncData,
    timestamp: Date.now()
  };
  
  syncQueue.push(item);
  persistQueue('sync');
  
  // Programar background sync
  self.registration.sync.register('data-sync');
}

// Process offline queue
async function processOfflineQueue() {
  const itemsToProcess = [...offlineQueue];
  offlineQueue = [];
  
  for (const item of itemsToProcess) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }
      
      console.log('✅ Offline request processed:', item.url);
    } catch (error) {
      item.retries++;
      
      if (item.retries < item.maxRetries) {
        offlineQueue.push(item);
        console.log(\`🔄 Retrying offline request (\${item.retries}/\${item.maxRetries}):\`, item.url);
      } else {
        console.error('❌ Max retries exceeded for:', item.url);
      }
    }
  }
  
  persistQueue('offline');
}

// Process data sync
async function processDataSync() {
  const itemsToProcess = [...syncQueue];
  syncQueue = [];
  
  for (const item of itemsToProcess) {
    try {
      // Aquí implementarías la lógica específica de sync
      console.log('🔄 Processing sync data:', item.tag);
      
      // Ejemplo: enviar datos al servidor
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      if (response.ok) {
        console.log('✅ Data synced:', item.tag);
      }
    } catch (error) {
      syncQueue.push(item); // Reencolar en caso de error
      console.error('❌ Sync failed:', error);
    }
  }
  
  persistQueue('sync');
}

// Persist queues
function persistQueue(type) {
  if (type === 'offline') {
    self.caches.open('app-data').then(cache => {
      cache.put(new Request(OFFLINE_QUEUE_KEY), new Response(JSON.stringify(offlineQueue)));
    });
  } else if (type === 'sync') {
    self.caches.open('app-data').then(cache => {
      cache.put(new Request(SYNC_QUEUE_KEY), new Response(JSON.stringify(syncQueue)));
    });
  }
}

// Load persisted queues
async function loadPersistedQueues() {
  try {
    const cache = await caches.open('app-data');
    
    const offlineResponse = await cache.match(OFFLINE_QUEUE_KEY);
    if (offlineResponse) {
      offlineQueue = JSON.parse(await offlineResponse.text());
    }
    
    const syncResponse = await cache.match(SYNC_QUEUE_KEY);
    if (syncResponse) {
      syncQueue = JSON.parse(await syncResponse.text());
    }
    
    console.log('📂 Queues loaded:', { offline: offlineQueue.length, sync: syncQueue.length });
  } catch (error) {
    console.error('❌ Failed to load persisted queues:', error);
  }
}
`;
  }

  /**
   * Configurar listeners de eventos
   */
  private setupEventListeners(): void {
    // Online/Offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
      logger.info('🌐 Back online - processing queued requests');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.warn('📡 Gone offline - queueing requests');
    });

    logger.debug('👂 ServiceWorker event listeners configured');
  }

  /**
   * Configurar listeners del registro
   */
  private setupRegistrationListeners(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            logger.info('🔄 New Service Worker available');
            this.notifyUpdate();
          }
        });
      }
    });
  }

  /**
   * Notificar actualización disponible
   */
  private notifyUpdate(): void {
    const event = new CustomEvent('sw-update-available', {
      detail: { registration: this.registration }
    });
    window.dispatchEvent(event);
  }

  /**
   * Aplicar actualización
   */
  async applyUpdate(): Promise<boolean> {
    if (!this.registration?.waiting) return false;

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    await new Promise<void>((resolve) => {
      const channel = new MessageChannel();
      channel.port1.addEventListener('message', () => resolve());
      this.registration!.waiting!.postMessage({ type: 'SKIP_WAITING' }, [channel.port2]);
    });

    window.location.reload();
    return true;
  }

  /**
   * Verificar actualizaciones periódicamente
   */
  private startUpdateCheck(): void {
    this.updateCheckInterval = setInterval(async () => {
      if (this.registration) {
        await this.registration.update();
      }
    }, 60000); // Cada minuto
  }

  /**
   * Encolar request offline
   */
  queueOfflineRequest(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
    priority?: 'high' | 'medium' | 'low';
    maxRetries?: number;
  }): void {
    const item: OfflineQueueItem = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: request.maxRetries || 3,
      priority: request.priority || 'medium'
    };

    this.offlineQueue.push(item);
    this.persistOfflineQueue();
    
    if ('serviceWorker' in navigator && this.registration) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('offline-requests');
      });
    }

    logger.info('📤 Request queued for offline processing:', request.url);
  }

  /**
   * Encolar datos para sync
   */
  queueDataSync(data: { tag: string; data: any }): void {
    const item: SyncData = {
      tag: data.tag,
      data: data.data,
      timestamp: Date.now()
    };

    this.syncQueue.push(item);
    this.persistSyncQueue();

    if ('serviceWorker' in navigator && this.registration) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('data-sync');
      });
    }

    logger.info('🔄 Data queued for background sync:', data.tag);
  }

  /**
   * Procesar cola offline
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    // Ordenar por prioridad
    this.offlineQueue.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    const itemsToProcess = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of itemsToProcess) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        logger.success('✅ Offline request processed:', item.url);
      } catch (error) {
        item.retries++;
        
        if (item.retries < item.maxRetries) {
          this.offlineQueue.push(item);
          logger.warn(`🔄 Retrying offline request (${item.retries}/${item.maxRetries}):`, item.url);
        } else {
          logger.error('❌ Max retries exceeded for:', item.url);
        }
      }
    }

    this.persistOfflineQueue();
  }

  /**
   * Persistir cola offline
   */
  private persistOfflineQueue(): void {
    localStorage.setItem('sw-offline-queue', JSON.stringify(this.offlineQueue));
  }

  /**
   * Persistir cola sync
   */
  private persistSyncQueue(): void {
    localStorage.setItem('sw-sync-queue', JSON.stringify(this.syncQueue));
  }

  /**
   * Cargar datos persistidos
   */
  private loadPersistedData(): void {
    try {
      const offlineData = localStorage.getItem('sw-offline-queue');
      if (offlineData) {
        this.offlineQueue = JSON.parse(offlineData);
      }

      const syncData = localStorage.getItem('sw-sync-queue');
      if (syncData) {
        this.syncQueue = JSON.parse(syncData);
      }

      logger.debug('📂 Persisted data loaded:', {
        offline: this.offlineQueue.length,
        sync: this.syncQueue.length
      });
    } catch (error) {
      logger.error('❌ Failed to load persisted data:', error);
    }
  }

  /**
   * Obtener estado de las colas
   */
  getQueueStatus(): {
    offlineQueue: number;
    syncQueue: number;
    isOnline: boolean;
  } {
    return {
      offlineQueue: this.offlineQueue.length,
      syncQueue: this.syncQueue.length,
      isOnline: this.isOnline
    };
  }

  /**
   * Limpiar cache específica
   */
  async clearCache(cacheName?: string): Promise<boolean> {
    try {
      const targetCache = cacheName || this.config.cacheName;
      const success = await caches.delete(targetCache);
      
      if (success) {
        logger.info('🗑️ Cache cleared:', targetCache);
      }
      
      return success;
    } catch (error) {
      logger.error('❌ Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Obtener uso de cache
   */
  async getCacheUsage(): Promise<{
    total: number;
    caches: Array<{ name: string; size: number; entries: number }>;
  }> {
    const cacheNames = await caches.keys();
    const cacheData = [];
    let totalSize = 0;

    for (const name of cacheNames) {
      try {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        let cacheSize = 0;

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            cacheSize += blob.size;
          }
        }

        cacheData.push({
          name,
          size: cacheSize,
          entries: keys.length
        });

        totalSize += cacheSize;
      } catch (error) {
        logger.error('❌ Error calculating cache size:', error);
      }
    }

    return {
      total: totalSize,
      caches: cacheData
    };
  }

  /**
   * Desregistrar Service Worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }

    try {
      const success = await this.registration.unregister();
      this.registration = null;
      
      logger.info('🔧 Service Worker unregistered');
      return success;
    } catch (error) {
      logger.error('❌ Failed to unregister Service Worker:', error);
      return false;
    }
  }

  /**
   * Destruir manager
   */
  destroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
    
    this.offlineQueue = [];
    this.syncQueue = [];
    
    logger.info('💀 ServiceWorkerManager destroyed');
  }
}

// Instancia global del Service Worker Manager
export const globalServiceWorkerManager = new ServiceWorkerManager();

// Auto-registrar en cliente si está en producción
if (import.meta.env.PROD && typeof window !== 'undefined') {
  globalServiceWorkerManager.register();
}