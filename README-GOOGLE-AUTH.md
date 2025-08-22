# Configuração do Login Google

## Configuração no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure:
   - Application type: Web application
   - Name: Worldshards Auth
   - Authorized redirect URIs: 
     - `https://your-domain.com/api/auth/google/callback`
     - `https://www.your-domain.com/api/auth/google/callback`

## Variáveis de Ambiente

### Cloudflare Pages (Production e Preview)

Configure as seguintes variáveis de ambiente:

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### GitHub Secrets (para deploy automático)

Configure os seguintes secrets no GitHub:

```
PAT_PUSH=your-github-pat-token
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_PROJECT_NAME=your-cloudflare-project-name
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Configuração do Banco de Dados

O sistema usa Cloudflare D1 (SQLite) com as seguintes tabelas:

### Tabela `users`
- `id`: ID único do usuário
- `email`: Email do usuário (único)
- `pass_hash`: Hash da senha (vazio para usuários Google)
- `created_at`: Timestamp de criação
- `email_verified`: Se o email foi verificado (1 para Google)
- `username`: Nome de usuário
- `google_sub`: ID único do Google (único)

### Tabela `sessions`
- `session_id`: ID da sessão
- `user_id`: ID do usuário
- `created_at`: Timestamp de criação
- `expires_at`: Timestamp de expiração

## Endpoints

### `/api/auth/google/start`
Inicia o fluxo de autenticação Google OAuth.

### `/api/auth/google/callback`
Callback do Google OAuth que:
1. Troca o código por token
2. Busca informações do usuário
3. Cria/atualiza usuário no banco
4. Cria sessão
5. Redireciona para a aplicação

### `/api/auth/me`
Retorna informações do usuário autenticado.

### `/api/auth/logout`
Remove a sessão e limpa o cookie.

## Fluxo de Autenticação

1. Usuário clica em "Continuar com Google"
2. É redirecionado para `/api/auth/google/start`
3. Google redireciona para `/api/auth/google/callback`
4. Sistema cria/atualiza usuário e sessão
5. Usuário é redirecionado para a aplicação autenticado

## Segurança

- Cookies HttpOnly e Secure
- Sessões com expiração (7 dias)
- Validação de tokens Google
- Proteção CSRF com SameSite=Lax