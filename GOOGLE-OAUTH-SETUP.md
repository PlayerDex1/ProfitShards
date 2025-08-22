# 🔐 Configuração Google OAuth - Cloudflare Pages + D1

Este guia mostra como configurar o login do Google para sua aplicação Worldshards Calculator no Cloudflare Pages.

## 📋 Pré-requisitos

- Conta Google/Gmail
- Acesso ao [Google Cloud Console](https://console.cloud.google.com/)
- Conta no Cloudflare
- Projeto já deployado no Cloudflare Pages

## 🛠️ Passo 1: Configurar Google Cloud Console

### 1.1 **Criar Projeto**
1. Acesse [console.cloud.google.com](https://console.cloud.google.com/)
2. Clique em **"Selecionar projeto"** → **"Novo projeto"**
3. Nome do projeto: `Worldshards Calculator`
4. Clique em **"Criar"**

### 1.2 **Ativar APIs**
1. No menu lateral, vá em **APIs e serviços** → **Biblioteca**
2. Pesquise por **"Google+ API"** ou **"Google Identity"**
3. Clique na API e depois em **"Ativar"**

### 1.3 **Configurar Tela de Consentimento OAuth**
1. Vá em **APIs e serviços** → **Tela de consentimento OAuth**
2. Selecione **"Externo"** (para qualquer usuário Google)
3. Preencha as informações obrigatórias:
   - **Nome do aplicativo**: `Worldshards Calculator`
   - **Email de suporte**: seu-email@gmail.com
   - **Domínios autorizados**: 
     - `profitshards.pages.dev`
     - `seu-dominio-personalizado.com` (se tiver)
   - **Email do desenvolvedor**: seu-email@gmail.com
4. Clique em **"Salvar e continuar"**
5. **Escopos**: Pule (padrão é suficiente)
6. **Usuários de teste**: Adicione seu email
7. **"Salvar e continuar"**

### 1.4 **Criar Credenciais OAuth 2.0**
1. Vá em **APIs e serviços** → **Credenciais**
2. Clique em **"+ Criar credenciais"** → **"ID do cliente OAuth 2.0"**
3. **Tipo de aplicativo**: `Aplicativo da Web`
4. **Nome**: `Worldshards Calculator Web Client`
5. **URIs de origem JavaScript autorizados**:
   ```
   https://profitshards.pages.dev
   https://seu-dominio.com (se tiver)
   ```
6. **URIs de redirecionamento autorizados**:
   ```
   https://profitshards.pages.dev/api/auth/google/callback
   https://seu-dominio.com/api/auth/google/callback (se tiver)
   ```
7. Clique em **"Criar"**

### 1.5 **Copiar Credenciais**
Após criar, você verá:
- **Client ID**: `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdef123456`

⚠️ **IMPORTANTE**: Guarde essas credenciais com segurança!

## 🗄️ Passo 2: Configurar D1 Database

### 2.1 **Criar Database**
```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Login no Cloudflare
wrangler login

# Criar database D1
wrangler d1 create profitshards-db
```

### 2.2 **Executar Schema**
```bash
# Executar schema SQL
wrangler d1 execute profitshards-db --file=./schema.sql
```

### 2.3 **Atualizar wrangler.toml**
Substitua os IDs do database no `wrangler.toml`:
```toml
name = "profitshards"
compatibility_date = "2024-01-15"

[env.production]
d1_databases = [
  { binding = "DB", database_name = "profitshards-db", database_id = "SEU-DATABASE-ID-AQUI" }
]
```

## ☁️ Passo 3: Configurar Cloudflare Pages

### 3.1 **Variáveis de Ambiente**
1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com/)
2. **Pages** → Seu projeto → **Settings** → **Environment variables**
3. Adicione as variáveis:

**Production:**
```
GOOGLE_CLIENT_ID = 123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-abcdef123456
```

**Preview (opcional):**
```
GOOGLE_CLIENT_ID = 123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-abcdef123456
```

### 3.2 **Conectar D1 Database**
1. **Settings** → **Functions**
2. **D1 database bindings**
3. **Add binding**:
   - **Variable name**: `DB`
   - **D1 database**: Selecione `profitshards-db`
4. **Save**

## 🚀 Passo 4: Deploy e Teste

### 4.1 **Deploy**
```bash
# Commit e push das mudanças
git add .
git commit -m "feat: Implementa Google OAuth com D1 Database"
git push origin main
```

### 4.2 **Verificar Deploy**
1. Aguarde o deploy automático (2-3 minutos)
2. Acesse sua aplicação: `https://profitshards.pages.dev`
3. Clique em **"Entrar"**
4. Teste o **"Continuar com Google"**

## ✅ Verificações

### **Login Funcionando?**
- ✅ Redirecionamento para Google
- ✅ Autorização da conta
- ✅ Redirecionamento de volta
- ✅ Usuário logado na aplicação

### **Se houver problemas:**

#### **❌ "redirect_uri_mismatch"**
- Verifique URLs no Google Cloud Console
- Certifique-se de usar HTTPS
- Confirme domínio exato (com/sem www)

#### **❌ "invalid_client"**
- Verifique `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- Confirme que não há espaços extras
- Verifique se as variáveis estão no ambiente correto

#### **❌ "Missing Google credentials"**
- Variáveis de ambiente não configuradas
- Aguarde alguns minutos após configurar
- Verifique se está no ambiente correto (Production/Preview)

#### **❌ Database errors**
- Verifique se D1 database está conectado
- Confirme que o schema foi executado
- Verifique binding `DB` nas configurações

## 🔧 Comandos Úteis

```bash
# Listar databases
wrangler d1 list

# Executar query no database
wrangler d1 execute profitshards-db --command="SELECT * FROM users LIMIT 5"

# Ver logs do Cloudflare Functions
wrangler pages deployment tail

# Deploy manual (se necessário)
wrangler pages deploy dist/public
```

## 📊 Monitoramento

### **Cloudflare Analytics**
- **Pages** → Seu projeto → **Analytics**
- Monitore requests, erros, performance

### **D1 Analytics**
- **D1** → Sua database → **Metrics**
- Monitore queries, storage, performance

### **Logs**
```bash
# Ver logs em tempo real
wrangler pages deployment tail
```

## 🔒 Segurança

### **Boas Práticas:**
- ✅ Use HTTPS sempre
- ✅ Mantenha Client Secret seguro
- ✅ Rotacione credenciais periodicamente
- ✅ Monitore logs de acesso
- ✅ Configure domínios autorizados corretamente

### **Produção:**
- ✅ Remova usuários de teste
- ✅ Configure domínio personalizado
- ✅ Habilite notificações de segurança
- ✅ Backup regular do D1 database

## 🎯 Resultado Final

Após seguir todos os passos:

- ✅ **Google OAuth funcionando**
- ✅ **Usuários salvos no D1 Database**
- ✅ **Sessões seguras com cookies**
- ✅ **Login persistente por 7 dias**
- ✅ **Dados sincronizados na nuvem**

**🎮 Sua calculadora agora tem login Google completo!**

---

**📞 Precisa de ajuda?**
- Verifique logs no Cloudflare Dashboard
- Teste com usuário diferente
- Confirme todas as URLs de callback
- Consulte documentação oficial do Google OAuth