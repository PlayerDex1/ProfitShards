#!/bin/bash

# 🚀 SETUP TABELA FEED_RUNS
# Cria tabela específica para o feed de atividade no D1

echo "📊 Criando tabela feed_runs no D1..."

# Executar SQL no D1
wrangler d1 execute profitshards-db --file=./create-feed-table.sql

if [ $? -eq 0 ]; then
    echo "✅ Tabela feed_runs criada com sucesso!"
    echo ""
    echo "📋 Verificando tabela criada:"
    wrangler d1 execute profitshards-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='feed_runs';"
    
    echo ""
    echo "📊 Dados de exemplo inseridos:"
    wrangler d1 execute profitshards-db --command="SELECT COUNT(*) as total_runs FROM feed_runs;"
    
    echo ""
    echo "🎯 Próximos passos:"
    echo "1. Atualizar MapPlanner para usar /api/feed/feed-runs"
    echo "2. Atualizar ActivityStream para usar nova API"
    echo "3. Testar funcionamento completo"
    
else
    echo "❌ Erro ao criar tabela feed_runs"
    echo "Verifique se wrangler está configurado e D1 está ativo"
fi