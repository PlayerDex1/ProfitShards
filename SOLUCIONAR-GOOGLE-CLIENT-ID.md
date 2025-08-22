# 🚨 Solução: "Missing GOOGLE_CLIENT_ID"

## 🎯 **O Problema**
O erro "Missing GOOGLE_CLIENT_ID" significa que as Cloudflare Functions estão funcionando, mas não conseguem acessar as variáveis de ambiente.

## 🔧 **Soluções (em ordem de prioridade)**

### **1. 🌐 Configurar Environment Variables no Cloudflare Pages**

#### **Passo a Passo:**
1. Acesse: https://dash.cloudflare.com/
2. **Pages** → **profitshards** 
3. **Settings** → **Environment variables**
4. **Add variable** para cada uma:

```
Name: GOOGLE_CLIENT_ID
Value: seu-client-id.apps.googleusercontent.com

Name: GOOGLE_CLIENT_SECRET  
Value: seu-client-secret
```

#### **⚠️ Importante:**
- Adicione em **Production** E **Preview**
- Não deixe espaços extras
- Clique **Save** após cada variável

---

### **2. 🔗 Verificar D1 Database Binding**

1. **Settings** → **Functions**
2. **D1 database bindings**
3. Deve ter:
   - **Variable name**: `DB`
   - **D1 database**: `profitshards`

Se não tiver, **Add binding** e configure.

---

### **3. 🔄 Forçar Redeploy**

Após configurar as variáveis:

#### **Opção A - Trigger via Commit:**
```bash
git commit --allow-empty -m "trigger: Force redeploy for env vars"
git push origin main
```

#### **Opção B - Redeploy Manual:**
1. **Deployments** → **View details** do último deploy
2. **Retry deployment**

---

### **4. 🕐 Aguardar Propagação**

- **Tempo**: 5-15 minutos após configurar
- **Verificar**: Se o erro persiste, aguarde mais um pouco
- **Cache**: Limpe cache do navegador (Ctrl+Shift+R)

---

### **5. 🌐 Criar Credenciais Google (se não tiver)**

#### **Google Cloud Console:**
1. Acesse: https://console.cloud.google.com/
2. **Selecionar projeto** → **Novo projeto**
3. Nome: `Worldshards Calculator`
4. **Criar**

#### **Ativar APIs:**
1. **APIs e serviços** → **Biblioteca**
2. Pesquise: `Google+ API` ou `Google Identity`
3. **Ativar**

#### **Tela de Consentimento:**
1. **APIs e serviços** → **Tela de consentimento OAuth**
2. **Externo** → **Criar**
3. Preencha:
   - **Nome do app**: `Worldshards Calculator`
   - **Email de suporte**: seu-email@gmail.com
   - **Domínios autorizados**: `profitshards.pages.dev`

#### **Criar Credenciais:**
1. **APIs e serviços** → **Credenciais**
2. **Criar credenciais** → **ID do cliente OAuth 2.0**
3. **Aplicativo da Web**
4. **URIs de origem autorizados**:
   ```
   https://profitshards.pages.dev
   ```
5. **URIs de redirecionamento autorizados**:
   ```
   https://profitshards.pages.dev/api/auth/google/callback
   ```
6. **Criar**

#### **Copiar Credenciais:**
- **Client ID**: `123456789-abc.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123def456`

---

### **6. 🔍 Verificar Configuração**

#### **Teste das Variáveis:**
1. **Pages** → **profitshards** → **Functions**
2. **View functions** → Procure por `/api/auth/google/start`
3. Se aparecer, as functions estão ativas

#### **Logs em Tempo Real:**
```bash
# Se tiver Wrangler instalado
wrangler pages deployment tail --project-name=profitshards
```

---

### **7. 🚨 Problemas Comuns**

#### **❌ "Variáveis não aparecem"**
- Aguarde 10-15 minutos
- Force redeploy com commit vazio
- Verifique se salvou em Production E Preview

#### **❌ "Client ID inválido"**
- Verifique se não há espaços extras
- Confirme formato: `123456-abc.apps.googleusercontent.com`
- Recrie as credenciais se necessário

#### **❌ "Functions não funcionam"**
- Verifique se D1 binding está configurado
- Confirme se wrangler.toml tem database correta
- Force redeploy

#### **❌ "Ainda dá erro após 20 minutos"**
- Delete e recrie as environment variables
- Verifique se está configurando no projeto correto
- Tente redeploy manual

---

## 🎯 **Checklist Rápido**

### **Cloudflare Pages:**
- [ ] Environment variables configuradas (Production + Preview)
- [ ] D1 database binding conectado
- [ ] Functions habilitadas
- [ ] Redeploy forçado após configurar

### **Google Cloud Console:**
- [ ] Projeto criado
- [ ] Google+ API ativada
- [ ] Tela de consentimento configurada
- [ ] Credenciais OAuth 2.0 criadas
- [ ] URLs de callback corretas

### **Teste:**
- [ ] Aguardou 10+ minutos após configurar
- [ ] Cache do navegador limpo
- [ ] Testou em navegador anônimo

---

## 🔧 **Comandos Úteis**

```bash
# Force redeploy
git commit --allow-empty -m "fix: Force redeploy for Google OAuth env vars"
git push origin main

# Ver logs (se tiver Wrangler)
wrangler pages deployment tail --project-name=profitshards

# Testar database
wrangler d1 execute profitshards --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 🎮 **Teste Final**

Após seguir todos os passos:

1. **Aguarde 10-15 minutos**
2. **Limpe cache**: Ctrl+Shift+R
3. **Acesse**: https://profitshards.pages.dev
4. **Clique**: "Entrar" → "Continuar com Google"
5. **Deve funcionar**: Redirecionamento para Google

---

## 📞 **Se Ainda Não Funcionar**

1. **Screenshot** da configuração das environment variables
2. **Copie** as URLs exatas do Google Cloud Console
3. **Verifique** se o projeto Cloudflare está correto
4. **Tente** recriar as credenciais Google

**🎯 O erro "Missing GOOGLE_CLIENT_ID" é 100% solucionável seguindo estes passos!**