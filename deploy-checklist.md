# Checklist para Deploy com Google OAuth

## ✅ Configuração do Google Cloud Console

- [ ] Criar projeto no Google Cloud Console
- [ ] Habilitar Google+ API
- [ ] Criar OAuth 2.0 Client ID
- [ ] Configurar URIs de redirecionamento:
  - `https://your-domain.com/api/auth/google/callback`
  - `https://www.your-domain.com/api/auth/google/callback`

## ✅ Configuração do Cloudflare

- [ ] Criar banco D1
- [ ] Aplicar schema SQL
- [ ] Configurar binding do banco no Pages
- [ ] Configurar variáveis de ambiente:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

## ✅ Configuração do GitHub

- [ ] Configurar secrets:
  - `PAT_PUSH`
  - `CLOUDFLARE_API_TOKEN`
  - `CF_ACCOUNT_ID`
  - `CF_PROJECT_NAME`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- [ ] Habilitar "Read and write permissions" em Settings > Actions

## ✅ Deploy

- [ ] Fazer commit das alterações
- [ ] Push para branch main
- [ ] Verificar deploy no Cloudflare Pages
- [ ] Testar endpoint `/api/auth/google/start`
- [ ] Testar fluxo completo de login

## ✅ Testes

- [ ] Testar login com Google
- [ ] Testar logout
- [ ] Testar verificação de autenticação
- [ ] Testar em diferentes navegadores
- [ ] Testar em dispositivos móveis

## 🔧 Troubleshooting

### Erro 404 no endpoint Google
- Verificar se as functions estão no diretório correto
- Verificar configuração do Cloudflare Pages

### Erro de autenticação Google
- Verificar Client ID e Secret
- Verificar URIs de redirecionamento
- Verificar se a API está habilitada

### Erro de banco de dados
- Verificar binding do D1
- Verificar schema aplicado
- Verificar permissões

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs do Cloudflare Pages
2. Verificar console do navegador
3. Verificar Network tab para erros de API
4. Consultar documentação do Google OAuth