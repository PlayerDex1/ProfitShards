# Política de Segurança

## 🛡️ Medidas de Segurança Implementadas

### Autenticação e Autorização

#### Google OAuth 2.0
- **Protocolo Seguro**: OAuth 2.0 com PKCE
- **Escopo Limitado**: Apenas `openid email profile`
- **Validação de Tokens**: Verificação no servidor
- **Refresh Tokens**: Não utilizados (sessões próprias)

#### Sessões Seguras
```typescript
// Configuração de cookies seguros
const cookieOptions = {
  httpOnly: true,        // Não acessível via JavaScript
  secure: true,          // Apenas HTTPS
  sameSite: 'lax',       // Proteção CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  domain: `.${apex}`     // Domínio correto
};
```

### Proteção de Dados

#### Criptografia
- **HTTPS**: Forçado em produção
- **Dados em Trânsito**: TLS 1.3
- **Dados em Repouso**: Criptografados no D1
- **Senhas**: Hash bcrypt (para usuários não-Google)

#### Sanitização
```typescript
// Validação de entrada com Zod
const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  google_sub: z.string().optional()
});

// Sanitização de saída
const sanitizeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  // Não incluir: pass_hash, google_sub
});
```

### Headers de Segurança

#### Configuração de Headers
```typescript
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com",
    "frame-src https://accounts.google.com"
  ].join('; ')
};
```

### Rate Limiting

#### Proteção contra Ataques
```typescript
// Rate limiting por IP
const rateLimit = new Map<string, number[]>();

export async function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}
```

## 🔒 Vulnerabilidades Comuns

### OWASP Top 10

#### 1. Broken Access Control
```typescript
// Verificação de autorização
export async function requireAuth(request: Request) {
  const session = await getSession(request);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

// Verificação de propriedade
export async function requireOwnership(userId: string, resourceUserId: string) {
  if (userId !== resourceUserId) {
    throw new Error('Forbidden');
  }
}
```

#### 2. Cryptographic Failures
```typescript
// Geração segura de tokens
import { randomBytes } from 'crypto';

export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

// Hash seguro de senhas
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
```

#### 3. Injection
```typescript
// Prepared statements (D1 já faz isso)
const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();

// Validação de entrada
const { email } = userSchema.parse(requestBody);
```

#### 4. Insecure Design
```typescript
// Princípio do menor privilégio
const userPermissions = {
  read: ['own_data'],
  write: ['own_data'],
  delete: [] // Usuários não podem deletar
};

// Validação de permissões
export function checkPermission(user: User, action: string, resource: string): boolean {
  return userPermissions[action]?.includes(resource) || false;
}
```

#### 5. Security Misconfiguration
```typescript
// Configuração segura
const config = {
  production: {
    cors: {
      origin: ['https://your-domain.com'],
      credentials: true
    },
    session: {
      secret: process.env.SESSION_SECRET,
      secure: true
    }
  }
};
```

## 🚨 Reportando Vulnerabilidades

### Processo de Reporte

#### Informações Necessárias
- **Descrição**: Detalhes da vulnerabilidade
- **Reprodução**: Passos para reproduzir
- **Impacto**: Possível impacto da vulnerabilidade
- **Severidade**: Baixa/Média/Alta/Crítica

#### Canais de Reporte
- **Email**: [security@worldshards.com](mailto:security@worldshards.com)
- **GitHub**: [Security Advisories](https://github.com/seu-usuario/worldshards-auth/security/advisories)
- **HackerOne**: [Programa de Bug Bounty](#)

### Processo de Resposta

#### Timeline
1. **Confirmação**: 48 horas
2. **Investigação**: 1-2 semanas
3. **Correção**: 1-4 semanas
4. **Disclosure**: 30 dias após correção

#### Créditos
- Nome ou pseudônimo do pesquisador
- Link para perfil (se desejado)
- Agradecimentos públicos

## 🔍 Auditoria de Segurança

### Checklist de Segurança

#### Autenticação
- [ ] OAuth 2.0 implementado corretamente
- [ ] Tokens validados no servidor
- [ ] Sessões com expiração
- [ ] Logout seguro

#### Autorização
- [ ] Verificação de permissões
- [ ] Controle de acesso por recurso
- [ ] Princípio do menor privilégio
- [ ] Validação de propriedade

#### Dados
- [ ] Criptografia em trânsito
- [ ] Criptografia em repouso
- [ ] Sanitização de entrada
- [ ] Sanitização de saída

#### Infraestrutura
- [ ] HTTPS forçado
- [ ] Headers de segurança
- [ ] Rate limiting
- [ ] Logs de segurança

### Ferramentas de Auditoria

#### Análise Estática
```bash
# ESLint Security
npm install eslint-plugin-security
npm run lint:security

# Snyk
npm install -g snyk
snyk test
snyk monitor
```

#### Análise Dinâmica
```bash
# OWASP ZAP
zap-cli quick-scan https://your-domain.com

# Burp Suite
# Análise manual de endpoints
```

#### Testes de Penetração
```bash
# Testes automatizados
npm run test:security

# Testes manuais
# Verificar cada endpoint
# Testar autenticação
# Verificar autorização
```

## 📊 Métricas de Segurança

### Indicadores

#### Vulnerabilidades
- **Críticas**: 0
- **Altas**: 0
- **Médias**: <5
- **Baixas**: <10

#### Incidentes
- **Vazamentos**: 0
- **Ataques**: Monitorados
- **Tempo de Resposta**: <24h
- **Tempo de Correção**: <7 dias

### Monitoramento

#### Logs de Segurança
```typescript
// Log de tentativas de login
export function logAuthAttempt(email: string, success: boolean, ip: string) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'auth_attempt',
    email: email,
    success: success,
    ip: ip,
    userAgent: request.headers.get('user-agent')
  }));
}

// Log de ações sensíveis
export function logSensitiveAction(userId: string, action: string, details: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'sensitive_action',
    userId: userId,
    action: action,
    details: details
  }));
}
```

#### Alertas
```typescript
// Alerta de múltiplas tentativas de login
export function checkLoginAttempts(email: string, ip: string) {
  const attempts = getRecentAttempts(email, ip);
  if (attempts.length > 5) {
    sendSecurityAlert('Multiple login attempts', { email, ip, attempts });
  }
}
```

## 🔄 Atualizações de Segurança

### Processo de Atualização

#### Dependências
```bash
# Verificar vulnerabilidades
npm audit

# Atualizar dependências de segurança
npm audit fix

# Atualizar dependências com breaking changes
npm update
```

#### Configurações
```bash
# Revisar configurações de segurança
# Verificar headers
# Verificar CORS
# Verificar rate limiting
```

#### Código
```bash
# Revisar código por vulnerabilidades
# Testar funcionalidades de segurança
# Verificar logs de segurança
```

### Comunicação

#### Notificações
- **Críticas**: Imediata
- **Altas**: 24 horas
- **Médias**: 72 horas
- **Baixas**: Semanal

#### Canais
- **Email**: Usuários registrados
- **Blog**: Post de segurança
- **GitHub**: Security advisory
- **Social Media**: Aviso público

## 📚 Recursos

### Documentação
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Cloudflare Security](https://www.cloudflare.com/security/)
- [Web Security Guidelines](https://web.dev/security/)

### Ferramentas
- [OWASP ZAP](https://owasp.org/www-project-zap/)
- [Snyk](https://snyk.io/)
- [Burp Suite](https://portswigger.net/burp)
- [ESLint Security](https://github.com/nodesecurity/eslint-plugin-security)

### Comunidade
- [OWASP Community](https://owasp.org/community/)
- [Security Stack Exchange](https://security.stackexchange.com/)
- [HackerOne](https://www.hackerone.com/)
- [Bugcrowd](https://www.bugcrowd.com/)

---

**Segurança é prioridade** 🛡️