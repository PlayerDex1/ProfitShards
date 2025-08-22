# Configuração do Ambiente de Desenvolvimento

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Git

## Instalação

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

## Configuração do Google OAuth para Desenvolvimento

1. No Google Cloud Console, adicione os seguintes URIs de redirecionamento:
```
http://localhost:5000/api/auth/google/callback
http://127.0.0.1:5000/api/auth/google/callback
```

2. Configure as variáveis no arquivo `.env`:
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Banco de Dados Local

### Opção 1: PostgreSQL
1. Instale PostgreSQL
2. Crie um banco de dados
3. Configure `DATABASE_URL` no `.env`
4. Execute as migrações:
```bash
npm run db:push
```

### Opção 2: SQLite (para desenvolvimento)
1. Instale SQLite
2. Crie um arquivo `dev.db`
3. Configure `DATABASE_URL=sqlite:./dev.db`
4. Execute o schema:
```bash
sqlite3 dev.db < d1-schema.sql
```

## Executando o Projeto

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse http://localhost:5000

3. Teste o login com Google:
   - Clique em "Continuar com Google"
   - Deve redirecionar para o Google
   - Após autenticação, deve voltar para a aplicação

## Debugging

### Logs do Servidor
Os logs aparecem no terminal onde você executou `npm run dev`.

### Logs do Cliente
Abra o DevTools do navegador (F12) e verifique:
- Console para erros JavaScript
- Network para requisições HTTP
- Application para cookies e localStorage

### Problemas Comuns

1. **Erro 404 no endpoint Google**
   - Verifique se o servidor está rodando
   - Verifique se as functions estão no diretório correto

2. **Erro de CORS**
   - Verifique se está acessando via `http://localhost:5000`
   - Verifique configuração do Google OAuth

3. **Erro de banco de dados**
   - Verifique se o banco está rodando
   - Verifique se as migrações foram aplicadas
   - Verifique a string de conexão

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