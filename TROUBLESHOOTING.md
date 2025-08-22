# Guia de Troubleshooting

## 🔍 Diagnóstico Rápido

### Verificar Status do Serviço
```bash
# Verificar se o serviço está online
curl -I https://your-domain.com/api/auth/me

# Verificar logs do Cloudflare
wrangler tail
```

### Verificar Configuração
```bash
# Verificar variáveis de ambiente
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Verificar banco de dados
wrangler d1 execute worldshards-db --command="SELECT COUNT(*) FROM users"
```

## 🚨 Problemas Comuns

### 1. Erro 404 no Endpoint Google

#### Sintomas
- `/api/auth/google/start` retorna 404
- Botão "Continuar com Google" não funciona

#### Causas Possíveis
- Functions não estão no diretório correto
- Configuração do Cloudflare Pages incorreta
- Deploy não foi realizado

#### Soluções
```bash
# 1. Verificar estrutura de arquivos
ls -la functions/api/auth/google/

# 2. Verificar se o arquivo existe
cat functions/api/auth/google/start.ts

# 3. Fazer novo deploy
npm run build
git add .
git commit -m "fix: corrigir endpoints google"
git push
```

### 2. Erro de Autenticação Google

#### Sintomas
- Redirecionamento para Google falha
- Erro "Invalid client" ou "Redirect URI mismatch"

#### Causas Possíveis
- Client ID ou Secret incorretos
- URIs de redirecionamento não configurados
- Projeto Google não está ativo

#### Soluções
1. **Verificar Google Cloud Console**:
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Vá para "APIs & Services" > "Credentials"
   - Verifique OAuth 2.0 Client ID

2. **Configurar URIs de redirecionamento**:
   ```
   https://your-domain.com/api/auth/google/callback
   https://www.your-domain.com/api/auth/google/callback
   http://localhost:5000/api/auth/google/callback (desenvolvimento)
   ```

3. **Verificar variáveis de ambiente**:
   ```bash
   # Cloudflare Pages
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### 3. Erro de Banco de Dados

#### Sintomas
- Erro 500 ao fazer login
- Mensagem "Database error" ou "Migration failed"

#### Causas Possíveis
- Banco D1 não configurado
- Schema não aplicado
- Binding incorreto

#### Soluções
```bash
# 1. Verificar se o banco existe
wrangler d1 list

# 2. Aplicar schema
wrangler d1 execute worldshards-db --file=./d1-schema.sql

# 3. Verificar binding no Cloudflare Pages
# Settings > Functions > D1 database bindings
# Variable name: DB
# D1 database: worldshards-db
```

### 4. Problemas de Sessão

#### Sintomas
- Usuário é deslogado frequentemente
- Sessão não persiste entre páginas
- Erro "Session expired"

#### Causas Possíveis
- Cookies não configurados corretamente
- Domínio incorreto
- HTTPS não configurado

#### Soluções
1. **Verificar configuração de cookies**:
   ```typescript
   // Em functions/api/auth/google/callback.ts
   headers.append('Set-Cookie', `ps_session=${sessionId}; Path=/; Domain=${cookieDomain}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*24*7}`);
   ```

2. **Verificar domínio**:
   ```typescript
   const host = new URL(request.url).host;
   const apex = host.replace(/^www\./, '');
   const cookieDomain = `.${apex}`;
   ```

### 5. Problemas de CORS

#### Sintomas
- Erro "CORS policy" no console
- Requisições bloqueadas pelo navegador

#### Causas Possíveis
- Headers CORS não configurados
- Domínio não autorizado

#### Soluções
```typescript
// Adicionar headers CORS
const headers = new Headers({
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
});
```

## 🔧 Ferramentas de Debug

### Logs do Cloudflare
```bash
# Ver logs em tempo real
wrangler tail

# Ver logs de um deployment específico
wrangler pages deployment tail <deployment-id>
```

### Console do Navegador
```javascript
// Verificar se está autenticado
fetch('/api/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log);

// Verificar cookies
console.log(document.cookie);
```

### Teste de Endpoints
```bash
# Testar endpoint de autenticação
curl -I https://your-domain.com/api/auth/google/start

# Testar endpoint de usuário
curl -H "Cookie: ps_session=test" https://your-domain.com/api/auth/me
```

## 📊 Monitoramento

### Métricas Importantes
- **Uptime**: Deve ser >99.9%
- **Response Time**: Deve ser <200ms
- **Error Rate**: Deve ser <0.1%
- **Success Rate**: Deve ser >99%

### Alertas Configurar
- Erros 5xx > 1%
- Response time > 500ms
- Uptime < 99%
- Falhas de autenticação > 5%

## 🛠️ Manutenção

### Backup do Banco
```bash
# Backup completo
wrangler d1 export worldshards-db --output=backup-$(date +%Y%m%d).sql

# Backup incremental
wrangler d1 execute worldshards-db --command="SELECT * FROM users WHERE updated_at > '2024-01-01'"
```

### Limpeza de Dados
```bash
# Limpar sessões expiradas
wrangler d1 execute worldshards-db --command="DELETE FROM sessions WHERE expires_at < strftime('%s', 'now')"

# Limpar logs antigos
wrangler d1 execute worldshards-db --command="DELETE FROM logs WHERE created_at < strftime('%s', 'now', '-30 days')"
```

### Atualizações
```bash
# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit

# Atualizar schema
wrangler d1 execute worldshards-db --file=./migrations/new-migration.sql
```

## 🆘 Suporte

### Informações Necessárias
Ao reportar um problema, inclua:
- **URL**: Página onde ocorreu o erro
- **Navegador**: Versão e sistema operacional
- **Console**: Logs de erro do navegador
- **Network**: Requisições que falharam
- **Reprodução**: Passos para reproduzir

### Canais de Suporte
- **Email**: [support@worldshards.com](mailto:support@worldshards.com)
- **GitHub**: [Issues](https://github.com/seu-usuario/worldshards-auth/issues)
- **Discord**: [Servidor](https://discord.gg/worldshards)

### Escalação
1. **Nível 1**: Suporte básico (24h)
2. **Nível 2**: Problemas técnicos (4h)
3. **Nível 3**: Emergências (1h)

---

**Precisa de ajuda?**  
[support@worldshards.com](mailto:support@worldshards.com)