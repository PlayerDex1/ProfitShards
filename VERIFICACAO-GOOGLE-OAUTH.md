# ✅ Verificação Google OAuth - Checklist Completo

## 🔍 **1. Verificar Google Cloud Console**

### **1.1 Credenciais OAuth 2.0**
1. Acesse: [console.cloud.google.com](https://console.cloud.google.com/)
2. **APIs e serviços** → **Credenciais**
3. Encontre seu **"ID do cliente OAuth 2.0"**
4. Clique no nome para editar

### **1.2 Verificar URLs de Redirecionamento**
✅ **URIs de redirecionamento autorizados** devem conter:
```
https://profitshards.pages.dev/api/auth/google/callback
```

✅ **URIs de origem JavaScript autorizados**:
```
https://profitshards.pages.dev
```

### **1.3 Copiar Credenciais Corretas**
- **Client ID**: Algo como `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: Algo como `GOCSPX-abc123def456ghi789`

⚠️ **IMPORTANTE**: Anote essas credenciais exatas!

---

## 🗄️ **2. Verificar D1 Database**

### **2.1 Listar Databases Existentes**
```bash
# Instalar Wrangler (se não tiver)
npm install -g wrangler

# Login no Cloudflare
wrangler login

# Listar todas as databases D1
wrangler d1 list
```

### **2.2 Criar Database (se não existir)**
```bash
# Criar nova database
wrangler d1 create profitshards-db

# Executar schema
wrangler d1 execute profitshards-db --file=./schema.sql
```

### **2.3 Obter Database ID**
Após `wrangler d1 list`, você verá algo como:
```
┌──────────────────────┬──────────────────────────────────────┬─────────┐
│ name                 │ uuid                                 │ version │
├──────────────────────┼──────────────────────────────────────┼─────────┤
│ profitshards-db      │ 12345678-1234-5678-9abc-def012345678 │ α       │
└──────────────────────┴──────────────────────────────────────┴─────────┘
```

**Copie o UUID**: `12345678-1234-5678-9abc-def012345678`

---

## ☁️ **3. Verificar Cloudflare Pages**

### **3.1 Environment Variables**
1. Acesse: [dash.cloudflare.com](https://dash.cloudflare.com/)
2. **Pages** → **profitshards** → **Settings** → **Environment variables**

✅ **Production** deve ter:
```
GOOGLE_CLIENT_ID = seu-client-id-completo.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = seu-client-secret-completo
```

✅ **Preview** (opcional):
```
GOOGLE_CLIENT_ID = seu-client-id-completo.apps.googleusercontent.com  
GOOGLE_CLIENT_SECRET = seu-client-secret-completo
```

### **3.2 D1 Database Binding**
1. **Settings** → **Functions**
2. **D1 database bindings**

✅ Deve existir:
```
Variable name: DB
D1 database: profitshards-db
```

---

## 🔧 **4. Atualizar Configurações no Código**

### **4.1 Atualizar wrangler.toml**
```toml
name = "profitshards"
compatibility_date = "2024-01-15"

pages_build_output_dir = "dist/public"

[env.production]
d1_databases = [
  { binding = "DB", database_name = "profitshards-db", database_id = "SEU-DATABASE-UUID-AQUI" }
]

[env.preview]  
d1_databases = [
  { binding = "DB", database_name = "profitshards-db", database_id = "SEU-DATABASE-UUID-AQUI" }
]
```

**⚠️ SUBSTITUA**: `SEU-DATABASE-UUID-AQUI` pelo UUID real da sua database!

---

## 🧪 **5. Testar Configuração**

### **5.1 Testar Database**
```bash
# Testar conexão com database
wrangler d1 execute profitshards-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Deve retornar: users, sessions
```

### **5.2 Testar Variáveis de Ambiente**
```bash
# Ver logs do Cloudflare Pages
wrangler pages deployment tail --project-name=profitshards
```

### **5.3 Testar Google OAuth**
1. Acesse: `https://profitshards.pages.dev`
2. Clique em **"Entrar"**
3. Clique em **"Continuar com Google"**
4. Deve redirecionar para Google

---

## 🚨 **6. Problemas Comuns**

### **❌ "redirect_uri_mismatch"**
- URL de callback incorreta no Google Cloud Console
- Verifique: `https://profitshards.pages.dev/api/auth/google/callback`

### **❌ "invalid_client"**  
- `GOOGLE_CLIENT_ID` ou `GOOGLE_CLIENT_SECRET` incorretos
- Verifique se não há espaços extras

### **❌ "Missing Google credentials"**
- Variáveis de ambiente não configuradas no Cloudflare
- Aguarde 5-10 minutos após configurar

### **❌ Database errors**
- Database não existe ou não está conectada
- Verifique D1 binding no Cloudflare Pages

### **❌ Build errors**
- Dependências faltando no package.json
- Imports incorretos no código

---

## 📋 **7. Checklist Final**

### **Google Cloud Console:**
- [ ] Projeto criado
- [ ] OAuth consent screen configurado
- [ ] Credenciais OAuth 2.0 criadas
- [ ] URLs de callback corretas
- [ ] Client ID e Secret copiados

### **Cloudflare D1:**
- [ ] Database `profitshards-db` criada
- [ ] Schema executado (`users` e `sessions` tables)
- [ ] Database UUID obtido

### **Cloudflare Pages:**
- [ ] Environment variables configuradas
- [ ] D1 database binding conectado
- [ ] wrangler.toml atualizado com UUID correto

### **Código:**
- [ ] Commit com wrangler.toml atualizado
- [ ] Push para main branch
- [ ] Deploy sem erros de build

---

## 🎯 **Comandos para Verificar Tudo**

```bash
# 1. Verificar databases
wrangler d1 list

# 2. Verificar schema da database
wrangler d1 execute profitshards-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# 3. Verificar se há usuários (após primeiro login)
wrangler d1 execute profitshards-db --command="SELECT COUNT(*) as total_users FROM users;"

# 4. Ver logs em tempo real
wrangler pages deployment tail --project-name=profitshards

# 5. Deploy manual (se necessário)
wrangler pages deploy dist/public --project-name=profitshards
```

---

## ✅ **Depois de Verificar Tudo**

1. **Atualize o wrangler.toml** com o UUID correto
2. **Commit e push** as mudanças
3. **Aguarde o deploy** (2-3 minutos)
4. **Teste o login** em https://profitshards.pages.dev

**🎮 Se tudo estiver correto, o login Google funcionará perfeitamente!**