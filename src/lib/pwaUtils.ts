/**
 * PWA Utility Functions
 * Common utilities for PWA functionality
 */

export const PWA_CONFIG = {
  UPDATE_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
  CACHE_VERSIONS: {
    STATIC: 'osho-static-v1',
    DYNAMIC: 'osho-dynamic-v1'
  },
  CACHE_STRATEGIES: {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
  }
} as const;

export const PWA_EVENTS = {
  UPDATE_AVAILABLE: 'UPDATE_AVAILABLE',
  UPDATE_CHECK_COMPLETE: 'UPDATE_CHECK_COMPLETE',
  START_UPDATE_CHECK: 'START_UPDATE_CHECK',
  STOP_UPDATE_CHECK: 'STOP_UPDATE_CHECK',
  SKIP_WAITING: 'SKIP_WAITING'
} as const;

/**
 * Check if the current environment supports PWA features
 */
export function isPWASupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check if the app is running in standalone mode (installed)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if the device is mobile
 */
export function isMobileDevice(): boolean {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0)
  );
}

/**
 * Get the appropriate cache strategy for a request
 */
export function getCacheStrategy(request: Request): string {
  const url = new URL(request.url);
  
  // Static assets - cache first
  if (url.pathname.includes('/src/') || url.pathname.includes('/assets/')) {
    return PWA_CONFIG.CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // HTML documents - stale while revalidate
  if (request.destination === 'document') {
    return PWA_CONFIG.CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // API calls - network first
  if (url.pathname.startsWith('/api/')) {
    return PWA_CONFIG.CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Default to cache first
  return PWA_CONFIG.CACHE_STRATEGIES.CACHE_FIRST;
}

/**
 * Check if a request should be cached
 */
export function shouldCache(request: Request): boolean {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return false;
  }
  
  // Skip non-HTTP requests
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) {
    return false;
  }
  
  // Skip chrome-extension and other special protocols
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return false;
  }
  
  return true;
}

/**
 * Get cache name based on request type
 */
export function getCacheName(request: Request): string {
  const url = new URL(request.url);
  
  // Static assets go to static cache
  if (url.pathname.includes('/src/') || url.pathname.includes('/assets/')) {
    return PWA_CONFIG.CACHE_VERSIONS.STATIC;
  }
  
  // Everything else goes to dynamic cache
  return PWA_CONFIG.CACHE_VERSIONS.DYNAMIC;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get storage quota information
 */
export async function getStorageInfo(): Promise<{
  used: number;
  available: number;
  total: number;
  percentage: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const total = estimate.quota || 0;
      const available = total - used;
      const percentage = total > 0 ? (used / total) * 100 : 0;
      
      return {
        used,
        available,
        total,
        percentage: Math.round(percentage * 100) / 100
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
    }
  }
  
  return {
    used: 0,
    available: 0,
    total: 0,
    percentage: 0
  };
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }
}

/**
 * Get cache size information
 */
export async function getCacheSize(): Promise<{
  totalSize: number;
  cacheCount: number;
  caches: Array<{ name: string; size: number; count: number }>;
}> {
  let totalSize = 0;
  let cacheCount = 0;
  const caches: Array<{ name: string; size: number; count: number }> = [];
  
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        let cacheSize = 0;
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            cacheSize += blob.size;
          }
        }
        
        totalSize += cacheSize;
        cacheCount += requests.length;
        caches.push({
          name: cacheName,
          size: cacheSize,
          count: requests.length
        });
      }
    } catch (error) {
      console.error('Error getting cache size:', error);
    }
  }
  
  return {
    totalSize,
    cacheCount,
    caches
  };
}

/**
 * Check if the app needs an update
 */
export async function needsUpdate(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!(registration && registration.waiting);
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }
  return false;
}

/**
 * Register service worker with error handling
 */
export async function registerServiceWorker(swPath: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register(swPath);
    console.log('Service worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}
