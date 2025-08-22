# Guia de Deployment

## 🚀 Estratégias de Deployment

### Ambiente de Desenvolvimento
- **Local**: Vite dev server
- **Preview**: Cloudflare Pages Preview
- **Staging**: Cloudflare Pages Staging

### Ambiente de Produção
- **Production**: Cloudflare Pages Production
- **CDN**: Cloudflare CDN global
- **Database**: Cloudflare D1

## 📦 Build e Deploy

### Build Local
```bash
# Build para desenvolvimento
npm run dev

# Build para produção
npm run build

# Build para Vercel
npm run build:vercel
```

### Deploy Automático
```bash
# Deploy via GitHub Actions
git add .
git commit -m "feat: implement Google OAuth"
git push origin main

# Deploy manual via Wrangler
wrangler pages deploy dist/public --project-name=worldshards-auth
```

## 🔧 Configuração do Cloudflare

### 1. Criar Projeto Pages
```bash
# Via CLI
wrangler pages project create worldshards-auth

# Via Dashboard
# 1. Acesse https://pages.cloudflare.com
# 2. Clique em "Create a project"
# 3. Conecte com GitHub
# 4. Selecione o repositório
```

### 2. Configurar Build Settings
```yaml
# Build configuration
Project name: worldshards-auth
Production branch: main
Framework preset: None
Build command: npm run build:vercel
Build output directory: dist/public
Root directory: /
```

### 3. Configurar Environment Variables
```bash
# Production
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Preview
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Configurar D1 Database
```bash
# Criar banco
wrangler d1 create worldshards-db

# Aplicar schema
wrangler d1 execute worldshards-db --file=./d1-schema.sql

# Configurar binding no Pages
# Settings > Functions > D1 database bindings
# Variable name: DB
# D1 database: worldshards-db
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: ${{ secrets.CF_PROJECT_NAME }}
          directory: dist/public
          gitHubToken: ${{ secrets.PAT_PUSH }}
          environmentName: ${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }}
          secrets: |
            GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
            GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }}
```

### Secrets Necessários
```bash
# GitHub Secrets
PAT_PUSH=your-github-pat-token
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_PROJECT_NAME=worldshards-auth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🌐 Configuração de Domínio

### Domínio Personalizado
```bash
# Adicionar domínio customizado
wrangler pages domain add worldshards-auth your-domain.com

# Configurar DNS
# A ou CNAME para your-domain.com -> worldshards-auth.pages.dev
```

### SSL/TLS
```bash
# SSL automático via Cloudflare
# Não é necessário configurar manualmente
# Cloudflare fornece SSL gratuito automaticamente
```

## 📊 Monitoramento

### Health Checks
```typescript
// functions/api/health.ts
export async function onRequestGet() {
  try {
    // Verificar banco de dados
    await env.DB.prepare('SELECT 1').first();
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

### Métricas de Deploy
```bash
# Verificar status do deploy
wrangler pages deployment list --project-name=worldshards-auth

# Ver logs do deploy
wrangler pages deployment tail <deployment-id>

# Ver analytics
wrangler pages analytics --project-name=worldshards-auth
```

## 🔄 Rollback

### Rollback Manual
```bash
# Listar deployments
wrangler pages deployment list --project-name=worldshards-auth

# Fazer rollback
wrangler pages deployment rollback <deployment-id> --project-name=worldshards-auth
```

### Rollback Automático
```yaml
# GitHub Actions com rollback automático
- name: Health Check
  run: |
    sleep 30
    response=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/api/health)
    if [ $response -ne 200 ]; then
      echo "Health check failed, rolling back..."
      wrangler pages deployment rollback <previous-deployment-id>
      exit 1
    fi
```

## 🛡️ Segurança

### Headers de Segurança
```typescript
// Middleware de segurança
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
};

// Aplicar headers
Object.entries(securityHeaders).forEach(([key, value]) => {
  response.headers.set(key, value);
});
```

### Rate Limiting
```typescript
// Rate limiting básico
const rateLimit = new Map();

export async function onRequestGet({ request }) {
  const ip = request.headers.get('cf-connecting-ip');
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxRequests = 100;

  const userRequests = rateLimit.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return new Response('Too Many Requests', { status: 429 });
  }

  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);

  // Processar requisição
  return processRequest(request);
}
```

## 📈 Performance

### Otimizações de Build
```typescript
// vite.config.production.ts
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
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### Cache Strategy
```typescript
// Cache headers
const cacheHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'ETag': generateETag(content),
  'Last-Modified': new Date().toUTCString()
};

// Para APIs dinâmicas
const apiCacheHeaders = {
  'Cache-Control': 'private, max-age=300', // 5 minutos
  'Vary': 'Cookie'
};
```

## 🔍 Debugging

### Logs de Deploy
```bash
# Ver logs em tempo real
wrangler tail

# Ver logs de um deployment específico
wrangler pages deployment tail <deployment-id>

# Ver logs de functions
wrangler pages deployment tail <deployment-id> --format=pretty
```

### Debug Local
```bash
# Testar functions localmente
wrangler pages dev dist/public --compatibility-date=2024-01-01

# Testar com banco local
wrangler pages dev dist/public --compatibility-date=2024-01-01 --local
```

## 📋 Checklist de Deploy

### Pré-Deploy
- [ ] Testes passando
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] Domínio configurado

### Pós-Deploy
- [ ] Health check passando
- [ ] Funcionalidades testadas
- [ ] Performance verificada
- [ ] Logs monitorados
- [ ] Rollback preparado

### Monitoramento Contínuo
- [ ] Uptime > 99.9%
- [ ] Response time < 200ms
- [ ] Error rate < 0.1%
- [ ] Logs sem erros críticos
- [ ] Métricas de usuário

## 🚨 Troubleshooting

### Problemas Comuns

#### Build Falha
```bash
# Verificar dependências
npm ci

# Limpar cache
npm run clean
rm -rf node_modules package-lock.json
npm install

# Verificar Node.js version
node --version
```

#### Deploy Falha
```bash
# Verificar configuração
wrangler pages project list

# Verificar permissões
wrangler whoami

# Verificar secrets
wrangler pages secret list --project-name=worldshards-auth
```

#### Functions Não Funcionam
```bash
# Verificar estrutura
ls -la functions/api/auth/google/

# Verificar logs
wrangler tail

# Testar localmente
wrangler pages dev dist/public
```

---

**Deploy seguro e confiável** 🚀