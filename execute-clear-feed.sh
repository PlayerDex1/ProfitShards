#!/bin/bash

echo "🗑️ LIMPANDO DADOS DO FEED..."
echo "🔍 Executando SQL no D1..."

# Executar limpeza via wrangler d1
wrangler d1 execute ProfitShards --file=./clear-feed-data.sql

echo "✅ Limpeza concluída!"
echo "🔍 Verificando resultado..."

# Verificar resultado
echo "SELECT COUNT(*) as registros_restantes FROM feed_runs;" | wrangler d1 execute ProfitShards --command

echo "✅ Feed limpo com sucesso!"