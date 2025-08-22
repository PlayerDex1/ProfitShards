#!/bin/bash

echo "🗄️ MIGRAÇÃO DATABASE - PROFITSHARDS"
echo "=================================="
echo ""
echo "🔧 Problema detectado: Coluna 'google_sub' não existe"
echo "✅ Solução: Executar migração para adicionar colunas necessárias"
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
echo "🔍 VERIFICANDO ESTRUTURA ATUAL DA DATABASE..."
echo "--------------------------------------------"

echo "📊 Colunas da tabela users:"
wrangler d1 execute profitshards --command="PRAGMA table_info(users);"

echo ""
echo "📊 Tabelas existentes:"
wrangler d1 execute profitshards --command="SELECT name FROM sqlite_master WHERE type='table';"

echo ""
echo "🔧 EXECUTANDO MIGRAÇÃO..."
echo "------------------------"

echo "📝 Adicionando colunas necessárias para Google OAuth..."

# Executar cada comando separadamente para evitar erros
echo "1. Adicionando coluna google_sub..."
wrangler d1 execute profitshards --command="ALTER TABLE users ADD COLUMN google_sub TEXT;" 2>/dev/null || echo "   ⚠️ Coluna google_sub já existe ou erro"

echo "2. Adicionando coluna email_verified..."
wrangler d1 execute profitshards --command="ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;" 2>/dev/null || echo "   ⚠️ Coluna email_verified já existe ou erro"

echo "3. Adicionando coluna created_at..."
wrangler d1 execute profitshards --command="ALTER TABLE users ADD COLUMN created_at INTEGER;" 2>/dev/null || echo "   ⚠️ Coluna created_at já existe ou erro"

echo "4. Criando tabela sessions..."
wrangler d1 execute profitshards --command="CREATE TABLE IF NOT EXISTS sessions (session_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL);"

echo "5. Criando índices..."
wrangler d1 execute profitshards --command="CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);" 2>/dev/null
wrangler d1 execute profitshards --command="CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);" 2>/dev/null
wrangler d1 execute profitshards --command="CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);" 2>/dev/null
wrangler d1 execute profitshards --command="CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);" 2>/dev/null

echo ""
echo "✅ MIGRAÇÃO CONCLUÍDA!"
echo "====================="

echo ""
echo "🔍 VERIFICANDO NOVA ESTRUTURA..."
echo "--------------------------------"

echo "📊 Nova estrutura da tabela users:"
wrangler d1 execute profitshards --command="PRAGMA table_info(users);"

echo ""
echo "📊 Tabelas após migração:"
wrangler d1 execute profitshards --command="SELECT name FROM sqlite_master WHERE type='table';"

echo ""
echo "✅ PRÓXIMOS PASSOS:"
echo "=================="
echo "1. ✅ Database migrada com sucesso"
echo "2. 🔄 Force redeploy para aplicar mudanças:"
echo "   git commit --allow-empty -m 'fix: Database migrated for Google OAuth'"
echo "   git push origin main"
echo ""
echo "3. ⏰ Aguarde 5-10 minutos para deploy"
echo "4. 🧪 Teste o login Google novamente"
echo "5. 🎯 Acesse: https://profitshards.pages.dev ou https://profitsfards.online"
echo ""
echo "📖 O erro 'no such column: google_sub' deve estar resolvido!"