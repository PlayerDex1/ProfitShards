# Guia de Manutenção

## 🔧 Manutenção Preventiva

### Atualizações Regulares

#### Dependências
```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências
npm update

# Atualizar dependências com breaking changes
npm update --save

# Verificar vulnerabilidades
npm audit
npm audit fix
npm audit fix --force
```

#### Node.js
```bash
# Verificar versão atual
node --version

# Atualizar Node.js (via nvm)
nvm install node
nvm use node

# Verificar compatibilidade
npm run check
```

### Backup e Recuperação

#### Backup do Banco de Dados
```bash
# Backup completo
wrangler d1 export worldshards-db --output=backup-$(date +%Y%m%d).sql

# Backup incremental
wrangler d1 execute worldshards-db --command="
  SELECT * FROM users WHERE updated_at > datetime('now', '-7 days')
" --output=backup-incremental-$(date +%Y%m%d).json

# Backup de configurações
cp wrangler.toml wrangler.toml.backup
cp .env .env.backup
```

#### Backup de Código
```bash
# Criar tag de release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Criar branch de backup
git checkout -b backup/$(date +%Y%m%d)
git push origin backup/$(date +%Y%m%d)
```

### Monitoramento

#### Logs
```bash
# Ver logs em tempo real
wrangler tail

# Ver logs de um período específico
wrangler pages deployment tail <deployment-id> --since=1h

# Exportar logs
wrangler pages deployment tail <deployment-id> --format=json > logs.json
```

#### Métricas
```bash
# Ver analytics
wrangler pages analytics --project-name=worldshards-auth

# Ver métricas de performance
curl -s https://your-domain.com/api/health | jq

# Ver status do banco
wrangler d1 execute worldshards-db --command="SELECT COUNT(*) FROM users"
```

## 🧹 Limpeza e Otimização

### Limpeza de Dados

#### Sessões Expiradas
```bash
# Limpar sessões expiradas
wrangler d1 execute worldshards-db --command="
  DELETE FROM sessions 
  WHERE expires_at < strftime('%s', 'now')
"

# Verificar quantas sessões foram removidas
wrangler d1 execute worldshards-db --command="
  SELECT COUNT(*) as deleted_sessions 
  FROM sessions 
  WHERE expires_at < strftime('%s', 'now')
"
```

#### Logs Antigos
```bash
# Limpar logs antigos (se existir tabela de logs)
wrangler d1 execute worldshards-db --command="
  DELETE FROM logs 
  WHERE created_at < strftime('%s', 'now', '-30 days')
"
```

#### Usuários Inativos
```bash
# Identificar usuários inativos (último login > 90 dias)
wrangler d1 execute worldshards-db --command="
  SELECT u.email, u.created_at, MAX(s.created_at) as last_login
  FROM users u
  LEFT JOIN sessions s ON u.id = s.user_id
  GROUP BY u.id
  HAVING last_login < strftime('%s', 'now', '-90 days')
  OR last_login IS NULL
"
```

### Otimização de Performance

#### Índices
```sql
-- Verificar índices existentes
SELECT name, sql FROM sqlite_master WHERE type = 'index';

-- Criar índices otimizados
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires 
ON sessions(user_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_users_email_verified 
ON users(email, email_verified);

-- Analisar performance de queries
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = ?;
```

#### Cache
```bash
# Limpar cache do Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything": true}'
```

## 🔄 Atualizações de Sistema

### Atualizações de Segurança

#### Dependências de Segurança
```bash
# Verificar vulnerabilidades
npm audit

# Atualizar apenas dependências de segurança
npm audit fix

# Verificar dependências específicas
npm ls <package-name>
```

#### Configurações de Segurança
```bash
# Verificar headers de segurança
curl -I https://your-domain.com

# Verificar configuração SSL
curl -I https://your-domain.com/api/health

# Verificar CORS
curl -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://your-domain.com/api/auth/login
```

### Atualizações de Funcionalidades

#### Migrações de Banco
```bash
# Criar nova migração
echo "
-- Nova migração
ALTER TABLE users ADD COLUMN last_login INTEGER;
CREATE INDEX idx_users_last_login ON users(last_login);
" > migrations/$(date +%Y%m%d)_add_last_login.sql

# Aplicar migração
wrangler d1 execute worldshards-db --file=./migrations/$(date +%Y%m%d)_add_last_login.sql
```

#### Atualizações de Código
```bash
# Fazer backup antes da atualização
git checkout -b maintenance/$(date +%Y%m%d)
git push origin maintenance/$(date +%Y%m%d)

# Aplicar atualizações
git checkout main
git pull origin main

# Testar localmente
npm run test
npm run build

# Deploy
git push origin main
```

## 📊 Monitoramento Contínuo

### Alertas

#### Configuração de Alertas
```bash
# Script de monitoramento
#!/bin/bash
# monitor.sh

# Verificar uptime
response=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/api/health)
if [ $response -ne 200 ]; then
  echo "ALERT: Health check failed with status $response"
  # Enviar notificação
fi

# Verificar performance
response_time=$(curl -s -w "%{time_total}" -o /dev/null https://your-domain.com/api/health)
if (( $(echo "$response_time > 1.0" | bc -l) )); then
  echo "ALERT: Response time is $response_time seconds"
fi

# Verificar espaço em disco (se aplicável)
# df -h | grep -E '^/dev' | awk '{if($5 > 80) print "ALERT: Disk usage is " $5}'
```

#### Métricas Importantes
- **Uptime**: >99.9%
- **Response Time**: <200ms
- **Error Rate**: <0.1%
- **Memory Usage**: <80%
- **Disk Usage**: <80%

### Relatórios

#### Relatório Diário
```bash
#!/bin/bash
# daily-report.sh

echo "=== Daily Report $(date) ==="

# Usuários ativos
active_users=$(wrangler d1 execute worldshards-db --command="
  SELECT COUNT(DISTINCT user_id) 
  FROM sessions 
  WHERE created_at > strftime('%s', 'now', '-1 day')
" --json | jq -r '.results[0].values[0]')

echo "Active users: $active_users"

# Erros
error_count=$(wrangler tail --format=json | grep -c "ERROR" || echo "0")
echo "Errors: $error_count"

# Performance
avg_response_time=$(curl -s -w "%{time_total}" -o /dev/null https://your-domain.com/api/health)
echo "Average response time: ${avg_response_time}s"
```

#### Relatório Semanal
```bash
#!/bin/bash
# weekly-report.sh

echo "=== Weekly Report $(date) ==="

# Novos usuários
new_users=$(wrangler d1 execute worldshards-db --command="
  SELECT COUNT(*) 
  FROM users 
  WHERE created_at > strftime('%s', 'now', '-7 days')
" --json | jq -r '.results[0].values[0]')

echo "New users: $new_users"

# Sessões criadas
sessions_created=$(wrangler d1 execute worldshards-db --command="
  SELECT COUNT(*) 
  FROM sessions 
  WHERE created_at > strftime('%s', 'now', '-7 days')
" --json | jq -r '.results[0].values[0]')

echo "Sessions created: $sessions_created"

# Backup
wrangler d1 export worldshards-db --output=backup-weekly-$(date +%Y%m%d).sql
echo "Weekly backup created"
```

## 🚨 Emergências

### Procedimentos de Emergência

#### Site Down
```bash
# 1. Verificar status
curl -I https://your-domain.com

# 2. Verificar logs
wrangler tail

# 3. Rollback se necessário
wrangler pages deployment list --project-name=worldshards-auth
wrangler pages deployment rollback <previous-deployment-id>

# 4. Notificar equipe
# Enviar email/Slack/Discord
```

#### Vazamento de Dados
```bash
# 1. Isolar o problema
# Desabilitar funcionalidade afetada

# 2. Investigar
wrangler tail --format=json | grep -i "password\|token\|secret"

# 3. Rotacionar credenciais
# Atualizar GOOGLE_CLIENT_SECRET
# Invalidar sessões

# 4. Notificar usuários
# Enviar email de notificação
```

#### Ataque DDoS
```bash
# 1. Ativar proteção Cloudflare
# Dashboard > Security > DDoS Protection

# 2. Monitorar tráfego
wrangler pages analytics --project-name=worldshards-auth

# 3. Implementar rate limiting
# Verificar configurações de rate limiting

# 4. Notificar Cloudflare
# Abrir ticket de suporte se necessário
```

### Contatos de Emergência
- **Equipe Técnica**: [tech@worldshards.com](mailto:tech@worldshards.com)
- **Segurança**: [security@worldshards.com](mailto:security@worldshards.com)
- **Cloudflare Support**: [Suporte Cloudflare](https://support.cloudflare.com)
- **Google Cloud Support**: [Suporte Google](https://cloud.google.com/support)

## 📋 Checklist de Manutenção

### Diário
- [ ] Verificar logs de erro
- [ ] Monitorar performance
- [ ] Verificar uptime
- [ ] Backup automático

### Semanal
- [ ] Atualizar dependências
- [ ] Limpar dados antigos
- [ ] Verificar segurança
- [ ] Relatório de performance

### Mensal
- [ ] Backup completo
- [ ] Atualizações de segurança
- [ ] Otimização de performance
- [ ] Revisão de configurações

### Trimestral
- [ ] Auditoria de segurança
- [ ] Revisão de arquitetura
- [ ] Atualização de documentação
- [ ] Treinamento da equipe

---

**Manutenção preventiva é a chave** 🔧