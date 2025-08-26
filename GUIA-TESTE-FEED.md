# 🧪 Guia Prático - Testar Feed com Dados Reais

## ✅ **Status Atual: Deploy Corrigido!**

- **🌐 Site**: https://profitshards.pages.dev ✅ Online
- **📊 API Feed**: `/api/feed/activity-stream` ✅ Funcionando
- **🔧 Build**: ✅ Corrigido (conflito date-fns resolvido)
- **🚀 Deploy**: ✅ Automático ativo

---

## 🎯 **Como Testar o Feed Agora**

### **Passo 1: Acesso e Login**
1. **Abrir**: https://profitshards.pages.dev/perfil
2. **Fazer login** com sua conta Google
3. **Aguardar** confirmação do login

### **Passo 2: Criar Run no MapPlanner**
1. **Ir para aba "Planejador"**
2. **Configurar run**:
   - Escolher mapa (ex: Medium Map)
   - Inserir quantidade de tokens (ex: 200)
   - Luck será preenchido automaticamente
3. **Clicar "Aplicar"**
4. **Aguardar mensagem** "✅ Dados salvos com sucesso!"

### **Passo 3: Verificar Logs (IMPORTANTE)**
1. **Abrir DevTools** (F12)
2. **Ir para aba Console**
3. **Procurar mensagens**:
   ```
   ✅ FEED: Métricas salvas para feed da comunidade
   🔍 DEBUG: Tentando salvar métricas no D1  
   💾 Inserindo run no D1
   ```
4. **Se há erros vermelhos**: copiar mensagem

### **Passo 4: Verificar no Feed**
1. **Aguardar 5 minutos** (cache da API)
2. **Ir para aba "Test"** (só para admins)
3. **Clicar em "Feed"**
4. **Verificar se aparece** sua run recém criada
5. **OU** aguardar integração na home page

---

## 🔍 **O que Observar**

### **✅ Sinais de Sucesso:**
- Mensagens verdes no console
- Dados salvos com sucesso
- Run aparece no feed após 5 min
- Timestamps corretos

### **❌ Possíveis Problemas:**
- **Não autenticado**: Verificar login
- **Tokens = 0**: MapPlanner só salva com tokens > 0
- **Erro 401**: Problema de sessão
- **Erro 500**: Problema no servidor/database

---

## 🐛 **Troubleshooting**

### **Problema: "Dados não aparecem no feed"**
**Verificar:**
1. Usuário está logado? 
2. Tokens inseridos > 0?
3. Console mostra erro?
4. Aguardou 5 minutos?

### **Problema: "Erro 401 no console"**
**Solução:**
1. Fazer logout e login novamente
2. Aguardar alguns segundos
3. Tentar criar run novamente

### **Problema: "Erro 500 no console"**
**Solução:**
1. Verificar se D1 database está ativo
2. Aguardar alguns minutos
3. Tentar novamente

---

## 🧪 **Teste Avançado (Browser Console)**

Execute no console do browser em `profitshards.pages.dev`:

```javascript
// 1. Testar API atual
fetch('/api/feed/activity-stream')
  .then(r => r.json())
  .then(data => {
    console.log('🔥 Feed atual:', data);
    console.log('📊 Total runs:', data.runs?.length);
    console.log('💾 Cache ativo:', data.cached);
  });

// 2. Monitorar mudanças (executa a cada 10s)
let feedMonitor = setInterval(async () => {
  const response = await fetch('/api/feed/activity-stream');
  const data = await response.json();
  console.log(`⏱️ ${new Date().toLocaleTimeString()}: ${data.runs?.length} runs`);
}, 10000);

// Para parar: clearInterval(feedMonitor);
```

---

## 📊 **Status do Sistema**

### **Componentes Verificados:**
- ✅ **Site principal**: Online
- ✅ **API Feed**: Funcionando (dados demo)
- ✅ **MapPlanner**: Configurado para enviar
- ✅ **Database**: D1 conectado
- ✅ **Autenticação**: Google OAuth ativo

### **Fluxo de Dados:**
```
Usuário logado → MapPlanner → /api/admin/save-map-run → D1 Database → /api/feed/activity-stream → ActivityStream Component
```

### **Cache Sistema:**
- **API Feed**: 5 minutos
- **Browser**: 5 minutos  
- **Auto-refresh**: A cada 5 minutos

---

## 🎯 **Próximos Passos**

### **Se Teste for Bem-sucedido:**
1. ✅ Feed está funcionando!
2. 🏠 Integrar na home page
3. 🎨 Melhorar interface visual
4. 📱 Otimizar responsividade

### **Se Houver Problemas:**
1. 🐛 Debugar logs específicos
2. 🔧 Corrigir integração
3. 📋 Validar database schema
4. 🔄 Testar novamente

---

## 📞 **Suporte**

Se encontrar problemas:
1. **Copiar mensagens** do console
2. **Especificar passos** seguidos
3. **Informar** se é usuário admin
4. **Incluir** timestamp do erro

**O feed está tecnicamente pronto - só precisamos validar com dados reais! 🚀**