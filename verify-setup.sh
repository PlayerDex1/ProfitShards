#!/bin/bash

echo "🔍 VERIFICAÇÃO GOOGLE OAUTH - PROFITSHARDS"
echo "=========================================="
echo ""

# Verificar se wrangler está instalado
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI não encontrado. Instalando..."
    npm install -g wrangler
else
    echo "✅ Wrangler CLI encontrado"
fi

echo ""
echo "🗄️ VERIFICANDO D1 DATABASES..."
echo "------------------------------"

# Listar databases
echo "📋 Databases existentes:"
wrangler d1 list

echo ""
echo "🔧 VERIFICANDO SCHEMA DA DATABASE..."
echo "-----------------------------------"

# Verificar se a database profitshards-db existe e tem as tabelas corretas
echo "📊 Tabelas na database profitshards-db:"
wrangler d1 execute profitshards-db --command="SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "❌ Database profitshards-db não encontrada ou não configurada"

echo ""
echo "📊 ESTATÍSTICAS DA DATABASE..."
echo "-----------------------------"

# Contar usuários (se existir)
echo "👥 Total de usuários:"
wrangler d1 execute profitshards-db --command="SELECT COUNT(*) as total FROM users;" 2>/dev/null || echo "❌ Tabela users não encontrada"

echo "🔑 Total de sessões ativas:"
wrangler d1 execute profitshards-db --command="SELECT COUNT(*) as total FROM sessions WHERE expires_at > $(date +%s)000;" 2>/dev/null || echo "❌ Tabela sessions não encontrada"

echo ""
echo "⚙️ PRÓXIMOS PASSOS..."
echo "--------------------"
echo "1. Se a database não existir, execute:"
echo "   wrangler d1 create profitshards-db"
echo ""
echo "2. Se as tabelas não existirem, execute:"
echo "   wrangler d1 execute profitshards-db --file=./schema.sql"
echo ""
echo "3. Copie o UUID da database e atualize wrangler.toml"
echo ""
echo "4. Configure as variáveis de ambiente no Cloudflare Pages:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo ""
echo "5. Configure o D1 binding no Cloudflare Pages:"
echo "   - Variable name: DB"
echo "   - D1 database: profitshards-db"
echo ""
echo "📖 Guia completo: VERIFICACAO-GOOGLE-OAUTH.md"
echo ""
echo "🎯 Teste final: https://profitshards.pages.dev"
echo ""