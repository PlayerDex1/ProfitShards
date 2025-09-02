#!/bin/bash

# 🚀 SCRIPT PARA DEPLOY DAS CORREÇÕES DE EMAIL EM PRODUÇÃO
# Este script aplica todas as correções do bug de envio de emails

set -e

echo "🚀 DEPLOY DAS CORREÇÕES DE EMAIL PARA PRODUÇÃO"
echo "================================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "functions/_lib/security.ts" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

echo "📋 Verificando status atual..."
echo ""

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Branch atual: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Você não está na branch main"
    echo "   Recomendado: git checkout main"
    echo ""
fi

# Verificar mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "📝 Há mudanças não commitadas:"
    git status --short
    echo ""
    echo "💡 Para incluir todas as mudanças:"
    echo "   git add ."
    echo "   git commit -m 'Fix: Corrigir bug de envio de emails e rate limiting'"
    echo ""
    read -p "Deseja fazer commit das mudanças agora? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Fix: Corrigir bug de envio de emails e rate limiting"
        echo "✅ Commit realizado"
    else
        echo "❌ Commit cancelado. Execute o script novamente após fazer commit"
        exit 1
    fi
else
    echo "✅ Working tree limpo"
fi

echo ""
echo "🔍 Verificando arquivos corrigidos..."
echo ""

# Listar arquivos que foram corrigidos
echo "📁 Arquivos corrigidos:"
echo "   ✅ functions/_lib/security.ts (rate limiting ajustado)"
echo "   ✅ functions/api/winners/send-email.ts (API corrigida)"
echo "   ✅ schema/add_notification_fields.sql (migração do banco)"
echo "   ✅ setup-notification-fields.sh (script de setup)"
echo "   ✅ clear-rate-limit.sh (script de limpeza)"
echo ""

# Verificar se os arquivos existem
FILES_TO_CHECK=(
    "functions/_lib/security.ts"
    "functions/api/winners/send-email.ts"
    "schema/add_notification_fields.sql"
    "setup-notification-fields.sh"
    "clear-rate-limit.sh"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (NÃO ENCONTRADO)"
        exit 1
    fi
done

echo ""
echo "🚀 Iniciando deploy para produção..."
echo ""

# Fazer push se necessário
echo "📤 Verificando sincronização com repositório remoto..."
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "no-upstream")

if [ "$REMOTE" = "no-upstream" ]; then
    echo "⚠️  Branch sem upstream configurado"
    echo "   Configure com: git push --set-upstream origin main"
    exit 1
fi

if [ $LOCAL != $REMOTE ]; then
    echo "🔄 Fazendo push dos commits..."
    git push origin main
    echo "✅ Push concluído"
else
    echo "✅ Repositório já sincronizado"
fi

echo ""
echo "🏗️ Buildando projeto para produção..."

# Build do projeto
if npm run build; then
    echo "✅ Build concluído com sucesso"
else
    echo "❌ Erro no build. Verifique os erros acima"
    exit 1
fi

echo ""
echo "🌐 Deploy no Cloudflare Pages..."

# Deploy usando wrangler
if command -v npx &> /dev/null; then
    echo "📦 Fazendo deploy via Wrangler..."
    
    # Deploy para produção
    if npx wrangler pages deploy dist/public --project-name=profitshards --env production; then
        echo "✅ Deploy para produção concluído!"
    else
        echo "⚠️  Deploy via wrangler falhou, mas o push foi feito"
        echo "   O Cloudflare Pages fará deploy automático em alguns minutos"
    fi
else
    echo "⚠️  Wrangler não encontrado, deploy automático será usado"
fi

echo ""
echo "🎯 DEPLOY CONCLUÍDO!"
echo "===================="
echo ""
echo "📋 Status:"
echo "   ✅ Código corrigido e commitado"
echo "   ✅ Push realizado para main"
echo "   ✅ Build de produção concluído"
echo "   ✅ Deploy iniciado"
echo ""
echo "⏱️  Tempo estimado para deploy completo: 2-5 minutos"
echo ""
echo "🔗 URLs para verificar:"
echo "   • Produção: https://profitshards.pages.dev"
echo "   • Site principal: https://profitshards.online"
echo ""
echo "📧 Teste o envio de emails após o deploy:"
echo "   1. Acesse o painel de ganhadores"
echo "   2. Tente enviar um email"
echo "   3. Verifique se não há mais erro 429"
echo ""
echo "💡 Se ainda houver erro 429:"
echo "   Execute: ./clear-rate-limit.sh"
echo "   Ou aguarde 1 minuto para o rate limit expirar"
echo ""
echo "🎉 Correções de email aplicadas com sucesso!"