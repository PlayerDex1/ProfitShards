# 📢 Configuração Slack - Notificações de Deploy

## 🚀 Como Configurar Webhook do Slack

### **Passo 1: Criar App do Slack**
1. Acesse: https://api.slack.com/apps
2. Clique em **"Create New App"**
3. Escolha **"From scratch"**
4. Nome: `ProfitShards Deploy`
5. Selecione seu workspace

### **Passo 2: Configurar Incoming Webhooks**
1. No menu lateral, clique em **"Incoming Webhooks"**
2. Ative: **"Activate Incoming Webhooks"**
3. Clique em **"Add New Webhook to Workspace"**
4. Escolha o canal (ex: `#deploys` ou `#geral`)
5. Clique em **"Allow"**

### **Passo 3: Copiar URL do Webhook**
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

### **Passo 4: Configurar Variável de Ambiente**
```bash
# No seu ambiente de deploy (GitHub Actions, etc.)
export SLACK_WEBHOOK_URL="sua_webhook_url_aqui"
```

---

## 🧪 Teste Manual

### **Método 1: Node.js**
```bash
# Editar slack-integration.js - linha 189
const SLACK_WEBHOOK_URL = 'sua_webhook_url_aqui';

# Executar
node slack-integration.js
```

### **Método 2: Script Direto**
```javascript
const webhookUrl = 'sua_webhook_url_aqui';

fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: '🧪 Teste de integração ProfitShards',
    channel: '#deploys'
  })
});
```

---

## 🔧 Integração com GitHub Actions

### **Adicionar ao workflow:**
```yaml
# .github/workflows/cloudflare-setup.yml
- name: Notify Slack on Deploy
  if: always()
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  run: |
    node slack-integration.js
```

### **Configurar Secret:**
1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Sua webhook URL

---

## 📋 Tipos de Notificações

### **1. Deploy Concluído**
```json
{
  "text": "🚀 Deploy realizado na branch main",
  "attachments": [{
    "color": "good",
    "title": "✅ Deploy SUCCESS",
    "fields": [
      {"title": "Branch", "value": "main", "short": true},
      {"title": "Commit", "value": "5a989d9", "short": true},
      {"title": "URL", "value": "https://profitshards.pages.dev"}
    ]
  }]
}
```

### **2. Testes Executados**
```json
{
  "blocks": [{
    "type": "header",
    "text": {"type": "plain_text", "text": "🧪 Relatório de Testes"}
  }, {
    "type": "section",
    "fields": [
      {"type": "mrkdwn", "text": "*Site Status:* ✅ Online"},
      {"type": "mrkdwn", "text": "*API Feed:* ✅ Funcionando"},
      {"type": "mrkdwn", "text": "*Performance:* 370ms (Excelente)"}
    ]
  }]
}
```

### **3. Melhorias Implementadas**
```json
{
  "text": "🎉 Melhorias do feed promovidas para produção!",
  "attachments": [{
    "color": "good", 
    "title": "🚀 Feed de Atividade Melhorado",
    "fields": [{
      "title": "Melhorias",
      "value": "🎨 Interface visual melhorada\n⚡ Badges de eficiência\n🔄 Indicadores pulsantes"
    }]
  }]
}
```

---

## 🎯 Uso Automatizado

### **Script para CI/CD:**
```bash
#!/bin/bash
# deploy-with-slack.sh

echo "🚀 Fazendo deploy..."
npm run build

echo "📢 Notificando Slack..."
node -e "
  import('./slack-integration.js').then(async ({ runTestsAndNotifySlack }) => {
    await runTestsAndNotifySlack(process.env.SLACK_WEBHOOK_URL);
  });
"

echo "✅ Deploy e notificação concluídos!"
```

### **Executar:**
```bash
chmod +x deploy-with-slack.sh
SLACK_WEBHOOK_URL="sua_url" ./deploy-with-slack.sh
```

---

## 📱 Exemplo de Mensagem no Slack

```
🚀 ProfitShards Deploy
🎉 Melhorias do feed promovidas para produção!

🚀 Feed de Atividade Melhorado - Deploy em Produção
Melhorias Implementadas:
🎨 Interface visual melhorada com gradientes  
⚡ Badges de eficiência em tempo real
🔄 Indicadores de atividade pulsantes
🎯 Cores diferentes por tipo de mapa
📱 Layout responsivo aprimorado

URL de Produção: https://profitshards.pages.dev
Status API: ✅ Funcionando

---

🧪 Relatório de Testes Automatizados
Site Status: ✅ Online    |    API Feed: ✅ Funcionando
Performance: 370ms (Excelente)    |    Runs Encontradas: 6

[Abrir Site] [Ver API]
```

---

## 🔒 Segurança

### **Boas Práticas:**
- ✅ Nunca commitar webhook URL no código
- ✅ Usar variáveis de ambiente ou secrets
- ✅ Configurar canais específicos para deploy
- ✅ Limitar permissões do app Slack
- ✅ Monitorar uso do webhook

### **Variáveis de Ambiente:**
```bash
# Desenvolvimento
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Produção (GitHub Secrets)
SLACK_WEBHOOK_URL=${{ secrets.SLACK_WEBHOOK_URL }}
```

---

Agora você pode receber notificações automáticas no Slack sempre que houver um deploy ou quando os testes forem executados! 🎉