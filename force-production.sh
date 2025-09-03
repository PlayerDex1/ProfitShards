#!/bin/bash

# Script para forçar PRODUÇÃO - sempre na branch main
# Todas as atualizações vão para produção

echo "🚀 FORÇANDO PRODUÇÃO - Sempre na branch main!"
echo "=============================================="

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    echo "❌ ERRO: Este diretório não é um repositório Git!"
    exit 1
fi

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch atual: $CURRENT_BRANCH"

# Se não estiver na main, mudar para main
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Mudando para branch main..."
    git checkout main
    
    # Verificar se a mudança foi bem-sucedida
    if [ $? -eq 0 ]; then
        echo "✅ Mudou para branch main com sucesso!"
    else
        echo "❌ ERRO: Não foi possível mudar para branch main!"
        exit 1
    fi
else
    echo "✅ Já está na branch main!"
fi

# Sincronizar com o repositório remoto
echo "🔄 Sincronizando com origin/main..."
git pull origin main

# Verificar se há mudanças para commitar
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Não há mudanças para commitar!"
    echo "🚀 Sistema pronto para PRODUÇÃO!"
    exit 0
fi

# Mostrar mudanças pendentes
echo "📋 Mudanças pendentes:"
git status --short

# Perguntar se quer fazer commit automático
echo ""
echo "❓ Deseja fazer commit automático para PRODUÇÃO? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "🚀 Fazendo commit automático para PRODUÇÃO..."
    
    # Adicionar todas as mudanças
    git add .
    
    # Commit com mensagem de produção
    COMMIT_MSG="🚀 PRODUÇÃO: $(date '+%Y-%m-%d %H:%M:%S') - Atualização automática para produção"
    git commit -m "$COMMIT_MSG"
    
    # Push para produção (main)
    echo "🚀 Fazendo push para PRODUÇÃO (main)..."
    git push origin main
    
    echo "✅ Commit e push para PRODUÇÃO realizados com sucesso!"
    echo "📅 Commit: $COMMIT_MSG"
else
    echo "⏸️  Commit cancelado. Use 'git acp' quando quiser fazer commit para PRODUÇÃO."
fi

echo ""
echo "🎯 Sistema configurado para PRODUÇÃO!"
echo "📋 Comandos disponíveis:"
echo "  git acp      → Commit + Push automático para PRODUÇÃO"
echo "  git prod     → Commit + Push para PRODUÇÃO (com mensagem personalizada)"
echo "  git main     → Commit + Push para PRODUÇÃO (mensagem padrão)"
echo "  git p        → Push para PRODUÇÃO (main)"
echo ""
echo "⚠️  ATENÇÃO: Todas as mudanças vão para PRODUÇÃO (main)!"