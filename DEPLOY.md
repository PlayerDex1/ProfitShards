# Deploy da Calculadora Worldshards no GitHub Pages

Este guia mostra como fazer deploy da sua calculadora no GitHub Pages gratuitamente.

## Pré-requisitos

1. Conta no GitHub
2. Repositório criado no GitHub
3. Código da calculadora no repositório

## Passos para Deploy

### 1. Configurar o Repositório

1. **Crie um novo repositório no GitHub** ou use um existente
2. **Faça upload de todos os arquivos** do projeto para o repositório
3. **Certifique-se** que os arquivos estão na branch `main`

### 2. Ativar GitHub Pages

1. Vá até as **Settings** do seu repositório
2. Role até a seção **Pages** no menu lateral
3. Em **Source**, selecione **GitHub Actions**
4. O GitHub detectará automaticamente o workflow de deploy

### 3. Configuração Automática

O projeto já inclui:
- ✅ **Workflow do GitHub Actions** (`.github/workflows/deploy.yml`)
- ✅ **Configuração de build** para produção (`vite.config.production.ts`)
- ✅ **Otimizações de performance** (minificação, code splitting)
- ✅ **Meta tags SEO** para melhor indexação

### 4. Deploy Automático

Após configurar o GitHub Pages:

1. **Push para main**: Todo push na branch `main` dispara o deploy automaticamente
2. **Build automático**: O GitHub Actions faz build otimizado do projeto
3. **Deploy**: O site é publicado automaticamente
4. **URL**: Sua calculadora estará disponível em: `https://SEU-USUARIO.github.io/worldshards-calculator/`

## Estrutura do Projeto

```
projeto/
├── .github/workflows/deploy.yml    # Configuração de deploy
├── client/                         # Código da aplicação
│   ├── src/                       # Componentes React
│   └── index.html                 # Página principal
├── vite.config.production.ts      # Build de produção
└── DEPLOY.md                      # Este guia
```

## Recursos Implementados

### ✅ Performance Otimizada
- **Minificação** de código JavaScript e CSS
- **Code splitting** para carregamento mais rápido
- **Lazy loading** de componentes
- **Debounce** para evitar cálculos excessivos

### ✅ Modo Escuro Completo
- **Tema claro/escuro** com troca suave
- **Persistência** da preferência do usuário
- **Detecção automática** da preferência do sistema

### ✅ Funcionalidades Avançadas
- **Histórico de cálculos** salvos localmente
- **Gráficos interativos** de performance
- **Distribuição visual** de tokens
- **Métricas de eficiência** detalhadas

### ✅ SEO e Acessibilidade
- **Meta tags** otimizadas para redes sociais
- **Suporte a múltiplas linguagens** (PT-BR)
- **Design responsivo** para todas as telas

## Personalização

### Alterar URL Base
Se quiser usar um domínio personalizado, edite o arquivo `vite.config.production.ts`:
\`\`\`typescript
base: '/seu-dominio-personalizado/', // Altere aqui
\`\`\`

### Modificar Nome do Projeto
Para alterar o nome no GitHub Pages, renomeie seu repositório nas configurações.

## Solução de Problemas

### ❌ Deploy Falhou
- Verifique se todos os arquivos estão commitados
- Confirme que a branch `main` tem as últimas mudanças
- Veja os logs do GitHub Actions na aba **Actions**

### ❌ Site Não Carrega
- Aguarde até 10 minutos após o primeiro deploy
- Limpe o cache do navegador
- Verifique se a URL está correta

### ❌ Recursos Não Encontrados
- Confirme que o `base` no `vite.config.production.ts` corresponde ao nome do repositório
- Verifique se todos os arquivos foram buildados corretamente

## Próximos Passos

Após o deploy bem-sucedido, você pode:
1. **Compartilhar** a URL da calculadora
2. **Customizar** cores e layout
3. **Adicionar** novas funcionalidades
4. **Monitorar** o uso com Google Analytics

Sua Calculadora de Lucro Worldshards estará online e acessível mundialmente! 🚀