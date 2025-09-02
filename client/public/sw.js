// Service Worker para ProfitShards - Cache inteligente offline
const CACHE_NAME = 'profitshards-v1';
const STATIC_CACHE = 'profitshards-static-v1';
const DYNAMIC_CACHE = 'profitshards-dynamic-v1';

// Arquivos para cache estático (CSS, JS, imagens)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/crystal-icon.svg'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First: Para recursos estáticos
  STATIC: 'cache-first',
  // Network First: Para APIs e dados dinâmicos
  DYNAMIC: 'network-first',
  // Stale While Revalidate: Para recursos que podem ser atualizados
  STALE: 'stale-while-revalidate'
};

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('🚀 [SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 [SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ [SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ [SW] Failed to cache static assets:', error);
      })
  );
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('🔄 [SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remover caches antigos
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ [SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requisições para APIs externas
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Determinar estratégia de cache baseada no tipo de recurso
  const strategy = getCacheStrategy(request);
  
  console.log(`🌐 [SW] Fetching: ${url.pathname} (strategy: ${strategy})`);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Determinar estratégia de cache
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // APIs e dados dinâmicos
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.DYNAMIC;
  }
  
  // Recursos estáticos
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return CACHE_STRATEGIES.STATIC;
  }
  
  // Páginas HTML
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    return CACHE_STRATEGIES.STALE;
  }
  
  // Padrão: network first
  return CACHE_STRATEGIES.DYNAMIC;
}

// Manipular requisição baseada na estratégia
async function handleRequest(request, strategy) {
  try {
    switch (strategy) {
      case CACHE_STRATEGIES.STATIC:
        return await cacheFirst(request);
      case CACHE_STRATEGIES.DYNAMIC:
        return await networkFirst(request);
      case CACHE_STRATEGIES.STALE:
        return await staleWhileRevalidate(request);
      default:
        return await networkFirst(request);
    }
  } catch (error) {
    console.error('❌ [SW] Error handling request:', error);
    
    // Fallback: tentar cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback final: página offline
    if (request.destination === 'document') {
      return getOfflinePage();
    }
    
    throw error;
  }
}

// Estratégia: Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('📦 [SW] Serving from cache:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('💾 [SW] Cached new resource:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ [SW] Network failed for cache-first:', error);
    throw error;
  }
}

// Estratégia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache da resposta
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('💾 [SW] Cached dynamic response:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 [SW] Network failed, trying cache:', request.url);
    
    // Tentar cache como fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 [SW] Serving from cache (fallback):', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Retornar cache imediatamente se disponível
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('💾 [SW] Updated stale resource:', request.url);
    }
  }).catch((error) => {
    console.log('⚠️ [SW] Failed to update stale resource:', error);
  });
  
  if (cachedResponse) {
    console.log('📦 [SW] Serving stale response:', request.url);
    return cachedResponse;
  }
  
  // Se não há cache, aguardar resposta da rede
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Obter página offline
async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE);
  const offlineResponse = await cache.match('/offline.html');
  
  if (offlineResponse) {
    return offlineResponse;
  }
  
  // Página offline padrão
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ProfitShards - Offline</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: #f5f5f5; 
        }
        .offline-container { 
          max-width: 500px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 10px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .offline-icon { 
          font-size: 64px; 
          margin-bottom: 20px; 
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        .retry-btn { 
          background: #4f46e5; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 6px; 
          cursor: pointer; 
          margin-top: 20px; 
        }
        .retry-btn:hover { background: #4338ca; }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1>Você está offline</h1>
        <p>Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.</p>
        <p>Algumas funcionalidades podem continuar funcionando offline.</p>
        <button class="retry-btn" onclick="window.location.reload()">Tentar novamente</button>
      </div>
    </body>
    </html>
  `;
  
  const response = new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
  
  cache.put('/offline.html', response.clone());
  return response;
}

// Limpar caches antigos periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Background sync para funcionalidades offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 [SW] Background sync triggered');
    
    event.waitUntil(
      // Sincronizar dados offline quando conexão for restaurada
      syncOfflineData()
    );
  }
});

// Sincronizar dados offline
async function syncOfflineData() {
  try {
    // Aqui você pode implementar a lógica para sincronizar
    // dados que foram salvos offline (ex: métricas, cálculos)
    console.log('📊 [SW] Syncing offline data...');
    
    // Exemplo: sincronizar métricas offline
    const offlineMetrics = await getOfflineMetrics();
    if (offlineMetrics.length > 0) {
      await syncMetrics(offlineMetrics);
      console.log('✅ [SW] Offline data synced successfully');
    }
  } catch (error) {
    console.error('❌ [SW] Failed to sync offline data:', error);
  }
}

// Obter métricas offline (exemplo)
async function getOfflineMetrics() {
  // Implementar lógica para obter métricas salvas offline
  return [];
}

// Sincronizar métricas (exemplo)
async function syncMetrics(metrics) {
  // Implementar lógica para enviar métricas para o servidor
  console.log('📤 [SW] Syncing metrics:', metrics.length);
}

console.log('🚀 [SW] ProfitShards Service Worker loaded successfully!');