// 🔍 ANÁLISE DE DUPLICAÇÃO POR USUÁRIO
// Script para analisar diferenças entre usuários no feed

console.log('🔍 INICIANDO ANÁLISE DE DUPLICAÇÃO POR USUÁRIO...');

// Função para interceptar logs e analisar
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

const userData = {
  holdboy: {
    saves: [],
    duplicates: [],
    errors: [],
    timestamps: []
  },
  rafaelrocha: {
    saves: [],
    duplicates: [],
    errors: [],
    timestamps: []
  }
};

console.log = function(...args) {
  const message = args.join(' ');
  
  // Interceptar saves do holdboy
  if (message.includes('holdboy') && message.includes('Map drop saved to localStorage')) {
    userData.holdboy.saves.push({
      timestamp: Date.now(),
      message: message
    });
    userData.holdboy.timestamps.push(Date.now());
  }
  
  // Interceptar saves do rafaelrocha
  if (message.includes('rafaelrocha') && message.includes('Map drop saved to localStorage')) {
    userData.rafaelrocha.saves.push({
      timestamp: Date.now(),
      message: message
    });
    userData.rafaelrocha.timestamps.push(Date.now());
  }
  
  // Interceptar duplicações
  if (message.includes('DUPLICAÇÃO PREVENIDA') || message.includes('duplicada')) {
    if (message.includes('holdboy')) {
      userData.holdboy.duplicates.push({
        timestamp: Date.now(),
        message: message
      });
    }
    if (message.includes('rafaelrocha')) {
      userData.rafaelrocha.duplicates.push({
        timestamp: Date.now(),
        message: message
      });
    }
  }
  
  // Interceptar erros
  if (message.includes('ERROR') || message.includes('❌')) {
    if (message.includes('holdboy')) {
      userData.holdboy.errors.push({
        timestamp: Date.now(),
        message: message
      });
    }
    if (message.includes('rafaelrocha')) {
      userData.rafaelrocha.errors.push({
        timestamp: Date.now(),
        message: message
      });
    }
  }
  
  originalLog.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ');
  
  if (message.includes('DUPLICAÇÃO') || message.includes('duplicada')) {
    if (message.includes('holdboy')) {
      userData.holdboy.duplicates.push({
        timestamp: Date.now(),
        message: message
      });
    }
    if (message.includes('rafaelrocha')) {
      userData.rafaelrocha.duplicates.push({
        timestamp: Date.now(),
        message: message
      });
    }
  }
  
  originalWarn.apply(console, args);
};

// Função para analisar dados coletados
function analyzeUserData() {
  console.log('\n📊 ANÁLISE DE DADOS COLETADOS:');
  console.log('================================');
  
  // Análise do holdboy
  console.log('\n👤 HOLDBOY:');
  console.log(`- Total de saves: ${userData.holdboy.saves.length}`);
  console.log(`- Total de duplicações detectadas: ${userData.holdboy.duplicates.length}`);
  console.log(`- Total de erros: ${userData.holdboy.errors.length}`);
  
  if (userData.holdboy.timestamps.length > 1) {
    const intervals = [];
    for (let i = 1; i < userData.holdboy.timestamps.length; i++) {
      intervals.push(userData.holdboy.timestamps[i] - userData.holdboy.timestamps[i-1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    console.log(`- Intervalo médio entre saves: ${Math.round(avgInterval)}ms`);
  }
  
  // Análise do rafaelrocha
  console.log('\n👤 RAFAELROCHA:');
  console.log(`- Total de saves: ${userData.rafaelrocha.saves.length}`);
  console.log(`- Total de duplicações detectadas: ${userData.rafaelrocha.duplicates.length}`);
  console.log(`- Total de erros: ${userData.rafaelrocha.errors.length}`);
  
  if (userData.rafaelrocha.timestamps.length > 1) {
    const intervals = [];
    for (let i = 1; i < userData.rafaelrocha.timestamps.length; i++) {
      intervals.push(userData.rafaelrocha.timestamps[i] - userData.rafaelrocha.timestamps[i-1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    console.log(`- Intervalo médio entre saves: ${Math.round(avgInterval)}ms`);
  }
  
  // Comparação
  console.log('\n🔍 COMPARAÇÃO:');
  const holdboySuccessRate = userData.holdboy.saves.length / (userData.holdboy.saves.length + userData.holdboy.duplicates.length) * 100;
  const rafaelrochaSuccessRate = userData.rafaelrocha.saves.length / (userData.rafaelrocha.saves.length + userData.rafaelrocha.duplicates.length) * 100;
  
  console.log(`- Holdboy taxa de sucesso: ${holdboySuccessRate.toFixed(1)}%`);
  console.log(`- Rafaelrocha taxa de sucesso: ${rafaelrochaSuccessRate.toFixed(1)}%`);
  
  // Detalhes das duplicações
  if (userData.rafaelrocha.duplicates.length > 0) {
    console.log('\n⚠️ DUPLICAÇÕES DO RAFAELROCHA:');
    userData.rafaelrocha.duplicates.forEach((dup, index) => {
      console.log(`${index + 1}. ${new Date(dup.timestamp).toLocaleTimeString()}: ${dup.message}`);
    });
  }
  
  // Detalhes dos erros
  if (userData.rafaelrocha.errors.length > 0) {
    console.log('\n❌ ERROS DO RAFAELROCHA:');
    userData.rafaelrocha.errors.forEach((err, index) => {
      console.log(`${index + 1}. ${new Date(err.timestamp).toLocaleTimeString()}: ${err.message}`);
    });
  }
}

// Função para limpar dados
function clearAnalysisData() {
  userData.holdboy = { saves: [], duplicates: [], errors: [], timestamps: [] };
  userData.rafaelrocha = { saves: [], duplicates: [], errors: [], timestamps: [] };
  console.log('🧹 Dados de análise limpos');
}

// Função para exportar dados
function exportAnalysisData() {
  const data = {
    timestamp: new Date().toISOString(),
    users: userData
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `user-duplication-analysis-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('📁 Dados exportados para download');
}

// Expor funções globalmente
window.analyzeUserData = analyzeUserData;
window.clearAnalysisData = clearAnalysisData;
window.exportAnalysisData = exportAnalysisData;

console.log('✅ SISTEMA DE ANÁLISE ATIVO!');
console.log('📋 Comandos disponíveis:');
console.log('  - analyzeUserData() - Analisar dados coletados');
console.log('  - clearAnalysisData() - Limpar dados');
console.log('  - exportAnalysisData() - Exportar dados');
console.log('\n🔍 Agora faça algumas runs com ambos os usuários e depois execute analyzeUserData()');