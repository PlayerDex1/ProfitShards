# 🎮 CalculateShards - Calculadora de Lucro

Uma calculadora interativa e moderna para calcular custos, lucros e eficiência de equipamentos.

![Preview da Calculadora](https://via.placeholder.com/800x400/10B981/FFFFFF?text=CalculateShards)

## 🌟 Funcionalidades

### ✨ Interface Moderna
- **Modo Escuro/Claro** - Troca suave entre temas
- **Design Responsivo** - Funciona perfeitamente em todos os dispositivos
- **Interface Intuitiva** - Formulários fáceis de usar com validação em tempo real

### 📊 Cálculos Avançados
- **ROI Detalhado** - Retorno sobre investimento preciso
- **Análise de Eficiência** - Métricas de performance por carga
- **Distribuição de Tokens** - Visualização clara de equipamentos vs farming
- **Histórico Completo** - Salva automaticamente todos os cálculos

### 📈 Gráficos Interativos
- **Performance ao Longo do Tempo** - Acompanhe seu progresso
- **Distribuição Visual** - Gráficos de pizza para tokens
- **Métricas de Eficiência** - Dashboards informativos

## 🚀 Como Usar

### 1. **Configure seus Valores**
- Investimento inicial em USD
- Quantidade de gemas compradas e consumidas
- Tokens de equipamentos e farmados
- Preços atuais de tokens e gemas

### 2. **Veja os Resultados**
- Lucro líquido final calculado automaticamente
- Breakdown detalhado de todos os custos
- Métricas de ROI e eficiência

### 3. **Acompanhe o Histórico**
- Todos os cálculos são salvos automaticamente
- Visualize gráficos de performance
- Compare resultados ao longo do tempo

## 💾 Deploy no GitHub Pages

Quer colocar sua calculadora online gratuitamente? Siga o [Guia de Deploy](./DEPLOY.md) completo.

### Deploy Rápido (3 passos):
1. **Fork** este repositório no GitHub
2. Vá em **Settings** → **Pages** → **Source: GitHub Actions**
3. **Pronto!** Sua calculadora estará online em alguns minutos

## 🛠️ Tecnologias Utilizadas

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

## 🎨 Personalização

### Temas Disponíveis:
- **Tema Claro** - Interface limpa e profissional
- **Tema Escuro** - Reduz fadiga ocular em sessões longas
- **Detecção Automática** - Segue preferência do sistema

### Configurações Salvas:
- Preferência de tema
- Histórico de cálculos (até 50 entradas)
- Últimos valores utilizados

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

**Desenvolvido para a comunidade** 🎮✨
