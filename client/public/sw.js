// Service Worker para ProfitShards Tools PWA
const CACHE_NAME = 'profitshards-v1';
const STATIC_CACHE_NAME = 'profitshards-static-v1';

// Assets para cache offline
const STATIC_ASSETS = [
  '/',
  '/perfil',
  '/crystal-icon.svg',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 PWA: Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 PWA: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ PWA: Service Worker installed successfully');
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ PWA: Install failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🚀 PWA: Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('🗑️ PWA: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ PWA: Service Worker activated');
        self.clients.claim();
      })
  );
});

// Fetch event - Cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Só interceptar requests do mesmo origin
  if (url.origin !== location.origin) {
    return;
  }

  // Strategy: Network First para APIs, Cache First para assets
  if (url.pathname.startsWith('/api/')) {
    // APIs: Network first com fallback
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache se network falhar
          return caches.match(request)
            .then((response) => {
              return response || new Response('Offline', { status: 503 });
            });
        })
    );
  } else {
    // Assets: Cache first
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
    );
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('🔔 PWA: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do ProfitShards!',
    icon: '/crystal-icon.svg',
    badge: '/crystal-icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/crystal-icon.svg'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/crystal-icon.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ProfitShards Tools', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ PWA: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync (para ações offline)
self.addEventListener('sync', (event) => {
  console.log('🔄 PWA: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Implementar sync de dados quando voltar online
      console.log('📡 PWA: Syncing data...')
    );
  }
});

console.log('🎉 PWA: Service Worker loaded successfully');