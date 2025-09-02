#!/bin/bash

# Script para adicionar campos de notificação na tabela giveaway_participants
# Este script resolve o bug de envio de emails

echo "🔧 Configurando campos de notificação para envio de emails..."
echo ""

# Verificar se o arquivo de migração existe
if [ ! -f "schema/add_notification_fields.sql" ]; then
    echo "❌ Arquivo de migração não encontrado: schema/add_notification_fields.sql"
    exit 1
fi

echo "📋 Executando migração para adicionar campos de notificação..."
echo ""

# Executar a migração SQL
echo "Executando: schema/add_notification_fields.sql"
echo ""

# Se você estiver usando Cloudflare D1, execute:
# npx wrangler d1 execute DB_NAME --file=schema/add_notification_fields.sql

# Se você estiver usando SQLite local, execute:
# sqlite3 database.db < schema/add_notification_fields.sql

echo "✅ Migração criada com sucesso!"
echo ""
echo "📝 Para aplicar a migração:"
echo ""
echo "1. Se estiver usando Cloudflare D1:"
echo "   npx wrangler d1 execute DB_NAME --file=schema/add_notification_fields.sql"
echo ""
echo "2. Se estiver usando SQLite local:"
echo "   sqlite3 database.db < schema/add_notification_fields.sql"
echo ""
echo "3. Ou execute o SQL diretamente no seu banco de dados"
echo ""
echo "🔍 Campos adicionados:"
echo "   - notified (BOOLEAN)"
echo "   - notification_method (TEXT)"
echo "   - notified_by (TEXT)"
echo "   - notified_at (TEXT)"
echo "   - claimed (BOOLEAN)"
echo "   - claimed_at (TEXT)"
echo "   - claimed_by (TEXT)"
echo "   - shipping_status (TEXT)"
echo "   - tracking_code (TEXT)"
echo "   - shipped_at (TEXT)"
echo "   - shipped_by (TEXT)"
echo ""
echo "🎯 Após aplicar a migração, o sistema de envio de emails funcionará corretamente!"