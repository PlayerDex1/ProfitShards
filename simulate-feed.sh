#!/bin/bash

# 🧪 SCRIPT PARA SIMULAÇÃO RÁPIDA DO FEED
# Uso: ./simulate-feed.sh [light|normal|heavy|burst]

set -e

BASE_URL="https://profitshards.pages.dev"  # Altere para sua URL
# BASE_URL="http://localhost:5173"  # Para desenvolvimento local

PRESET=${1:-normal}

echo "🧪 Iniciando simulação do feed..."
echo "📊 Preset: $PRESET"

case $PRESET in
  "light")
    DURATION=15
    INTENSITY="low"
    LUCK_MIN=50
    LUCK_MAX=200
    ;;
  "normal")
    DURATION=30
    INTENSITY="medium"
    LUCK_MIN=100
    LUCK_MAX=500
    ;;
  "heavy")
    DURATION=60
    INTENSITY="high"
    LUCK_MIN=200
    LUCK_MAX=1000
    ;;
  "burst")
    DURATION=10
    INTENSITY="burst"
    LUCK_MIN=500
    LUCK_MAX=2000
    ;;
  *)
    echo "❌ Preset inválido. Use: light, normal, heavy, ou burst"
    exit 1
    ;;
esac

# Dados da simulação
SIMULATION_DATA=$(cat <<EOF
{
  "duration": $DURATION,
  "intensity": "$INTENSITY",
  "agents": ["bc-test-001", "bc-test-002", "bc-test-003", "bc-test-004", "bc-test-005"],
  "mapTypes": ["small", "medium", "large", "xlarge"],
  "luckRange": [$LUCK_MIN, $LUCK_MAX]
}
EOF
)

echo "⚙️ Configuração:"
echo "$SIMULATION_DATA" | jq .

echo ""
echo "🚀 Enviando simulação..."

# Executar simulação
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST \
  "$BASE_URL/api/admin/simulate-feed-activity" \
  -H "Content-Type: application/json" \
  -H "Cookie: ps_session=YOUR_ADMIN_SESSION" \
  -d "$SIMULATION_DATA")

# Extrair status HTTP e body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "📡 Status HTTP: $HTTP_STATUS"
echo "📊 Resposta:"
echo "$RESPONSE_BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo ""
  echo "✅ Simulação iniciada com sucesso!"
  echo "🔄 Aguarde alguns segundos e verifique o feed..."
  
  # Opcional: Verificar feed após simulação
  sleep 3
  echo ""
  echo "🔍 Verificando feed..."
  curl -s "$BASE_URL/api/feed/recent-runs" | jq '.runs | length' | xargs echo "Runs no feed:"
else
  echo ""
  echo "❌ Erro na simulação (HTTP $HTTP_STATUS)"
  echo "🔧 Verifique se você está autenticado como admin"
fi