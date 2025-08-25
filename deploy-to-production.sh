#!/bin/bash

# 🚀 SCRIPT PARA DEPLOY EM PRODUÇÃO
# Força deploy das mudanças para ambiente de produção

set -e

echo "🚀 Iniciando deploy para produção..."
echo "📋 Últimos commits:"
git log --oneline -3

echo ""
echo "🔍 Verificando status atual..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Erro: Você deve estar na branch main para fazer deploy"
    echo "   Branch atual: $CURRENT_BRANCH"
    exit 1
fi

echo "✅ Branch main confirmada"

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "❌ Erro: Há mudanças não commitadas"
    echo "   Execute 'git add .' e 'git commit' antes do deploy"
    exit 1
fi

echo "✅ Working tree limpo"

# Fazer push se necessário
echo "📤 Verificando se há commits para push..."
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ $LOCAL != $REMOTE ]; then
    echo "🔄 Fazendo push dos commits locais..."
    git push origin main
    echo "✅ Push concluído"
else
    echo "✅ Repositório já sincronizado"
fi

echo ""
echo "🏗️ Buildando projeto..."

# Build do projeto
npm run build

echo "✅ Build concluído"

echo ""
echo "🌐 Deploy no Cloudflare Pages..."

# Se você tiver wrangler instalado, pode usar:
# npx wrangler pages deploy dist/public --project-name=profitshards --env production

echo "📋 Status do deploy:"
echo "• Branch: main ✅"
echo "• Build: Concluído ✅"  
echo "• Push: Sincronizado ✅"

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. O Cloudflare Pages deve detectar automaticamente o push na branch main"
echo "2. O deploy será iniciado automaticamente em alguns minutos"
echo "3. Verifique o status em: https://dash.cloudflare.com/pages"
echo ""
echo "🔗 URLs para verificar após deploy:"
echo "• Produção: https://profitshards.pages.dev"
echo "• Site principal: https://profitshards.online"
echo ""
echo "✅ Script de deploy concluído!"
echo "⏱️ Aguarde 2-5 minutos para o deploy automático do Cloudflare"