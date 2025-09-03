#!/bin/bash

# Script simples para commit e push automático
echo "🚀 Iniciando commit e push automático..."

# Verificar se há mudanças
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Não há mudanças para commitar!"
    exit 0
fi

# Adicionar todas as mudanças
git add .

# Fazer commit com timestamp
COMMIT_MSG="🔄 AUTO-COMMIT: $(date '+%Y-%m-%d %H:%M:%S') - Mudanças automáticas"
git commit -m "$COMMIT_MSG"

# Fazer push para a branch atual
CURRENT_BRANCH=$(git branch --show-current)
git push origin "$CURRENT_BRANCH"

echo "✅ Commit e push realizados com sucesso!"
echo "📅 Commit: $COMMIT_MSG"
echo "🌿 Branch: $CURRENT_BRANCH"