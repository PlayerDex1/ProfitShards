# Guia de Contribuição

Obrigado por considerar contribuir com o Worldshards! Este documento fornece diretrizes para contribuições.

## Como Contribuir

### 1. Fork e Clone

1. Faça um fork do repositório
2. Clone seu fork localmente:
```bash
git clone https://github.com/seu-usuario/worldshards-auth.git
cd worldshards-auth
```

### 2. Configurar Ambiente

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Configure o Google OAuth para desenvolvimento:
   - Adicione `http://localhost:5000/api/auth/google/callback` aos URIs de redirecionamento

### 3. Desenvolver

1. Crie uma branch para sua feature:
```bash
git checkout -b feature/nova-funcionalidade
```

2. Faça suas alterações
3. Teste localmente:
```bash
npm run dev
```

4. Execute os testes:
```bash
npm run check
```

### 4. Commit e Push

1. Adicione suas alterações:
```bash
git add .
```

2. Faça commit com mensagem descritiva:
```bash
git commit -m "feat: adiciona nova funcionalidade"
```

3. Push para sua branch:
```bash
git push origin feature/nova-funcionalidade
```

### 5. Pull Request

1. Vá para o repositório original no GitHub
2. Clique em "New Pull Request"
3. Selecione sua branch
4. Preencha o template do PR
5. Aguarde a revisão

## Padrões de Código

### TypeScript

- Use TypeScript para todo código novo
- Mantenha tipagem forte
- Use interfaces para estruturas de dados
- Evite `any` - use tipos específicos

### React

- Use hooks funcionais
- Mantenha componentes pequenos e focados
- Use TypeScript para props
- Siga as convenções de nomenclatura

### Estilo

- Use Prettier para formatação
- Siga as regras do ESLint
- Use nomes descritivos para variáveis e funções
- Comente código complexo

## Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/         # Hooks customizados
│   │   ├── pages/         # Páginas da aplicação
│   │   └── lib/           # Utilitários
├── server/                # Backend Express
├── functions/             # Cloudflare Functions
│   ├── api/auth/google/   # Endpoints Google OAuth
│   └── _lib/              # Bibliotecas compartilhadas
├── shared/                # Código compartilhado
└── migrations/            # Migrações do banco
```

## Testes

### Frontend

- Teste componentes isoladamente
- Teste fluxos de usuário
- Verifique responsividade
- Teste em diferentes navegadores

### Backend

- Teste endpoints da API
- Verifique validação de dados
- Teste autenticação
- Verifique logs de erro

## Deploy

### Desenvolvimento

```bash
npm run dev
```

### Produção

1. Configure as variáveis de ambiente
2. Execute o build:
```bash
npm run build
```

3. Deploy via GitHub Actions ou manualmente

## Comunicação

### Issues

- Use templates de issue quando disponíveis
- Seja específico sobre o problema
- Inclua passos para reproduzir
- Adicione screenshots quando relevante

### Pull Requests

- Descreva as mudanças claramente
- Inclua testes quando apropriado
- Atualize documentação se necessário
- Responda a feedback construtivo

## Recursos Úteis

- [Documentação do Google OAuth](README-GOOGLE-AUTH.md)
- [Configuração de Desenvolvimento](dev-setup.md)
- [Configuração de Produção](production-setup.md)
- [Checklist de Deploy](deploy-checklist.md)

## Código de Conduta

- Seja respeitoso e inclusivo
- Ajude outros desenvolvedores
- Mantenha discussões construtivas
- Reporte comportamento inadequado

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a licença MIT.