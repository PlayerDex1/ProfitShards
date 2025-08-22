# 🔐 Configuração do Google OAuth - Guia Completo

Este guia mostra como configurar o login do Google para sua aplicação Worldshards Calculator.

## 📋 Pré-requisitos

- Conta Google/Gmail
- Acesso ao [Google Cloud Console](https://console.cloud.google.com/)
- Projeto já clonado e configurado localmente

## 🛠️ Passo a Passo

### 1. **Criar Projeto no Google Cloud Console**

1. Acesse [console.cloud.google.com](https://console.cloud.google.com/)
2. Clique em **"Selecionar projeto"** → **"Novo projeto"**
3. Nome do projeto: `Worldshards Calculator` (ou nome de sua escolha)
4. Clique em **"Criar"**

### 2. **Ativar APIs Necessárias**

1. No menu lateral, vá em **APIs e serviços** → **Biblioteca**
2. Pesquise por **"Google+ API"** ou **"Google Identity"**
3. Clique na API e depois em **"Ativar"**

### 3. **Configurar Tela de Consentimento OAuth**

1. Vá em **APIs e serviços** → **Tela de consentimento OAuth**
2. Selecione **"Externo"** (para qualquer usuário Google)
3. Preencha as informações obrigatórias:
   - **Nome do aplicativo**: `Worldshards Calculator`
   - **Email de suporte do usuário**: seu-email@gmail.com
   - **Domínios autorizados**: 
     - `localhost` (para desenvolvimento)
     - `seudominio.com` (para produção)
   - **Email do desenvolvedor**: seu-email@gmail.com
4. Clique em **"Salvar e continuar"**
5. **Escopos**: Pule esta etapa (padrão é suficiente)
6. **Usuários de teste**: Adicione seu email para testes
7. Clique em **"Salvar e continuar"**

### 4. **Criar Credenciais OAuth 2.0**

1. Vá em **APIs e serviços** → **Credenciais**
2. Clique em **"+ Criar credenciais"** → **"ID do cliente OAuth 2.0"**
3. **Tipo de aplicativo**: `Aplicativo da Web`
4. **Nome**: `Worldshards Calculator Web Client`
5. **URIs de origem JavaScript autorizados**:
   ```
   http://localhost:5000
   https://seudominio.com
   ```
6. **URIs de redirecionamento autorizados**:
   ```
   http://localhost:5000/api/auth/google/callback
   https://seudominio.com/api/auth/google/callback
   ```
7. Clique em **"Criar"**

### 5. **Copiar as Credenciais**

Após criar, você verá uma modal com:
- **ID do cliente**: `123456789-abcdef.apps.googleusercontent.com`
- **Chave secreta do cliente**: `GOCSPX-abcdef123456`

⚠️ **IMPORTANTE**: Guarde essas credenciais com segurança!

## 🔧 Configuração Local

### 1. **Arquivo .env**

Crie/edite o arquivo `.env` na raiz do projeto:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/worldshards_db

# Google OAuth Configuration
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui

# Session Configuration
SESSION_SECRET=uma-chave-super-secreta-e-aleatoria-de-pelo-menos-32-caracteres

# Environment
NODE_ENV=development
```

### 2. **Gerar SESSION_SECRET**

Execute no terminal para gerar uma chave segura:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o resultado para a variável `SESSION_SECRET`.

### 3. **Configurar Banco de Dados**

Se ainda não configurou o PostgreSQL:

```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres createdb worldshards_db

# Criar usuário (opcional)
sudo -u postgres psql -c "CREATE USER worldshards WITH PASSWORD 'sua-senha';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE worldshards_db TO worldshards;"
```

Atualize `DATABASE_URL` com suas credenciais reais.

## 🚀 Deploy em Produção

### **Vercel**

1. Vá nas configurações do projeto Vercel
2. Adicione as variáveis de ambiente:
   - `DATABASE_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

### **Netlify**

1. Vá em Site settings → Environment variables
2. Adicione as mesmas variáveis do Vercel

### **Cloudflare Pages**

1. Vá em Settings → Environment variables
2. Adicione as variáveis tanto em **Production** quanto **Preview**

### **Railway/Render/Heroku**

1. Configure as variáveis de ambiente no painel de controle
2. Certifique-se de que `NODE_ENV=production`

## ✅ Verificação

### 1. **Teste Local**

```bash
# Instalar dependências
npm install

# Executar migrações do banco
npm run db:push

# Iniciar servidor
npm run dev
```

Acesse `http://localhost:5000` e teste o login.

### 2. **Verificar Logs**

Se houver problemas, verifique:

- Console do navegador (F12)
- Logs do servidor (terminal)
- Google Cloud Console → APIs e serviços → Credenciais

### 3. **Problemas Comuns**

#### ❌ "redirect_uri_mismatch"
- Verifique se a URL de callback está correta nas credenciais Google
- Certifique-se de que não há barras extras ou diferenças de protocolo

#### ❌ "invalid_client"
- Verifique se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
- Confirme que não há espaços extras nas variáveis

#### ❌ "access_denied"
- Usuário cancelou o login ou não tem permissão
- Adicione o email em "Usuários de teste" se necessário

#### ❌ Erro de sessão
- Verifique se `SESSION_SECRET` está configurado
- Confirme que o banco de dados está acessível

## 🔒 Segurança

### **Boas Práticas**

1. **Nunca commite** credenciais no Git
2. **Use .env.example** para documentar variáveis necessárias
3. **Rotacione** credenciais periodicamente
4. **Configure HTTPS** em produção
5. **Limite domínios** autorizados no Google Cloud

### **Produção**

- Use `NODE_ENV=production`
- Configure cookies seguros
- Use HTTPS obrigatório
- Configure Content Security Policy (CSP)

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs detalhados
2. Confirme todas as URLs de callback
3. Teste com usuário diferente
4. Consulte a [documentação oficial do Google](https://developers.google.com/identity/protocols/oauth2)

---

**✅ Configuração completa!** Sua aplicação agora suporta login seguro com Google OAuth 2.0.