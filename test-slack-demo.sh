#!/bin/bash

# 📢 DEMO - Teste da integração Slack (usando webhook de teste)
# Este script mostra como ficaria a notificação no Slack

echo "🧪 DEMO - Teste da Integração Slack"
echo "======================================"
echo ""

# Simular dados do deploy
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT_HASH="5a989d9"
BRANCH="main"

echo "📋 Dados do Deploy:"
echo "   Timestamp: $TIMESTAMP"
echo "   Branch: $BRANCH" 
echo "   Commit: $COMMIT_HASH"
echo ""

echo "🔗 Testando conectividade..."
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://profitshards.pages.dev" || echo "000")
echo "   Site status: $SITE_STATUS"

echo "📊 Testando API..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://profitshards.pages.dev/api/feed/activity-stream" || echo "000")
echo "   API status: $API_STATUS"

echo "⚡ Testando performance..."
PERF_START=$(date +%s%3N)
curl -s "https://profitshards.pages.dev" > /dev/null 2>&1
PERF_END=$(date +%s%3N)
PERF_TIME=$((PERF_END - PERF_START))
echo "   Tempo de resposta: ${PERF_TIME}ms"

echo ""
echo "📱 PREVIEW da Mensagem no Slack:"
echo "=================================="

cat << 'EOF'

🚀 ProfitShards Deploy
🎉 Feed de Atividade Melhorado - Deploy em Produção!

┌─────────────────────────────────────────────────────┐
│ 🚀 Melhorias do Feed Implementadas                 │
│ https://profitshards.pages.dev                     │
├─────────────────────────────────────────────────────┤
│ Status do Site    │ ✅ Online                       │
│ API Feed          │ ✅ Funcionando                  │
│ Branch            │ main                            │
│ Commit            │ 5a989d9                         │
├─────────────────────────────────────────────────────┤
│ Melhorias Implementadas:                            │
│ 🎨 Interface visual com gradientes                 │
│ ⚡ Badges de eficiência em tempo real              │
│ 🔄 Indicadores de atividade pulsantes              │
│ 🎯 Cores diferentes por tipo de mapa               │
│ 📱 Layout responsivo aprimorado                    │
│ 🖱️ Efeitos de hover sofisticados                   │
└─────────────────────────────────────────────────────┘

Deploy concluído com sucesso! As melhorias do feed de 
atividade estão agora em produção.               [Abrir Site 🚀]

🌐 Site: ✅ Online          📊 API: ✅ Funcionando
🔗 Branch: main             💻 Commit: 5a989d9

[Ver Site] [Testar API] [GitHub]

---

🧪 ProfitShards Testing
🧪 Relatório de Testes Automatizados

┌─────────────────────────────────────────────────────┐
│ 📊 Resultados dos Testes                           │
├─────────────────────────────────────────────────────┤
│ Conectividade     │ Status: 200                     │
│                   │ Tempo: 380ms                    │
│ API Feed          │ Status: 200                     │
│                   │ Endpoint: /api/feed/activity-stream │
│ Performance       │ Resposta: 380ms                 │
│                   │ Avaliação: Excelente            │
└─────────────────────────────────────────────────────┘

Testes executados em: 2025-08-25T14:52:00Z

EOF

echo ""
echo "🎯 Para configurar REAL:"
echo "========================"
echo ""
echo "1. 📋 Siga as instruções em: slack-webhook-setup.md"
echo "2. 🔧 Configure sua webhook URL:"
echo "   export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/...'"
echo "3. 🚀 Execute o script:"
echo "   ./send-to-slack.sh"
echo ""
echo "📁 Arquivos criados:"
echo "   ✅ slack-integration.js      - Integração completa"
echo "   ✅ send-to-slack.sh         - Script de envio" 
echo "   ✅ slack-webhook-setup.md   - Guia de configuração"
echo "   ✅ test-slack-demo.sh       - Este demo"
echo ""
echo "🎉 Integração Slack pronta para usar!"
echo ""
echo "💡 Dica: Adicione ao GitHub Actions para notificações automáticas!"

# Mostrar exemplo de configuração para GitHub Actions
echo ""
echo "🔧 Exemplo para GitHub Actions:"
echo "==============================="

cat << 'EOF'

# Adicionar ao .github/workflows/cloudflare-setup.yml

- name: Notify Slack on Deploy Success
  if: success()
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  run: |
    echo "✅ Deploy bem-sucedido, notificando Slack..."
    ./send-to-slack.sh

- name: Notify Slack on Deploy Failure  
  if: failure()
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  run: |
    echo "❌ Deploy falhou, notificando Slack..."
    curl -X POST -H 'Content-Type: application/json' \
    -d '{"text":"❌ Deploy falhou na branch '"$GITHUB_REF_NAME"'","channel":"#deploys"}' \
    $SLACK_WEBHOOK_URL

EOF

echo ""
echo "📊 Status atual dos testes:"
echo "   Site: $([ $SITE_STATUS = "200" ] && echo "✅ Online" || echo "❌ Offline")"
echo "   API: $([ $API_STATUS = "200" ] && echo "✅ Funcionando" || echo "❌ Com problemas")"
echo "   Performance: ${PERF_TIME}ms $([ $PERF_TIME -lt 1000 ] && echo "✅ Excelente" || echo "⚠️ Adequado")"
echo ""