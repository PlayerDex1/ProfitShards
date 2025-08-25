#!/bin/bash

# 📢 SCRIPT PARA ENVIAR RELATÓRIO DE DEPLOY PARA SLACK
# Envia notificação das melhorias do feed para o Slack

set -e

echo "📢 Preparando notificação para Slack..."

# Verificar se SLACK_WEBHOOK_URL está configurada
if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "⚠️ SLACK_WEBHOOK_URL não configurada."
    echo "   Configure com: export SLACK_WEBHOOK_URL='sua_webhook_url'"
    echo "   Ou veja: slack-webhook-setup.md"
    exit 1
fi

echo "✅ Webhook URL configurada"

# Dados do deploy atual
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
REPO_URL="https://github.com/PlayerDex1/ProfitShards"

# Executar teste rápido da API
echo "🧪 Testando API antes de notificar..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://profitshards.pages.dev/api/feed/activity-stream" || echo "000")

if [ "$API_STATUS" = "200" ]; then
    API_STATUS_TEXT="✅ Funcionando"
    API_COLOR="good"
else
    API_STATUS_TEXT="❌ Com problemas ($API_STATUS)"
    API_COLOR="warning"
fi

# Teste de conectividade do site
echo "🔗 Testando conectividade do site..."
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://profitshards.pages.dev" || echo "000")

if [ "$SITE_STATUS" = "200" ]; then
    SITE_STATUS_TEXT="✅ Online"
    OVERALL_COLOR="good"
else
    SITE_STATUS_TEXT="❌ Offline ($SITE_STATUS)"
    OVERALL_COLOR="danger"
fi

# Mensagem principal do Slack
SLACK_MESSAGE=$(cat << EOF
{
  "channel": "#deploys",
  "username": "ProfitShards Deploy",
  "icon_emoji": ":rocket:",
  "text": "🎉 Feed de Atividade Melhorado - Deploy em Produção!",
  "attachments": [
    {
      "color": "$OVERALL_COLOR",
      "title": "🚀 Melhorias do Feed Implementadas",
      "title_link": "https://profitshards.pages.dev",
      "fields": [
        {
          "title": "Status do Site",
          "value": "$SITE_STATUS_TEXT",
          "short": true
        },
        {
          "title": "API Feed",
          "value": "$API_STATUS_TEXT", 
          "short": true
        },
        {
          "title": "Branch",
          "value": "$BRANCH",
          "short": true
        },
        {
          "title": "Commit",
          "value": "$COMMIT_HASH",
          "short": true
        },
        {
          "title": "Melhorias Implementadas",
          "value": "🎨 Interface visual com gradientes\\n⚡ Badges de eficiência em tempo real\\n🔄 Indicadores de atividade pulsantes\\n🎯 Cores diferentes por tipo de mapa\\n📱 Layout responsivo aprimorado\\n🖱️ Efeitos de hover sofisticados",
          "short": false
        }
      ],
      "footer": "ProfitShards CI/CD",
      "ts": $(date +%s)
    }
  ],
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Deploy concluído com sucesso!* As melhorias do feed de atividade estão agora em produção."
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Abrir Site 🚀"
        },
        "url": "https://profitshards.pages.dev",
        "action_id": "open_site"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*🌐 Site:* $SITE_STATUS_TEXT"
        },
        {
          "type": "mrkdwn", 
          "text": "*📊 API:* $API_STATUS_TEXT"
        },
        {
          "type": "mrkdwn",
          "text": "*🔗 Branch:* \`$BRANCH\`"
        },
        {
          "type": "mrkdwn",
          "text": "*💻 Commit:* \`$COMMIT_HASH\`"
        }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Ver Site"
          },
          "url": "https://profitshards.pages.dev",
          "style": "primary"
        },
        {
          "type": "button", 
          "text": {
            "type": "plain_text",
            "text": "Testar API"
          },
          "url": "https://profitshards.pages.dev/api/feed/activity-stream"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text", 
            "text": "GitHub"
          },
          "url": "$REPO_URL"
        }
      ]
    }
  ]
}
EOF
)

# Enviar para Slack
echo "📤 Enviando notificação para Slack..."

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$SLACK_MESSAGE" \
  "$SLACK_WEBHOOK_URL")

# Verificar resposta
if [ "$RESPONSE" = "ok" ]; then
    echo "✅ Notificação enviada para Slack com sucesso!"
    echo "📱 Verifique o canal #deploys no seu Slack"
else
    echo "❌ Erro ao enviar para Slack: $RESPONSE"
    exit 1
fi

# Enviar segunda mensagem com resultados de teste detalhados
echo "🧪 Enviando relatório de testes..."

# Executar teste rápido de performance
PERF_START=$(date +%s%3N)
curl -s "https://profitshards.pages.dev" > /dev/null
PERF_END=$(date +%s%3N)
PERF_TIME=$((PERF_END - PERF_START))

TEST_MESSAGE=$(cat << EOF
{
  "channel": "#deploys",
  "username": "ProfitShards Testing",
  "icon_emoji": ":test_tube:",
  "text": "🧪 Relatório de Testes Automatizados",
  "attachments": [
    {
      "color": "$API_COLOR",
      "title": "📊 Resultados dos Testes",
      "fields": [
        {
          "title": "Conectividade",
          "value": "Status: $SITE_STATUS\\nTempo: ${PERF_TIME}ms",
          "short": true
        },
        {
          "title": "API Feed",
          "value": "Status: $API_STATUS\\nEndpoint: /api/feed/activity-stream",
          "short": true
        },
        {
          "title": "Performance",
          "value": "Resposta: ${PERF_TIME}ms\\nAvaliação: $([ $PERF_TIME -lt 1000 ] && echo "Excelente" || echo "Adequado")",
          "short": false
        }
      ],
      "footer": "Testes executados em: $TIMESTAMP"
    }
  ]
}
EOF
)

sleep 2  # Aguardar para não sobrecarregar webhook

RESPONSE2=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_MESSAGE" \
  "$SLACK_WEBHOOK_URL")

if [ "$RESPONSE2" = "ok" ]; then
    echo "✅ Relatório de testes enviado!"
else
    echo "⚠️ Aviso: Erro ao enviar relatório de testes: $RESPONSE2"
fi

echo ""
echo "🎉 Processo concluído!"
echo "📋 Resumo:"
echo "   Site: $SITE_STATUS_TEXT"
echo "   API: $API_STATUS_TEXT" 
echo "   Performance: ${PERF_TIME}ms"
echo "   Branch: $BRANCH"
echo "   Commit: $COMMIT_HASH"
echo ""
echo "📱 Verifique as notificações no Slack!"