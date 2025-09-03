# 🎮 CalculateShards - Calculadora de Lucro

Uma calculadora interativa e moderna para calcular custos, lucros e eficiência de equipamentos **100% offline**.

![Preview da Calculadora](https://via.placeholder.com/800x400/10B981/FFFFFF?text=CalculateShards)

## 🌟 Funcionalidades

### 💻 **Aplicação Offline Completa**
- **100% Offline** - Funciona sem internet após carregamento
- **Dados Locais** - Tudo salvo no seu navegador com segurança
- **Sem Login Necessário** - Comece a usar imediatamente
- **Histórico Persistente** - Seus cálculos nunca se perdem

### ✨ Interface Moderna
- **Modo Escuro/Claro** - Troca suave entre temas
- **Design Responsivo** - Funciona perfeitamente em todos os dispositivos
- **Interface Intuitiva** - Formulários fáceis de usar com validação em tempo real

### 📊 Cálculos Avançados
- **ROI Detalhado** - Retorno sobre investimento preciso
- **Análise de Eficiência** - Métricas de performance por carga
- **Distribuição de Tokens** - Visualização clara de equipamentos vs farming
- **Histórico Completo** - Salva automaticamente todos os cálculos localmente

### 📈 Gráficos Interativos
- **Performance ao Longo do Tempo** - Acompanhe seu progresso
- **Distribuição Visual** - Gráficos de pizza para tokens
- **Métricas de Eficiência** - Dashboards informativos

## 🚀 Como Usar

### 1. **Acesse a Calculadora**
- **URL**: https://profitshards.pages.dev
- **Sem cadastro** - Comece a usar imediatamente
- **Offline** - Funciona sem internet após carregar

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
- Todos os cálculos são salvos automaticamente no navegador
- Visualize gráficos de performance
- Compare resultados ao longo do tempo

## ⚙️ Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 18+
- Navegador moderno

### 1. **Clone o Repositório**
```bash
git clone https://github.com/PlayerDex1/ProfitShards.git
cd ProfitShards
```

### 2. **Instale as Dependências**
```bash
npm install
```

### 3. **Inicie o Servidor de Desenvolvimento**
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5000`

## 💾 Deploy no Cloudflare Pages

### Deploy Automático (Já Configurado!)
- ✅ **GitHub Actions** configurado
- ✅ **Push para main** = deploy automático
- ✅ **URL**: https://profitshards.pages.dev
- ✅ **CDN Global** - Super rápido mundialmente

### Como Fazer Fork e Deploy:
1. **Fork** este repositório no GitHub
2. **Conecte** no Cloudflare Pages
3. **Selecione** seu fork
4. **Deploy** automático - Pronto!

### Configuração Cloudflare Pages:
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist/public`
- **Node Version**: `18.x`

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Interface moderna e reativa
- **TypeScript** - Tipagem forte para maior confiabilidade
- **Tailwind CSS** - Design system consistente
- **Recharts** - Gráficos interativos e responsivos
- **Radix UI** - Componentes acessíveis de alta qualidade
- **Vite** - Build rápido e otimizado

### Armazenamento
- **LocalStorage** - Dados salvos no navegador
- **IndexedDB** - Histórico e dados complexos
- **Service Workers** - Cache offline inteligente

## ⚡ Performance

### Otimizações Implementadas:
- **Code Splitting** - Carregamento sob demanda
- **Memoização** - Evita recálculos desnecessários
- **Debounce** - Reduz cálculos em tempo real
- **Minificação** - Código otimizado para produção
- **Lazy Loading** - Componentes carregados conforme necessário
- **PWA Ready** - Instalável como app nativo

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

## 🔒 Privacidade e Segurança

- **Dados Locais** - Nada é enviado para servidores
- **Sem Tracking** - Zero cookies de rastreamento
- **Código Aberto** - Totalmente auditável
- **HTTPS** - Comunicação criptografada
- **Offline First** - Funciona sem internet

## 🎨 Personalização

### Temas Disponíveis:
- **Tema Claro** - Interface limpa e profissional
- **Tema Escuro** - Reduz fadiga ocular em sessões longas
- **Detecção Automática** - Segue preferência do sistema

### Dados Salvos Localmente:
- Preferência de tema
- Histórico de cálculos (ilimitado)
- Configurações personalizadas
- Últimos valores utilizados

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estas etapas:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🌐 Links Úteis

- **🎮 Aplicação**: https://profitshards.pages.dev
- **📊 Status**: https://github.com/PlayerDex1/ProfitShards/actions
- **🐛 Issues**: https://github.com/PlayerDex1/ProfitShards/issues
- **📖 Wiki**: https://github.com/PlayerDex1/ProfitShards/wiki

---

**Desenvolvido para a comunidade com ❤️** 🎮✨

**Acesse agora**: https://profitshards.pages.dev
# Wed Sep  3 12:53:07 PM UTC 2025
