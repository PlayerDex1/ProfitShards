// Service Worker para ProfitShards Calculator - Otimizado para Android
const CACHE_NAME = 'profitshards-v2.0.0';
const STATIC_CACHE = 'profitshards-static-v2.0.0';
const DYNAMIC_CACHE = 'profitshards-dynamic-v2.0.0';
const IMAGE_CACHE = 'profitshards-images-v2.0.0';
const API_CACHE = 'profitshards-api-v2.0.0';

// Arquivos para cache estático - Otimizado para Android
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-48x48.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512-maskable.png',
  '/offline.html'
];

// Configurações específicas para Android
const ANDROID_CONFIG = {
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  maxImageCacheSize: 20 * 1024 * 1024, // 20MB
  maxApiCacheSize: 10 * 1024 * 1024, // 10MB
  cacheExpiration: 7 * 24 * 60 * 60 * 1000, // 7 dias
  imageCacheExpiration: 30 * 24 * 60 * 60 * 1000, // 30 dias
  apiCacheExpiration: 60 * 60 * 1000 // 1 hora
};

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 [SW] Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ [SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ [SW] Error caching static files:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ [SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições - Otimizado para Android
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para diferentes tipos de requisições
  if (request.method === 'GET') {
    // Páginas HTML - Network First com cache agressivo
    if (request.headers.get('accept')?.includes('text/html')) {
      event.respondWith(androidNetworkFirstStrategy(request));
    }
    // API calls - Stale While Revalidate para melhor performance
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(androidApiStrategy(request));
    }
    // Imagens - Cache First com otimização
    else if (isImageAsset(request)) {
      event.respondWith(androidImageStrategy(request));
    }
    // Assets estáticos - Cache First
    else if (isStaticAsset(request)) {
      event.respondWith(androidCacheFirstStrategy(request));
    }
    // Outros recursos - Stale While Revalidate
    else {
      event.respondWith(androidStaleWhileRevalidateStrategy(request));
    }
  }
});

// Estratégia: Network First
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 [SW] Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Estratégia: Cache First
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('❌ [SW] Failed to fetch:', request.url);
    throw error;
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Estratégias otimizadas para Android

// Network First para HTML - com cache agressivo
async function androidNetworkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 [SW] Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return caches.match('/offline.html');
  }
}

// API Strategy - Stale While Revalidate para melhor performance
async function androidApiStrategy(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Image Strategy - Cache First com otimização
async function androidImageStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE);
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
    console.error('❌ [SW] Failed to fetch image:', request.url);
    throw error;
  }
}

// Cache First otimizado para Android
async function androidCacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('❌ [SW] Failed to fetch:', request.url);
    throw error;
  }
}

// Stale While Revalidate otimizado para Android
async function androidStaleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Verificar se é uma imagem
function isImageAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/screenshots/')
  );
}

// Verificar se é um asset estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.eot')
  );
}

// Background Sync para dados offline
self.addEventListener('sync', (event) => {
  console.log('🔄 [SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sincronizar dados offline quando voltar online
    console.log('🔄 [SW] Performing background sync...');
    
    // Aqui você pode implementar lógica para sincronizar
    // dados que foram salvos offline
    
    console.log('✅ [SW] Background sync completed');
  } catch (error) {
    console.error('❌ [SW] Background sync failed:', error);
  }
}

// Push notifications otimizadas para Android
self.addEventListener('push', (event) => {
  console.log('📱 [SW] Push notification received');
  
  let notificationData = {
    title: 'ProfitShards',
    body: 'Nova atualização disponível!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  const options = {
    ...notificationData,
    // Configurações específicas para Android
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: false,
    silent: false,
    tag: 'profitshards-notification',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
        icon: '/icons/icon-96x96.png'
      }
    ],
    // Android-specific options
    android: {
      channelId: 'profitshards-updates',
      priority: 'high',
      visibility: 'public'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Click em notificações - Otimizado para Android
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  const action = event.action || 'open';
  const urlToOpen = event.notification.data?.url || '/';
  
  if (action === 'open' || action === 'explore') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Se já existe uma janela aberta, focar nela
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // Se não existe, abrir nova janela
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (action === 'dismiss') {
    // Apenas fechar a notificação
    console.log('📱 [SW] Notification dismissed');
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('💬 [SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});