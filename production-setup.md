# Configuração do Ambiente de Produção

## Cloudflare Pages

### 1. Criar Projeto

1. Acesse [Cloudflare Pages](https://pages.cloudflare.com/)
2. Clique em "Create a project"
3. Conecte com GitHub e selecione o repositório
4. Configure:
   - **Project name**: `worldshards-auth`
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: `npm run build:vercel`
   - **Build output directory**: `dist/public`

### 2. Configurar Variáveis de Ambiente

No projeto Pages > Settings > Environment variables:

#### Production
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Preview
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Configurar Banco D1

1. Vá para [Cloudflare D1](https://dash.cloudflare.com/?to=/:account/workers/d1)
2. Clique em "Create database"
3. Nome: `worldshards-db`
4. Após criar, copie o Database ID

### 4. Aplicar Schema

```bash
# Instalar Wrangler
npm install -g wrangler

# Fazer login
wrangler login

# Aplicar schema
wrangler d1 execute worldshards-db --file=./d1-schema.sql
```

### 5. Configurar Binding

No projeto Pages > Settings > Functions > D1 database bindings:

- **Variable name**: `DB`
- **D1 database**: Selecione o banco criado

## Google Cloud Console

### 1. Configurar OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto
3. Vá para "APIs & Services" > "Credentials"
4. Edite o OAuth 2.0 Client ID
5. Adicione os URIs de redirecionamento:
   ```
   https://your-domain.pages.dev/api/auth/google/callback
   https://www.your-domain.pages.dev/api/auth/google/callback
   ```

## GitHub Actions

### 1. Configurar Secrets

No repositório GitHub > Settings > Secrets and variables > Actions:

```
PAT_PUSH=your-github-pat-token
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_PROJECT_NAME=worldshards-auth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Habilitar Permissões

GitHub > Settings > Actions > General > Workflow permissions:
- Selecione "Read and write permissions"

## Deploy

### 1. Deploy Manual

1. Faça commit das alterações
2. Push para branch `main`
3. O deploy automático será iniciado

### 2. Deploy via GitHub Actions

1. Vá para Actions no GitHub
2. Execute o workflow "Deploy with Google OAuth"

### 3. Verificar Deploy

1. Acesse o domínio do Pages
2. Teste o endpoint: `https://your-domain.pages.dev/api/auth/google/start`
3. Deve retornar 302 (redirecionamento)

## Monitoramento

### 1. Logs

- Cloudflare Pages > Deployments > [deployment] > Functions logs
- Cloudflare Analytics > Pages

### 2. Métricas

- Número de logins
- Taxa de sucesso
- Tempo de resposta

### 3. Alertas

Configure alertas para:
- Erros 5xx
- Tempo de resposta alto
- Falhas de autenticação

## Segurança

### 1. HTTPS

- Cloudflare Pages força HTTPS automaticamente
- Cookies configurados como Secure

### 2. CORS

- Configurado apenas para domínios permitidos
- Headers de segurança configurados

### 3. Rate Limiting

- Cloudflare oferece proteção DDoS
- Configure rate limiting se necessário

## Backup

### 1. Banco de Dados

```bash
# Backup do D1
wrangler d1 export worldshards-db --output=backup.sql
```

### 2. Código

- GitHub mantém histórico completo
- Use tags para releases

## Troubleshooting

### Problemas Comuns

1. **Erro 404 no endpoint Google**
   - Verificar se as functions estão no diretório correto
   - Verificar configuração do Pages

2. **Erro de autenticação**
   - Verificar Client ID e Secret
   - Verificar URIs de redirecionamento

3. **Erro de banco**
   - Verificar binding do D1
   - Verificar schema aplicado

### Logs Úteis

```bash
# Logs do Wrangler
wrangler tail

# Logs do D1
wrangler d1 execute worldshards-db --command="SELECT * FROM migrations"
```