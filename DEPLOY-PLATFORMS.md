# 🚀 Guia de Deploy - Plataformas Suportadas

## 📊 **Comparação de Plataformas**

| Plataforma | Google OAuth | Banco de Dados | Custo | Facilidade | Recomendação |
|------------|--------------|----------------|-------|------------|--------------|
| **Vercel** | ✅ Completo | ✅ PostgreSQL | Grátis | ⭐⭐⭐⭐⭐ | 🥇 **Melhor** |
| **Railway** | ✅ Completo | ✅ PostgreSQL | Grátis | ⭐⭐⭐⭐ | 🥈 **Ótima** |
| **Render** | ✅ Completo | ✅ PostgreSQL | Grátis | ⭐⭐⭐⭐ | 🥉 **Boa** |
| **Cloudflare** | ❌ Limitado | ❌ Não | Grátis | ⭐⭐⭐ | 📱 **Demo** |

---

## 🥇 **Vercel (Recomendado)**

### ✅ **Funcionalidades Completas**
- ✅ Google OAuth 2.0 funcionando
- ✅ Sessões persistentes
- ✅ Banco PostgreSQL suportado
- ✅ Deploy automático via GitHub
- ✅ SSL/HTTPS automático
- ✅ Edge functions para APIs

### 🚀 **Como Fazer Deploy**

#### **1. Preparação**
```bash
# 1. Fork o repositório no GitHub
# 2. Configure Google OAuth (GOOGLE-OAUTH-SETUP.md)
# 3. Crie banco PostgreSQL (Neon/Supabase grátis)
```

#### **2. Deploy no Vercel**
1. Acesse [vercel.com](https://vercel.com)
2. **Import Git Repository** → Selecione seu fork
3. **Configure Project**:
   - Framework: `Other`
   - Build Command: `npm run build:vercel`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

#### **3. Variáveis de Ambiente**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
SESSION_SECRET=sua-chave-64-chars-aleatoria
NODE_ENV=production
```

#### **4. URLs de Callback Google OAuth**
```
https://seu-projeto.vercel.app/api/auth/google/callback
```

### 🎯 **Resultado**: Aplicação 100% funcional!

---

## 🥈 **Railway**

### ✅ **Funcionalidades Completas**
- ✅ Google OAuth 2.0 funcionando
- ✅ PostgreSQL integrado
- ✅ Deploy automático
- ✅ SSL automático

### 🚀 **Como Fazer Deploy**

#### **1. Deploy no Railway**
1. Acesse [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Selecione seu fork do repositório
4. Railway detectará automaticamente como Node.js

#### **2. Configurar Banco de Dados**
1. **Add Service** → **PostgreSQL**
2. Copie a `DATABASE_URL` gerada
3. Configure nas variáveis de ambiente

#### **3. Variáveis de Ambiente**
```env
DATABASE_URL=postgresql://...  # Copiado do Railway
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
SESSION_SECRET=chave-aleatoria-64-chars
NODE_ENV=production
PORT=5000
```

#### **4. URLs de Callback**
```
https://seu-projeto.up.railway.app/api/auth/google/callback
```

### 🎯 **Resultado**: Aplicação 100% funcional!

---

## 🥉 **Render**

### ✅ **Funcionalidades Completas**
- ✅ Google OAuth 2.0 funcionando
- ✅ PostgreSQL suportado
- ✅ Deploy automático
- ✅ SSL automático

### 🚀 **Como Fazer Deploy**

#### **1. Deploy no Render**
1. Acesse [render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub → Selecione seu fork
4. Configure:
   - Name: `profitshards`
   - Environment: `Node`
   - Build Command: `npm run build:full`
   - Start Command: `npm start`

#### **2. Banco de Dados**
1. **New** → **PostgreSQL**
2. Copie a `External Database URL`
3. Configure nas variáveis de ambiente

#### **3. Variáveis de Ambiente**
```env
DATABASE_URL=postgresql://...  # Do Render PostgreSQL
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
SESSION_SECRET=chave-aleatoria-64-chars
NODE_ENV=production
```

#### **4. URLs de Callback**
```
https://profitshards.onrender.com/api/auth/google/callback
```

### 🎯 **Resultado**: Aplicação 100% funcional!

---

## 📱 **Cloudflare Pages (Limitado)**

### ⚠️ **Limitações**
- ❌ **Sem Google OAuth** (apenas frontend estático)
- ❌ **Sem banco de dados**
- ❌ **Sem sessões persistentes**
- ✅ **Interface funcional** (modo offline)
- ✅ **Deploy automático**
- ✅ **CDN global** (super rápido)

### 🚀 **Como Usar (Demo)**

#### **1. Deploy Automático**
- ✅ **Já configurado!** Push para `main` = deploy automático
- ✅ **URL**: `https://profitshards.pages.dev`
- ✅ **Interface completa** funcionando

#### **2. O que Funciona**
- ✅ Calculadora de lucro
- ✅ Interface moderna
- ✅ Modo escuro/claro
- ✅ Gráficos interativos
- ✅ Armazenamento local (localStorage)

#### **3. O que NÃO Funciona**
- ❌ Login com Google
- ❌ Dados na nuvem
- ❌ Sincronização entre dispositivos

### 🎯 **Resultado**: Perfeito para demonstração!

---

## 🔧 **Status Atual do Deploy**

### ✅ **Cloudflare Pages (Ativo)**
- 🔄 **Deploy em andamento** após correções
- 📱 **URL**: https://profitshards.pages.dev
- ⚠️ **Modo**: Frontend estático (sem auth)

### 🎯 **Recomendação Final**

#### **Para Uso Completo (com Google OAuth):**
1. **Vercel** - Mais fácil e rápido
2. **Railway** - Boa alternativa com PostgreSQL integrado
3. **Render** - Opção confiável e estável

#### **Para Demonstração:**
- **Cloudflare Pages** - Já funcionando, super rápido

---

## 📞 **Suporte**

### **Deploy Funcionando?**
- ✅ **Cloudflare**: Interface funcionando
- 🔄 **Vercel/Railway/Render**: Configure seguindo os passos acima

### **Problemas?**
1. Verifique as variáveis de ambiente
2. Confirme URLs de callback no Google
3. Teste a `DATABASE_URL` 
4. Consulte logs da plataforma

**🎮 Sua calculadora está online e funcionando!**