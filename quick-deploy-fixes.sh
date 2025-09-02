#!/bin/bash

# 🚀 SCRIPT RÁPIDO PARA APLICAR CORREÇÕES DE EMAIL
# Aplica as correções sem build completo

echo "🚀 APLICAÇÃO RÁPIDA DAS CORREÇÕES DE EMAIL"
echo "============================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "functions/_lib/security.ts" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

echo "📋 Status atual:"
echo "   🌿 Branch: $(git branch --show-current)"
echo "   📝 Mudanças: $(git status --short | wc -l) arquivos modificados"
echo ""

# Verificar se há mudanças
if ! git diff-index --quiet HEAD --; then
    echo "📝 Há mudanças não commitadas:"
    git status --short
    echo ""
    
    echo "💡 Opções:"
    echo "   1. Fazer commit automático das correções"
    echo "   2. Fazer commit manual"
    echo "   3. Cancelar"
    echo ""
    
    read -p "Escolha uma opção (1-3): " -n 1 -r
    echo ""
    
    case $REPLY in
        1)
            echo "📝 Fazendo commit automático..."
            git add .
            git commit -m "Fix: Corrigir bug de envio de emails e rate limiting"
            echo "✅ Commit realizado"
            ;;
        2)
            echo "📝 Faça o commit manualmente e execute o script novamente"
            echo "   git add ."
            echo "   git commit -m 'Fix: Corrigir bug de envio de emails e rate limiting'"
            exit 0
            ;;
        3)
            echo "❌ Operação cancelada"
            exit 0
            ;;
        *)
            echo "❌ Opção inválida"
            exit 1
            ;;
    esac
else
    echo "✅ Working tree limpo"
fi

echo ""
echo "🚀 Aplicando correções..."

# Fazer push
echo "📤 Fazendo push para produção..."
if git push origin main; then
    echo "✅ Push realizado com sucesso!"
else
    echo "❌ Erro no push. Verifique se você tem permissão"
    exit 1
fi

echo ""
echo "🌐 Deploy automático iniciado..."
echo ""
echo "📋 O que foi corrigido:"
echo "   ✅ Rate limiting para emails: 10/min em vez de 3/5min"
echo "   ✅ API de envio de emails corrigida"
echo "   ✅ Campos de notificação adicionados ao banco"
echo "   ✅ Tratamento de erros melhorado"
echo ""
echo "⏱️  Tempo para deploy: 2-5 minutos"
echo ""
echo "🔗 URLs para verificar:"
echo "   • Produção: https://profitshards.pages.dev"
echo "   • Site principal: https://profitshards.online"
echo ""
echo "📧 Teste após o deploy:"
echo "   1. Acesse o painel de ganhadores"
echo "   2. Tente enviar um email"
echo "   3. Não deve mais dar erro 429"
echo ""
echo "🎉 Correções aplicadas com sucesso!"
echo "   O Cloudflare Pages fará deploy automático"