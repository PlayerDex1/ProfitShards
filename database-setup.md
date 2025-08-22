# Configuração do Banco de Dados

## Cloudflare D1 (Recomendado)

### 1. Criar banco D1

```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Fazer login no Cloudflare
wrangler login

# Criar banco de dados
wrangler d1 create worldshards-db

# Aplicar schema
wrangler d1 execute worldshards-db --file=./d1-schema.sql
```

### 2. Configurar variáveis de ambiente

No Cloudflare Pages, configure as seguintes variáveis:

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Configurar binding do banco

No Cloudflare Pages > Settings > Functions > D1 database bindings:

- **Variable name**: `DB`
- **D1 database**: Selecione o banco criado

## PostgreSQL (Alternativo)

Se preferir usar PostgreSQL:

### 1. Configurar variáveis de ambiente

```
DATABASE_URL=postgresql://user:password@host:port/database
```

### 2. Aplicar migrações

```bash
npm run db:push
```

## Estrutura das Tabelas

### Tabela `users`
- `id`: ID único do usuário (UUID)
- `email`: Email do usuário (único)
- `pass_hash`: Hash da senha (vazio para usuários Google)
- `created_at`: Timestamp de criação
- `email_verified`: Se o email foi verificado (1 para Google)
- `username`: Nome de usuário
- `google_sub`: ID único do Google (único)

### Tabela `sessions`
- `session_id`: ID da sessão (UUID)
- `user_id`: ID do usuário (referência para users.id)
- `created_at`: Timestamp de criação
- `expires_at`: Timestamp de expiração

### Tabela `migrations`
- `version`: Versão da migração
- `applied_at`: Timestamp de aplicação