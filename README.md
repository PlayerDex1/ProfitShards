# 🎮 CalculateShards - Calculadora de Lucro

Uma calculadora interativa e moderna para calcular custos, lucros e eficiência de equipamentos com **autenticação Google** integrada.

![Preview da Calculadora](https://via.placeholder.com/800x400/10B981/FFFFFF?text=CalculateShards)

## 🌟 Funcionalidades

### 🔐 **Autenticação Segura**
- **Login com Google** - Entre com sua conta Google de forma segura
- **Dados na Nuvem** - Seus cálculos são salvos automaticamente
- **Sessões Persistentes** - Mantenha-se logado por 7 dias
- **Migração de Dados** - Dados locais são migrados para sua conta

### ✨ Interface Moderna
- **Modo Escuro/Claro** - Troca suave entre temas
- **Design Responsivo** - Funciona perfeitamente em todos os dispositivos
- **Interface Intuitiva** - Formulários fáceis de usar com validação em tempo real

### 📊 Cálculos Avançados
- **ROI Detalhado** - Retorno sobre investimento preciso
- **Análise de Eficiência** - Métricas de performance por carga
- **Distribuição de Tokens** - Visualização clara de equipamentos vs farming
- **Histórico Completo** - Salva automaticamente todos os cálculos na nuvem

### 📈 Gráficos Interativos
- **Performance ao Longo do Tempo** - Acompanhe seu progresso
- **Distribuição Visual** - Gráficos de pizza para tokens
- **Métricas de Eficiência** - Dashboards informativos

## 🚀 Como Usar

### 1. **Faça Login**
- Clique em "Entrar" no canto superior direito
- Escolha "Continuar com Google"
- Autorize o acesso à sua conta Google

### 2. **Configure seus Valores**
- Investimento inicial em USD
- Quantidade de gemas compradas e consumidas
- Tokens de equipamentos e farmados
- Preços atuais de tokens e gemas

### 3. **Veja os Resultados**
- Lucro líquido final calculado automaticamente
- Breakdown detalhado de todos os custos
- Métricas de ROI e eficiência

### 4. **Acompanhe o Histórico**
- Todos os cálculos são salvos automaticamente na nuvem
- Visualize gráficos de performance
- Compare resultados ao longo do tempo

## ⚙️ Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta no Google Cloud Console

### 1. **Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/worldshards-calculator.git
cd worldshards-calculator
```

### 2. **Instale as Dependências**
```bash
npm install
```

### 3. **Configure o Google OAuth**

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google+ API" ou "Google Identity"
4. Vá em **Credenciais** → **Criar Credenciais** → **ID do Cliente OAuth 2.0**
5. Configure:
   - **Tipo de aplicativo**: Aplicativo da Web
   - **URIs de redirecionamento autorizados**: 
     - `http://localhost:5000/api/auth/google/callback` (desenvolvimento)
     - `https://seudominio.com/api/auth/google/callback` (produção)

### 4. **Configure as Variáveis de Ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/worldshards_db
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
SESSION_SECRET=sua-chave-secreta-super-segura
NODE_ENV=development
```

### 5. **Configure o Banco de Dados**
```bash
# Execute as migrações
npm run db:push
```

### 6. **Inicie o Servidor de Desenvolvimento**
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5000`

## 💾 Deploy

### Variáveis de Ambiente Necessárias

Para deploy em produção, configure as seguintes variáveis:

#### **Vercel/Netlify**
- `DATABASE_URL` - URL de conexão PostgreSQL
- `GOOGLE_CLIENT_ID` - Client ID do Google OAuth
- `GOOGLE_CLIENT_SECRET` - Client Secret do Google OAuth  
- `SESSION_SECRET` - Chave secreta para sessões
- `NODE_ENV=production`

#### **Cloudflare Pages**
- `DATABASE_URL` - URL de conexão PostgreSQL
- `GOOGLE_CLIENT_ID` - Client ID do Google OAuth
- `GOOGLE_CLIENT_SECRET` - Client Secret do Google OAuth
- `SESSION_SECRET` - Chave secreta para sessões

### Deploy Rápido (3 passos):
1. **Fork** este repositório no GitHub
2. **Configure** as variáveis de ambiente na sua plataforma de deploy
3. **Deploy** - Sua calculadora estará online em alguns minutos

Consulte o [Guia de Deploy](./DEPLOY.md) completo para instruções detalhadas.

## 🛠️ Tecnologias Utilizadas

### Backend
- **Express.js** - Servidor HTTP rápido e minimalista
- **Passport.js** - Autenticação OAuth com Google
- **Drizzle ORM** - ORM TypeScript type-safe
- **PostgreSQL** - Banco de dados relacional

### Frontend
- **React 18** - Interface moderna e reativa
- **TypeScript** - Tipagem forte para maior confiabilidade
- **Tailwind CSS** - Design system consistente
- **Recharts** - Gráficos interativos e responsivos
- **Radix UI** - Componentes acessíveis de alta qualidade
- **Vite** - Build rápido e otimizado

## ⚡ Performance

### Otimizações Implementadas:
- **Code Splitting** - Carregamento sob demanda
- **Memoização** - Evita recálculos desnecessários
- **Debounce** - Reduz cálculos em tempo real
- **Minificação** - Código otimizado para produção
- **Lazy Loading** - Componentes carregados conforme necessário
- **Session Management** - Sessões otimizadas com PostgreSQL

## 🎯 Como Funciona

### Cálculo de Lucro Líquido:
```
Tokens Totais = Tokens Equipamentos + Tokens Farmados
Valor Total = Tokens Totais × Preço do Token
Custo das Gemas = Gemas Consumidas × Preço da Gema
Lucro Bruto = Valor Total - Custo das Gemas
Custo Recompra = Gemas Consumidas × Preço da Gema
Lucro Líquido = Lucro Bruto - Custo Recompra
ROI = (Lucro Líquido / Investimento) × 100
```

### Métricas de Eficiência:
- **Eficiência Farm**: Tokens Farmados ÷ Cargas Utilizadas
- **ROI**: Retorno percentual sobre investimento
- **Payback**: Tempo estimado para recuperar investimento

## 🔒 Segurança

- **OAuth 2.0** - Autenticação segura com Google
- **HTTPS Obrigatório** - Todas as comunicações criptografadas
- **Sessões Seguras** - Cookies HttpOnly e SameSite
- **Validação de Dados** - Todas as entradas são validadas
- **Proteção CSRF** - Tokens de segurança em formulários

## 🎨 Personalização

### Temas Disponíveis:
- **Tema Claro** - Interface limpa e profissional
- **Tema Escuro** - Reduz fadiga ocular em sessões longas
- **Detecção Automática** - Segue preferência do sistema

### Configurações Salvas:
- Preferência de tema (local)
- Histórico de cálculos (nuvem)
- Dados de usuário (nuvem)
- Últimos valores utilizados (nuvem)

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estas etapas:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido para a comunidade com ❤️** 🎮✨
