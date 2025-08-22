# Guia de Performance

## 🚀 Otimizações Implementadas

### Frontend Performance

#### Code Splitting
```typescript
// Lazy loading de componentes
const AuthModal = lazy(() => import('./components/AuthModal'));
const EquipmentPanel = lazy(() => import('./components/EquipmentPanel'));

// Lazy loading de páginas
const Profile = lazy(() => import('./pages/profile'));
```

#### Bundle Optimization
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-*'],
          utils: ['date-fns', 'zod']
        }
      }
    }
  }
});
```

#### Image Optimization
```typescript
// Lazy loading de imagens
<img 
  src="placeholder.jpg"
  data-src="actual-image.jpg"
  loading="lazy"
  alt="Description"
/>
```

### Backend Performance

#### Database Optimization
```sql
-- Índices otimizados
CREATE INDEX idx_sessions_user_expires ON sessions(user_id, expires_at);
CREATE INDEX idx_users_email_verified ON users(email, email_verified);

-- Queries otimizadas
SELECT u.*, s.session_id 
FROM users u 
JOIN sessions s ON u.id = s.user_id 
WHERE s.session_id = ? AND s.expires_at > ?
LIMIT 1;
```

#### Caching Strategy
```typescript
// Cache de sessões
const sessionCache = new Map<string, Session>();

// Cache de usuários
const userCache = new Map<string, User>();

// TTL de cache
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
```

## 📊 Métricas de Performance

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: <2.5s
- **FID (First Input Delay)**: <100ms
- **CLS (Cumulative Layout Shift)**: <0.1

### Performance Metrics
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.5s
- **Speed Index**: <2.0s

### API Performance
- **Response Time**: <200ms
- **Throughput**: 1000 req/s
- **Error Rate**: <0.1%

## 🔧 Ferramentas de Monitoramento

### Frontend Monitoring
```typescript
// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Backend Monitoring
```typescript
// Request timing
const startTime = Date.now();
// ... process request
const duration = Date.now() - startTime;
console.log(`Request took ${duration}ms`);
```

### Database Monitoring
```sql
-- Query performance
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = ?;

-- Slow query log
SELECT sql, duration FROM sqlite_stat1 WHERE duration > 100;
```

## 🎯 Otimizações Específicas

### Authentication Performance
```typescript
// Session validation cache
const sessionCache = new Map<string, { user: User; expires: number }>();

async function validateSession(sessionId: string): Promise<User | null> {
  // Check cache first
  const cached = sessionCache.get(sessionId);
  if (cached && cached.expires > Date.now()) {
    return cached.user;
  }

  // Query database
  const session = await db.prepare(`
    SELECT u.* FROM users u 
    JOIN sessions s ON u.id = s.user_id 
    WHERE s.session_id = ? AND s.expires_at > ?
  `).bind(sessionId, Date.now()).first();

  if (session) {
    // Cache result
    sessionCache.set(sessionId, {
      user: session,
      expires: Date.now() + 5 * 60 * 1000
    });
  }

  return session;
}
```

### Database Performance
```typescript
// Connection pooling
const dbPool = {
  connections: new Map(),
  maxConnections: 10,
  
  async getConnection() {
    // Implementation
  },
  
  async releaseConnection(connection) {
    // Implementation
  }
};

// Prepared statements
const preparedStatements = {
  getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  createSession: db.prepare('INSERT INTO sessions VALUES (?, ?, ?, ?)'),
  deleteSession: db.prepare('DELETE FROM sessions WHERE session_id = ?')
};
```

### CDN Optimization
```typescript
// Cache headers
const headers = new Headers({
  'Cache-Control': 'public, max-age=31536000, immutable',
  'ETag': generateETag(content),
  'Last-Modified': new Date().toUTCString()
});

// Conditional requests
if (request.headers.get('If-None-Match') === etag) {
  return new Response(null, { status: 304 });
}
```

## 📈 Performance Testing

### Load Testing
```bash
# Teste de carga com Artillery
artillery run load-test.yml

# Teste de stress
artillery run stress-test.yml

# Teste de spike
artillery run spike-test.yml
```

### Benchmark Testing
```typescript
// Benchmark de queries
const start = performance.now();
await db.prepare('SELECT * FROM users').all();
const duration = performance.now() - start;
console.log(`Query took ${duration}ms`);
```

### Memory Profiling
```typescript
// Memory usage monitoring
const memoryUsage = process.memoryUsage();
console.log({
  rss: memoryUsage.rss,
  heapTotal: memoryUsage.heapTotal,
  heapUsed: memoryUsage.heapUsed,
  external: memoryUsage.external
});
```

## 🔍 Performance Debugging

### Frontend Debugging
```typescript
// Performance marks
performance.mark('auth-start');
// ... authentication logic
performance.mark('auth-end');
performance.measure('authentication', 'auth-start', 'auth-end');

// Network timing
const navigation = performance.getEntriesByType('navigation')[0];
console.log({
  dns: navigation.domainLookupEnd - navigation.domainLookupStart,
  tcp: navigation.connectEnd - navigation.connectStart,
  ttfb: navigation.responseStart - navigation.requestStart,
  download: navigation.responseEnd - navigation.responseStart
});
```

### Backend Debugging
```typescript
// Request timing breakdown
const timings = {
  start: Date.now(),
  dbQuery: 0,
  processing: 0,
  response: 0
};

// Database query timing
const dbStart = Date.now();
await db.query();
timings.dbQuery = Date.now() - dbStart;

// Processing timing
const processStart = Date.now();
// ... processing logic
timings.processing = Date.now() - processStart;

// Response timing
timings.response = Date.now() - timings.start;
console.log('Request timings:', timings);
```

## 🚀 Otimizações Futuras

### Planned Improvements
- [ ] **Service Workers**: Cache offline
- [ ] **HTTP/2 Push**: Preload critical resources
- [ ] **WebP Images**: Modern image format
- [ ] **Critical CSS**: Inline critical styles
- [ ] **Resource Hints**: Preconnect, prefetch
- [ ] **Compression**: Brotli compression

### Advanced Optimizations
- [ ] **Edge Computing**: Cloudflare Workers
- [ ] **Database Sharding**: Horizontal scaling
- [ ] **Microservices**: Service decomposition
- [ ] **Event Sourcing**: Event-driven architecture
- [ ] **CQRS**: Command Query Responsibility Segregation

## 📊 Performance Budget

### Bundle Size Limits
- **JavaScript**: <500KB (gzipped)
- **CSS**: <50KB (gzipped)
- **Images**: <1MB total
- **Fonts**: <100KB (gzipped)

### Performance Targets
- **LCP**: <2.5s (target: <1.5s)
- **FID**: <100ms (target: <50ms)
- **CLS**: <0.1 (target: <0.05)
- **TTI**: <3.5s (target: <2.5s)

### API Targets
- **Response Time**: <200ms (target: <100ms)
- **Throughput**: 1000 req/s (target: 5000 req/s)
- **Error Rate**: <0.1% (target: <0.01%)

## 🔧 Performance Tools

### Development Tools
- **Lighthouse**: Performance auditing
- **WebPageTest**: Detailed analysis
- **Chrome DevTools**: Performance profiling
- **React DevTools**: Component profiling

### Production Tools
- **Cloudflare Analytics**: Real user metrics
- **Sentry**: Performance monitoring
- **DataDog**: APM and monitoring
- **New Relic**: Application performance

---

**Performance é prioridade** ⚡