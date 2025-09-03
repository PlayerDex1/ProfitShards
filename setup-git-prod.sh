#!/bin/bash

# Script para configurar sistema de commit automático para PRODUÇÃO
# Sempre fará push para a branch main (produção)

echo "🚀 Configurando sistema para PRODUÇÃO (branch main)..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  AVISO: Você está na branch '$CURRENT_BRANCH', não na main!"
    echo "🔄 Mudando para branch main..."
    git checkout main
    git pull origin main
fi

# Configurar alias para commit e push para PRODUÇÃO
echo "🔧 Configurando alias para PRODUÇÃO..."

# Alias principal: Commit + Push para PRODUÇÃO (main)
git config --global alias.prod '!f() { git add . && git commit -m "🚀 PRODUÇÃO: $(date +%Y-%m-%d\ %H:%M:%S) - $1" && git push origin main; }; f'

# Alias para commit e push para main (produção)
git config --global alias.main '!f() { git add . && git commit -m "🚀 PRODUÇÃO: $(date +%Y-%m-%d\ %H:%M:%S) - Mudanças para produção" && git push origin main; }; f'

# Alias para commit e push automático (sempre para main)
git config --global alias.acp '!f() { git add . && git commit -m "🚀 PRODUÇÃO: $(date +%Y-%m-%d\ %H:%M:%S) - Atualização automática para produção" && git push origin main; }; f'

# Alias para commit automático (sem push)
git config --global alias.ac '!f() { git add . && git commit -m "🚀 PRODUÇÃO: $(date +%Y-%m-%d\ %H:%M:%S) - Mudanças para produção"; }; f'

# Alias para push para produção
git config --global alias.p 'push origin main'

# Alias para status resumido
git config --global alias.st 'status --short'

# Alias para log resumido
git config --global alias.lg 'log --oneline --graph --decorate'

# Alias para mudar para main e fazer pull
git config --global alias.main-sync '!f() { git checkout main && git pull origin main; }; f'

echo "✅ Sistema configurado para PRODUÇÃO!"
echo ""
echo "📋 Alias disponíveis (SEMPRE para PRODUÇÃO):"
echo "  git prod     → Commit + Push para PRODUÇÃO (com mensagem personalizada)"
echo "  git main     → Commit + Push para PRODUÇÃO (mensagem padrão)"
echo "  git acp      → Commit + Push automático para PRODUÇÃO"
echo "  git ac       → Commit para PRODUÇÃO (sem push)"
echo "  git p        → Push para PRODUÇÃO (main)"
echo "  git main-sync→ Mudar para main e sincronizar"
echo "  git st       → Status resumido"
echo "  git lg       → Log resumido"
echo ""
echo "🚀 Uso: git acp (sempre para PRODUÇÃO)"
echo "⚠️  ATENÇÃO: Todas as mudanças vão para PRODUÇÃO (main)!"