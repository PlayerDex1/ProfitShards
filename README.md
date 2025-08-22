# Worldshards - Calculadora de Lucro

Uma aplicação web para calcular lucros em jogos, com sistema de autenticação Google OAuth.

## 🚀 Funcionalidades

- **Calculadora de Lucro**: Interface intuitiva para calcular lucros
- **Sistema de Equipamentos**: Gerenciamento de equipamentos com luck
- **Autenticação Google**: Login seguro via Google OAuth
- **Perfil de Usuário**: Dados personalizados por usuário
- **Interface Responsiva**: Funciona em desktop e mobile

## 🔐 Autenticação

O sistema utiliza Google OAuth para autenticação segura:

- Login único com conta Google
- Sessões seguras com cookies HttpOnly
- Verificação automática de email
- Logout seguro

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Cloudflare Functions
- **Banco de Dados**: Cloudflare D1 (SQLite) / PostgreSQL
- **Deploy**: Cloudflare Pages
- **Autenticação**: Google OAuth 2.0

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd worldshards-auth
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute o projeto:
```bash
npm run dev
```

## 🔧 Configuração

### Google OAuth

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
2. Configure OAuth 2.0 Client ID
3. Adicione URIs de redirecionamento:
   - `http://localhost:5000/api/auth/google/callback` (desenvolvimento)
   - `https://your-domain.com/api/auth/google/callback` (produção)

### Banco de Dados

#### Cloudflare D1 (Recomendado)
```bash
# Criar banco
wrangler d1 create worldshards-db

# Aplicar schema
npm run db:setup
```

#### PostgreSQL
```bash
# Configurar DATABASE_URL no .env
npm run db:push
```

## 🚀 Deploy

### Cloudflare Pages

1. Configure o projeto no Cloudflare Pages
2. Configure variáveis de ambiente:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. Configure binding do banco D1
4. Deploy automático via GitHub Actions

### GitHub Actions

Configure os secrets necessários:
- `PAT_PUSH`
- `CLOUDFLARE_API_TOKEN`
- `CF_ACCOUNT_ID`
- `CF_PROJECT_NAME`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 📚 Documentação

- [Configuração do Google OAuth](README-GOOGLE-AUTH.md)
- [Configuração do Banco de Dados](database-setup.md)
- [Configuração de Desenvolvimento](dev-setup.md)
- [Configuração de Produção](production-setup.md)
- [Checklist de Deploy](deploy-checklist.md)

## 🔍 Endpoints da API

- `GET /api/auth/google/start` - Inicia fluxo Google OAuth
- `GET /api/auth/google/callback` - Callback do Google OAuth
- `GET /api/auth/me` - Informações do usuário autenticado
- `POST /api/auth/logout` - Logout do usuário

## 🛡️ Segurança

- Cookies HttpOnly e Secure
- Sessões com expiração (7 dias)
- Validação de tokens Google
- Proteção CSRF com SameSite=Lax
- HTTPS forçado em produção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique a [documentação](README-GOOGLE-AUTH.md)
2. Consulte o [checklist de deploy](deploy-checklist.md)
3. Verifique os logs do Cloudflare Pages
4. Abra uma issue no GitHub
