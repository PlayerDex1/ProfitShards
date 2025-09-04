# 🚀 ProfitShards Development Workflow

Este documento explica como trabalhar com o sistema de desenvolvimento profissional do ProfitShards.

## 🌐 **Ambientes**

### **Produção (Main)**
- **URL:** https://profitshards.online
- **Branch:** `main`
- **Status:** Site estável e funcionando
- **Deploy:** Automático via GitHub Actions

### **Staging (Desenvolvimento)**
- **URL:** https://dev.profitshards.online
- **Branch:** `develop`
- **Status:** Ambiente de teste
- **Deploy:** Automático via GitHub Actions

## 🔄 **Workflow de Desenvolvimento**

### **1. Iniciando Nova Feature**
```bash
# Usar o script automatizado
./scripts/dev-workflow.sh start

# Ou manualmente:
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature
```

### **2. Desenvolvendo**
- Faça suas alterações
- Teste localmente: `npm run dev`
- Commit suas mudanças: `git add . && git commit -m "feat: descrição"`

### **3. Testando no Staging**
```bash
# Push para develop
git checkout develop
git merge feature/nome-da-feature
git push origin develop

# Deploy automático para https://dev.profitshards.online
```

### **4. Aprovando para Produção**
```bash
# Usar o script automatizado
./scripts/dev-workflow.sh merge-prod

# Ou manualmente:
git checkout main
git merge develop
git push origin main

# Deploy automático para https://profitshards.online
```

## 🛠️ **Scripts Disponíveis**

### **Script de Workflow**
```bash
./scripts/dev-workflow.sh [comando]
```

**Comandos disponíveis:**
- `status` - Mostra status atual do git
- `start` - Inicia nova feature branch
- `test` - Testa feature atual
- `merge-dev` - Merge para develop (staging)
- `merge-prod` - Merge para main (produção)
- `help` - Mostra ajuda

### **Scripts NPM**
```bash
npm run dev          # Desenvolvimento local
npm run build        # Build para produção
npm run build:staging # Build para staging
```

## 📁 **Estrutura de Branches**

```
main (produção)
├── develop (staging)
    ├── feature/nova-calculadora
    ├── feature/novo-planner
    └── feature/melhorias-ui
```

## 🔧 **Configuração do Cloudflare**

### **Secrets Necessários (GitHub)**
Configure estes secrets no GitHub:
- `CLOUDFLARE_API_TOKEN` - Token da API do Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` - ID da conta Cloudflare

### **Projetos Cloudflare Pages**
- **Produção:** `profitshards` → profitshards.online
- **Staging:** `profitshards-staging` → dev.profitshards.online

## 🚨 **Regras Importantes**

### **✅ FAÇA:**
- Sempre teste no staging antes da produção
- Use branches feature para novas funcionalidades
- Mantenha o main sempre estável
- Use commits descritivos
- Teste localmente antes de fazer push

### **❌ NÃO FAÇA:**
- Commitar diretamente no main
- Deployar para produção sem testar
- Deixar o staging quebrado
- Usar commits vazios ou sem descrição

## 🆘 **Resolução de Problemas**

### **Staging Quebrado**
```bash
# Reverter para último commit funcionando
git checkout develop
git reset --hard HEAD~1
git push origin develop --force
```

### **Produção Quebrada**
```bash
# Reverter para último commit estável
git checkout main
git reset --hard [commit-hash]
git push origin main --force
```

### **Conflitos de Merge**
```bash
# Resolver conflitos
git checkout develop
git pull origin develop
git merge feature/sua-feature
# Resolver conflitos manualmente
git add .
git commit -m "resolve: merge conflicts"
```

## 📞 **Suporte**

- **Discord:** Holdboy
- **Twitter:** @playerhold
- **Issues:** GitHub Issues

---

**Lembre-se:** O staging é seu playground, a produção é sagrada! 🛡️