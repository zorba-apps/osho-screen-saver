// PWA Configuration
const PWA_CONFIG = {
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
};

const PWA_EVENTS = {
  UPDATE_AVAILABLE: 'UPDATE_AVAILABLE',
  UPDATE_CHECK_COMPLETE: 'UPDATE_CHECK_COMPLETE',
  START_UPDATE_CHECK: 'START_UPDATE_CHECK',
  STOP_UPDATE_CHECK: 'STOP_UPDATE_CHECK',
  SKIP_WAITING: 'SKIP_WAITING'
};

// Static assets to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/src/app.css'
];

// Utility functions
function shouldCache(request) {
  return request.method === 'GET' && 
         request.url.startsWith('http') &&
         !request.url.includes('chrome-extension:') &&
         !request.url.includes('moz-extension:');
}

function getCacheName(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/src/') || url.pathname.includes('/assets/')
    ? PWA_CONFIG.CACHE_VERSIONS.STATIC
    : PWA_CONFIG.CACHE_VERSIONS.DYNAMIC;
}

function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  if (url.pathname.includes('/src/') || url.pathname.includes('/assets/')) {
    return PWA_CONFIG.CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  if (request.destination === 'document') {
    return PWA_CONFIG.CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  if (url.pathname.startsWith('/api/')) {
    return PWA_CONFIG.CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  return PWA_CONFIG.CACHE_STRATEGIES.CACHE_FIRST;
}

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PWA_CONFIG.CACHE_VERSIONS.STATIC)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip requests that shouldn't be cached
  if (!shouldCache(request)) {
    return;
  }

  const strategy = getCacheStrategy(request);
  const cacheName = getCacheName(request);

  event.respondWith(handleRequest(request, strategy, cacheName));
});

async function handleRequest(request, strategy, cacheName) {
  switch (strategy) {
    case PWA_CONFIG.CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName);
    case PWA_CONFIG.CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName);
    case PWA_CONFIG.CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName);
    default:
      return cacheFirst(request, cacheName);
  }
}

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  return fetchAndCache(request, cacheName);
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      await cacheResponse(request, response, cacheName);
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Network error', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetchAndCache(request, cacheName);
  
  // Return cached version immediately if available
  return cachedResponse || fetchPromise;
}

// Helper function to fetch and cache
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.status === 200) {
      await cacheResponse(request, response, cacheName);
    }
    
    return response;
  } catch (error) {
    console.log('Fetch failed:', error);
    throw error;
  }
}

// Helper function to cache a response
async function cacheResponse(request, response, cacheName) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== PWA_CONFIG.CACHE_VERSIONS.STATIC && 
              cacheName !== PWA_CONFIG.CACHE_VERSIONS.DYNAMIC) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Periodic update management
let updateInterval;

self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  
  switch (type) {
    case PWA_EVENTS.SKIP_WAITING:
      self.skipWaiting();
      break;
    case PWA_EVENTS.START_UPDATE_CHECK:
      startPeriodicUpdate();
      break;
    case PWA_EVENTS.STOP_UPDATE_CHECK:
      stopPeriodicUpdate();
      break;
  }
});

function startPeriodicUpdate() {
  if (!updateInterval) {
    updateInterval = setInterval(() => {
      checkForUpdates();
    }, PWA_CONFIG.UPDATE_CHECK_INTERVAL);
  }
}

function stopPeriodicUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

async function checkForUpdates() {
  try {
    // Check if there's a new service worker available
    const registration = await self.registration;
    if (registration) {
      await registration.update();
    }
    
    // Update dynamic cache with fresh content
    await updateDynamicCache();
    
    // Notify clients that update check is complete
    notifyClients({ type: PWA_EVENTS.UPDATE_CHECK_COMPLETE });
  } catch (error) {
    console.log('Update check failed:', error);
  }
}

async function updateDynamicCache() {
  const cache = await caches.open(PWA_CONFIG.CACHE_VERSIONS.DYNAMIC);
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        await cache.put(request, response);
      }
    } catch (error) {
      console.log('Failed to update cache for:', request.url);
    }
  }
}

// Helper function to notify all clients
async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(message);
  });
}
