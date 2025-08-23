# 🎮 WorldShards Game - Knowledge Base

## 📊 Sistema de Luck
- **Regra Principal**: Quanto maior o luck, maior será o drop de tokens
- **Correlação**: Luck é diretamente proporcional aos tokens farmados
- **Aprendizado**: O sistema aprende os padrões através das métricas coletadas dos usuários

## ⚡ Sistema de Cargas por Mapa

### 🗺️ Consumo de Cargas:
- **Small**: 1 carga por equipamento (4 equipamentos = 4 cargas totais)
- **Medium**: 2 cargas por equipamento (4 equipamentos = 8 cargas totais)  
- **Large**: 4 cargas por equipamento (4 equipamentos = 16 cargas totais)
- **XLarge**: 6 cargas por equipamento (4 equipamentos = 24 cargas totais)

### 💰 Lógica Risk vs Reward:
- **Mais cargas = Mais tokens** (proporcionalmente ao luck)
- **XLarge** consome mais energia mas farma significativamente mais
- **Small** é econômico mas com menor retorno
- **Estratégia**: Balance entre custo de cargas e retorno baseado no luck

## 📈 Padrões Esperados (baseado na lógica do jogo):

### 🎯 Eficiência por Mapa:
- **Small**: Baixo risco, baixo retorno, boa para luck baixo
- **Medium**: Equilibrado, boa para luck médio (50-100)
- **Large**: Alto retorno, requer luck médio-alto (100-150)
- **XLarge**: Máximo retorno, requer luck alto (150+)

### 📊 Métricas Importantes:
- **Tokens/Carga**: Métrica principal de eficiência
- **ROI por Luck**: Retorno do investimento baseado no luck
- **Custo-Benefício**: Relação entre cargas gastas e tokens obtidos

## 🔍 Insights para o Sistema de Métricas:

### 📋 Dados Coletados:
- Mapa escolhido (small/medium/large/xlarge)
- Luck aplicado na run
- Tokens dropados
- Cargas consumidas (calculado automaticamente)
- Eficiência (tokens/carga)

### 🧮 Cálculos Automáticos:
```javascript
// Cargas por mapa
const cargas = {
  small: 4,    // 1 × 4 equipamentos
  medium: 8,   // 2 × 4 equipamentos  
  large: 16,   // 4 × 4 equipamentos
  xlarge: 24   // 6 × 4 equipamentos
};

// Eficiência principal
const eficiencia = tokensDropados / cargasConsumidas;

// ROI baseado em luck
const roiLuck = tokensDropados / luck;
```

## 🎮 Estratégias de Gameplay:

### 🟢 Luck Baixo (0-50):
- **Recomendado**: Small/Medium maps
- **Razão**: Menor risco, cargas mais baratas
- **Eficiência esperada**: 0.5-1.5 tokens/carga

### 🟡 Luck Médio (50-100):
- **Recomendado**: Medium/Large maps
- **Razão**: Balance ideal entre custo e retorno
- **Eficiência esperada**: 1.5-3.0 tokens/carga

### 🟠 Luck Alto (100-150):
- **Recomendado**: Large/XLarge maps
- **Razão**: Luck suficiente para justificar o custo alto
- **Eficiência esperada**: 3.0-5.0 tokens/carga

### 🔴 Luck Muito Alto (150+):
- **Recomendado**: XLarge maps
- **Razão**: Máximo aproveitamento do luck alto
- **Eficiência esperada**: 5.0+ tokens/carga

## 🔮 Previsões e Análises:

### 📊 Padrões Esperados nos Dados:
1. **Correlação Luck×Tokens**: Linear positiva
2. **Eficiência por Mapa**: XLarge > Large > Medium > Small (com luck adequado)
3. **Distribuição de Usuários**: Maioria em Medium/Large maps
4. **Sweet Spots**: Luck 75-125 com Large maps

### 🎯 KPIs Principais:
- **Tokens/Carga Global**: Métrica de eficiência geral
- **Distribuição de Mapas**: Popularidade por tipo
- **Correlação Luck×Eficiência**: Validação do sistema
- **ROI por Faixa de Luck**: Otimização de estratégias

## 🛠️ Implementação Técnica:

### 📝 Dados Fake Realistas:
```javascript
// Baseado na lógica do jogo
const dadosRealistas = {
  // Small: Luck baixo, eficiência baixa mas estável
  small: { avgLuck: 45, avgTokens: 6, efficiency: 1.5 },
  
  // Medium: Luck médio, boa eficiência
  medium: { avgLuck: 75, avgTokens: 14, efficiency: 1.75 },
  
  // Large: Luck médio-alto, alta eficiência  
  large: { avgLuck: 110, avgTokens: 35, efficiency: 2.2 },
  
  // XLarge: Luck alto, máxima eficiência
  xlarge: { avgLuck: 160, avgTokens: 72, efficiency: 3.0 }
};
```

## 📚 Histórico de Aprendizado:

### 🗓️ Conhecimento Adquirido:
- **2024-01**: Sistema básico de luck e drops
- **2024-01**: Mecânica de cargas por mapa
- **2024-01**: Correlação risk×reward
- **2024-01**: Estratégias por faixa de luck

### 🔄 Próximas Descobertas:
- Padrões reais de uso dos jogadores
- Otimizações de estratégia
- Novos insights baseados em dados reais
- Balanceamento do jogo

---

**📌 Nota**: Esta base de conhecimento será atualizada conforme novos insights forem descobertos através das métricas coletadas dos jogadores reais.