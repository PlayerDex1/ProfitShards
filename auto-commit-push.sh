#!/bin/bash

# Script para commit e push automático
# Uso: ./auto-commit-push.sh [mensagem_do_commit]

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
print_message() {
    echo -e "${GREEN}[AUTO-COMMIT]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    print_error "Este diretório não é um repositório Git!"
    exit 1
fi

# Verificar se há mudanças para commitar
if [ -z "$(git status --porcelain)" ]; then
    print_warning "Não há mudanças para commitar!"
    exit 0
fi

# Obter a mensagem do commit
if [ -z "$1" ]; then
    # Se não foi fornecida mensagem, usar timestamp
    COMMIT_MESSAGE="🔄 AUTO-COMMIT: $(date '+%Y-%m-%d %H:%M:%S') - Mudanças automáticas"
else
    COMMIT_MESSAGE="$1"
fi

print_info "Iniciando processo de commit e push automático..."

# Adicionar todas as mudanças
print_message "Adicionando arquivos modificados..."
git add .

# Fazer o commit
print_message "Fazendo commit com mensagem: $COMMIT_MESSAGE"
if git commit -m "$COMMIT_MESSAGE"; then
    print_message "✅ Commit realizado com sucesso!"
else
    print_error "❌ Falha ao fazer commit!"
    exit 1
fi

# Obter o nome da branch atual
CURRENT_BRANCH=$(git branch --show-current)
print_info "Branch atual: $CURRENT_BRANCH"

# Fazer push para a branch atual
print_message "Fazendo push para origin/$CURRENT_BRANCH..."
if git push origin "$CURRENT_BRANCH"; then
    print_message "✅ Push realizado com sucesso!"
    print_message "🎉 Todas as operações foram concluídas!"
else
    print_error "❌ Falha ao fazer push!"
    print_warning "O commit foi feito, mas o push falhou. Execute 'git push' manualmente."
    exit 1
fi

# Mostrar status final
print_info "Status final do repositório:"
git status --short

print_message "🚀 Processo concluído com sucesso!"