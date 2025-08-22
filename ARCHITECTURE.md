# Arquitetura do Sistema

## 🏗️ Visão Geral

O Worldshards é uma aplicação web moderna construída com arquitetura de microserviços, utilizando tecnologias de ponta para performance e escalabilidade.

## 📐 Diagrama de Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Functions)   │◄──►│   (D1/PostgreSQL)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Load Balancer │    │   Cache         │
│   (Cloudflare)  │    │   (Cloudflare)  │    │   (Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Componentes Principais

### Frontend (Client)
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Hooks + Context
- **Routing**: Wouter
- **Deploy**: Cloudflare Pages

### Backend (Server)
- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Framework**: Express.js (compatível)
- **Authentication**: Google OAuth 2.0
- **API**: RESTful endpoints

### Database
- **Primary**: Cloudflare D1 (SQLite)
- **Fallback**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migrations**: Automáticas

### Infrastructure
- **CDN**: Cloudflare
- **DNS**: Cloudflare
- **SSL**: Cloudflare (automático)
- **Monitoring**: Cloudflare Analytics

## 🔐 Autenticação e Segurança

### Fluxo de Autenticação
```
1. User clicks "Login with Google"
2. Redirect to /api/auth/google/start
3. Google OAuth flow
4. Callback to /api/auth/google/callback
5. Create/update user in database
6. Set session cookie
7. Redirect to app
```

### Segurança
- **HTTPS**: Forçado em produção
- **Cookies**: HttpOnly, Secure, SameSite=Lax
- **CORS**: Configurado adequadamente
- **Rate Limiting**: Proteção DDoS
- **Input Validation**: Zod schemas

## 📊 Estrutura de Dados

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  email_verified INTEGER DEFAULT 0,
  username TEXT,
  google_sub TEXT UNIQUE
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Migrations Table
```sql
CREATE TABLE migrations (
  version TEXT PRIMARY KEY,
  applied_at INTEGER NOT NULL
);
```

## 🔄 Fluxo de Dados

### Request Flow
```
1. Client Request
2. Cloudflare CDN
3. Load Balancer
4. Worker Function
5. Database Query
6. Response
7. Cache (if applicable)
8. Client Response
```

### Data Flow
```
User Input → Validation → Processing → Database → Response → Cache → Client
```

## 🚀 Performance

### Otimizações
- **Code Splitting**: Lazy loading de componentes
- **Tree Shaking**: Remoção de código não usado
- **Minification**: Código otimizado
- **Compression**: Gzip/Brotli
- **Caching**: CDN + Browser cache

### Metrics
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

## 🔧 APIs

### Authentication Endpoints
- `GET /api/auth/google/start` - Inicia OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - User info
- `POST /api/auth/logout` - Logout

### Data Endpoints
- `GET /api/runs` - List runs
- `POST /api/runs` - Create run
- `GET /api/equipment` - User equipment
- `POST /api/equipment` - Update equipment

## 🗄️ Database Design

### Normalization
- **1NF**: Atomic values
- **2NF**: No partial dependencies
- **3NF**: No transitive dependencies

### Indexing Strategy
- **Primary Keys**: UUIDs
- **Foreign Keys**: Indexed
- **Search Fields**: Full-text search
- **Time Fields**: B-tree indexes

## 🔄 State Management

### Client State
- **User Data**: Context + localStorage
- **UI State**: React state
- **Cache**: Browser cache
- **Session**: Cookies

### Server State
- **User Sessions**: Database
- **Application Data**: Database
- **Cache**: Redis (future)
- **Logs**: Cloudflare logs

## 🛡️ Error Handling

### Client Errors
- **Network**: Retry logic
- **Validation**: Form validation
- **Auth**: Redirect to login
- **UI**: Error boundaries

### Server Errors
- **Database**: Connection pooling
- **Validation**: Input sanitization
- **Auth**: Token validation
- **Logging**: Structured logs

## 📈 Monitoring

### Metrics
- **Uptime**: 99.9%
- **Response Time**: <200ms
- **Error Rate**: <0.1%
- **Throughput**: 1000 req/s

### Logging
- **Structured**: JSON format
- **Levels**: Error, Warn, Info, Debug
- **Retention**: 90 days
- **Search**: Full-text search

## 🔄 Deployment

### CI/CD Pipeline
```
1. Code Commit
2. GitHub Actions
3. Build & Test
4. Deploy to Cloudflare
5. Health Check
6. Rollback (if needed)
```

### Environments
- **Development**: Local + Vite
- **Staging**: Cloudflare Preview
- **Production**: Cloudflare Pages

## 🔮 Future Architecture

### Microservices
- **Auth Service**: Dedicated auth
- **Data Service**: CRUD operations
- **Analytics Service**: Metrics
- **Notification Service**: Alerts

### Event-Driven
- **Event Bus**: Message queue
- **Webhooks**: Real-time updates
- **Streaming**: Real-time data
- **Pub/Sub**: Decoupled services

### Serverless
- **Functions**: Cloudflare Workers
- **Storage**: Cloudflare R2
- **Database**: Cloudflare D1
- **CDN**: Cloudflare

## 📚 Best Practices

### Code Quality
- **TypeScript**: Strict mode
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Testing**: Unit + Integration

### Security
- **OWASP**: Top 10 compliance
- **Input Validation**: All inputs
- **Output Encoding**: XSS prevention
- **Access Control**: RBAC

### Performance
- **Lazy Loading**: Code splitting
- **Caching**: Multiple layers
- **Optimization**: Bundle analysis
- **Monitoring**: Real-time metrics

---

**Arquitetura em constante evolução** 🚀