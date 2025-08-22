#!/bin/bash

echo "🗄️ CONFIGURAÇÃO DATABASE EXISTENTE - PROFITSHARDS"
echo "================================================"
echo ""
echo "✅ Database encontrada:"
echo "   Nome: profitshards"
echo "   ID: 0565dee6-30b3-48d5-ad6d-7f7e19d26d24"
echo ""

# Verificar se wrangler está instalado
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI não encontrado. Instalando..."
    npm install -g wrangler
    echo "✅ Wrangler CLI instalado"
else
    echo "✅ Wrangler CLI encontrado"
fi

echo ""
echo "🔑 Fazendo login no Cloudflare..."
wrangler login

echo ""
echo "🔍 VERIFICANDO SCHEMA DA DATABASE..."
echo "-----------------------------------"

# Verificar tabelas existentes
echo "📊 Tabelas existentes na database 'profitshards':"
wrangler d1 execute profitshards --command="SELECT name FROM sqlite_master WHERE type='table';"

echo ""
echo "🔧 VERIFICANDO SE PRECISA EXECUTAR SCHEMA..."
echo "--------------------------------------------"

# Verificar se as tabelas users e sessions existem
TABLES=$(wrangler d1 execute profitshards --command="SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name IN ('users', 'sessions');" --json 2>/dev/null | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ "$TABLES" = "2" ]; then
    echo "✅ Tabelas 'users' e 'sessions' já existem!"
    echo ""
    echo "📊 ESTATÍSTICAS ATUAIS:"
    echo "----------------------"
    echo "👥 Total de usuários:"
    wrangler d1 execute profitshards --command="SELECT COUNT(*) as total FROM users;"
    echo ""
    echo "🔑 Sessões ativas:"
    wrangler d1 execute profitshards --command="SELECT COUNT(*) as total FROM sessions WHERE expires_at > $(date +%s)000;"
else
    echo "❌ Tabelas 'users' e 'sessions' não encontradas!"
    echo ""
    echo "🔧 Executando schema.sql..."
    wrangler d1 execute profitshards --file=./schema.sql
    echo "✅ Schema executado com sucesso!"
fi

echo ""
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "========================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. ✅ Database configurada: profitshards (0565dee6-30b3-48d5-ad6d-7f7e19d26d24)"
echo "2. ✅ wrangler.toml atualizado com database correta"
echo ""
echo "3. 🔧 Configure no Cloudflare Pages Dashboard:"
echo "   https://dash.cloudflare.com/pages/profitshards/settings/environment-variables"
echo ""
echo "   Environment Variables:"
echo "   - GOOGLE_CLIENT_ID = seu-client-id.apps.googleusercontent.com"
echo "   - GOOGLE_CLIENT_SECRET = seu-client-secret"
echo ""
echo "4. 🔗 Verifique D1 Database Binding:"
echo "   https://dash.cloudflare.com/pages/profitshards/settings/functions"
echo ""
echo "   D1 database bindings:"
echo "   - Variable name: DB"
echo "   - D1 database: profitshards"
echo ""
echo "5. 🚀 Commit e push as mudanças:"
echo "   git add ."
echo "   git commit -m 'fix: Atualiza wrangler.toml com database existente'"
echo "   git push origin main"
echo ""
echo "6. 🎯 Teste o login em: https://profitshards.pages.dev"
echo ""
echo "📖 Guia completo: VERIFICACAO-GOOGLE-OAUTH.md"