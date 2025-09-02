#!/bin/bash

# Script para limpar rate limiting e resolver erro 429
# Este script limpa o cache de rate limiting que pode estar causando bloqueios

echo "🔧 Limpando Rate Limiting para resolver erro 429..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "functions/_lib/security.ts" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

echo "📋 Configurações de Rate Limiting atualizadas:"
echo "   - auth: 5 tentativas por minuto"
echo "   - api: 100 requests por minuto"
echo "   - strict: 3 tentativas por 5 minutos"
echo "   - admin: 20 tentativas por minuto"
echo "   - email: 10 emails por minuto (NOVO!)"
echo ""

echo "🧹 Para limpar o rate limiting atual:"
echo ""

# Se estiver usando Cloudflare D1
echo "1. Limpar tabela de rate limits no banco:"
echo "   npx wrangler d1 execute DB_NAME --command='DELETE FROM rate_limits;'"
echo ""

# Se estiver usando SQLite local
echo "2. Ou se estiver usando SQLite local:"
echo "   sqlite3 database.db 'DELETE FROM rate_limits;'"
echo ""

echo "3. Ou aguardar o tempo de expiração:"
echo "   - Rate limit 'strict': 5 minutos"
echo "   - Rate limit 'email': 1 minuto"
echo ""

echo "🎯 Soluções implementadas:"
echo "   ✅ Rate limiting para emails aumentado para 10/min"
echo "   ✅ API de envio de emails usa tipo 'email' em vez de 'strict'"
echo "   ✅ Fallback para permitir requests em caso de erro"
echo ""

echo "📧 Agora você pode enviar até 10 emails por minuto!"
echo ""

echo "💡 Se o erro persistir:"
echo "   1. Aguarde 1 minuto para o rate limit expirar"
echo "   2. Ou limpe a tabela rate_limits no banco"
echo "   3. Ou reinicie o servidor/worker"