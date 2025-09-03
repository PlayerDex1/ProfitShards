#!/bin/bash

# Script para configurar alias Git globais para commit e push automático

echo "🔧 Configurando alias Git globais..."

# Alias para commit e push automático
git config --global alias.acp '!f() { git add . && git commit -m "🔄 AUTO-COMMIT: $(date +%Y-%m-%d\ %H:%M:%S) - Mudanças automáticas" && git push origin $(git branch --show-current); }; f'

# Alias para commit automático (sem push)
git config --global alias.ac '!f() { git add . && git commit -m "🔄 AUTO-COMMIT: $(date +%Y-%m-%d\ %H:%M:%S) - Mudanças automáticas"; }; f'

# Alias para push da branch atual
git config --global alias.p 'push origin $(git branch --show-current)'

# Alias para status resumido
git config --global alias.st 'status --short'

# Alias para log resumido
git config --global alias.lg 'log --oneline --graph --decorate'

echo "✅ Alias Git configurados com sucesso!"
echo ""
echo "📋 Alias disponíveis:"
echo "  git acp  → Commit + Push automático"
echo "  git ac   → Commit automático (sem push)"
echo "  git p    → Push da branch atual"
echo "  git st   → Status resumido"
echo "  git lg   → Log resumido"
echo ""
echo "🚀 Uso: git acp"