// 🔍 MONITOR SIMPLES PARA SEU USUÁRIO
// Script para monitorar apenas o usuário holdboy

console.log('🔍 MONITOR SIMPLES ATIVO - Monitorando apenas holdboy...');

const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

const holdboyData = {
  saves: [],
  apiCalls: [],
  feedEntries: [],
  duplicates: [],
  errors: [],
  locks: [],
  timestamps: []
};

console.log = function(...args) {
  const message = args.join(' ');
  const timestamp = Date.now();
  
  // Interceptar apenas logs relacionados ao holdboy
  if (message.includes('holdboy')) {
    
    // Saves no localStorage
    if (message.includes('Map drop saved to localStorage')) {
      holdboyData.saves.push({ timestamp, message });
      holdboyData.timestamps.push(timestamp);
      console.log('📝 HOLDBOY SAVE DETECTADO:', new Date(timestamp).toLocaleTimeString());
    }
    
    // Chamadas de API
    if (message.includes('API CHAMADA') || message.includes('save-calculation')) {
      holdboyData.apiCalls.push({ timestamp, message });
      console.log('🌐 HOLDBOY API CALL:', new Date(timestamp).toLocaleTimeString());
    }
    
    // Entradas no feed
    if (message.includes('Run adicionada ao feed') || message.includes('feed da comunidade')) {
      holdboyData.feedEntries.push({ timestamp, message });
      console.log('📰 HOLDBOY FEED ENTRY:', new Date(timestamp).toLocaleTimeString());
    }
    
    // Locks globais
    if (message.includes('LOCK GLOBAL ATIVADO')) {
      holdboyData.locks.push({ timestamp, message });
      console.log('🔒 HOLDBOY LOCK ATIVADO:', new Date(timestamp).toLocaleTimeString());
    }
    
    // Duplicações
    if (message.includes('DUPLICAÇÃO PREVENIDA') || message.includes('duplicada')) {
      holdboyData.duplicates.push({ timestamp, message });
      console.log('⚠️ HOLDBOY DUPLICAÇÃO:', new Date(timestamp).toLocaleTimeString());
    }
  }
  
  originalLog.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ');
  const timestamp = Date.now();
  
  if (message.includes('holdboy') && (message.includes('DUPLICAÇÃO') || message.includes('duplicada'))) {
    holdboyData.duplicates.push({ timestamp, message });
    console.log('⚠️ HOLDBOY WARNING - DUPLICAÇÃO:', new Date(timestamp).toLocaleTimeString());
  }
  
  originalWarn.apply(console, args);
};

console.error = function(...args) {
  const message = args.join(' ');
  const timestamp = Date.now();
  
  if (message.includes('holdboy')) {
    holdboyData.errors.push({ timestamp, message });
    console.log('❌ HOLDBOY ERROR:', new Date(timestamp).toLocaleTimeString());
  }
  
  originalError.apply(console, args);
};

// Função para analisar dados do holdboy
function analyzeHoldboy() {
  console.log('\n📊 ANÁLISE DO HOLDBOY:');
  console.log('======================');
  
  console.log(`📝 Total de saves: ${holdboyData.saves.length}`);
  console.log(`🌐 Total de API calls: ${holdboyData.apiCalls.length}`);
  console.log(`📰 Total de feed entries: ${holdboyData.feedEntries.length}`);
  console.log(`🔒 Total de locks: ${holdboyData.locks.length}`);
  console.log(`⚠️ Total de duplicações: ${holdboyData.duplicates.length}`);
  console.log(`❌ Total de erros: ${holdboyData.errors.length}`);
  
  // Calcular intervalos entre saves
  if (holdboyData.timestamps.length > 1) {
    const intervals = [];
    for (let i = 1; i < holdboyData.timestamps.length; i++) {
      intervals.push(holdboyData.timestamps[i] - holdboyData.timestamps[i-1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    console.log(`⏱️ Intervalo médio entre saves: ${Math.round(avgInterval)}ms`);
    
    // Verificar se há saves muito próximos (possível duplicação)
    const closeSaves = intervals.filter(interval => interval < 5000); // Menos de 5 segundos
    if (closeSaves.length > 0) {
      console.log(`⚠️ ATENÇÃO: ${closeSaves.length} saves muito próximos (< 5s) - possível duplicação`);
    }
  }
  
  // Verificar se há mais API calls que saves (possível problema)
  if (holdboyData.apiCalls.length > holdboyData.saves.length) {
    console.log(`⚠️ ATENÇÃO: Mais API calls (${holdboyData.apiCalls.length}) que saves (${holdboyData.saves.length})`);
  }
  
  // Verificar se há mais feed entries que saves (possível duplicação)
  if (holdboyData.feedEntries.length > holdboyData.saves.length) {
    console.log(`⚠️ ATENÇÃO: Mais feed entries (${holdboyData.feedEntries.length}) que saves (${holdboyData.saves.length}) - DUPLICAÇÃO!`);
  }
  
  // Mostrar últimas atividades
  console.log('\n📋 ÚLTIMAS ATIVIDADES:');
  const allActivities = [
    ...holdboyData.saves.map(s => ({ ...s, type: 'SAVE' })),
    ...holdboyData.apiCalls.map(a => ({ ...a, type: 'API' })),
    ...holdboyData.feedEntries.map(f => ({ ...f, type: 'FEED' })),
    ...holdboyData.locks.map(l => ({ ...l, type: 'LOCK' })),
    ...holdboyData.duplicates.map(d => ({ ...d, type: 'DUPLICATE' })),
    ...holdboyData.errors.map(e => ({ ...e, type: 'ERROR' }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  
  allActivities.forEach((activity, index) => {
    const time = new Date(activity.timestamp).toLocaleTimeString();
    console.log(`${index + 1}. [${activity.type}] ${time}: ${activity.message.substring(0, 80)}...`);
  });
}

// Função para limpar dados
function clearHoldboyData() {
  holdboyData.saves = [];
  holdboyData.apiCalls = [];
  holdboyData.feedEntries = [];
  holdboyData.duplicates = [];
  holdboyData.errors = [];
  holdboyData.locks = [];
  holdboyData.timestamps = [];
  console.log('🧹 Dados do holdboy limpos');
}

// Função para verificar se há duplicação em tempo real
function checkForDuplication() {
  const now = Date.now();
  const recentSaves = holdboyData.saves.filter(save => now - save.timestamp < 30000); // Últimos 30 segundos
  
  if (recentSaves.length > 1) {
    console.log(`⚠️ ATENÇÃO: ${recentSaves.length} saves nos últimos 30 segundos - possível duplicação!`);
    recentSaves.forEach((save, index) => {
      console.log(`  ${index + 1}. ${new Date(save.timestamp).toLocaleTimeString()}`);
    });
  } else {
    console.log('✅ Nenhuma duplicação detectada nos últimos 30 segundos');
  }
}

// Expor funções globalmente
window.analyzeHoldboy = analyzeHoldboy;
window.clearHoldboyData = clearHoldboyData;
window.checkForDuplication = checkForDuplication;

console.log('✅ MONITOR SIMPLES ATIVO!');
console.log('📋 Comandos disponíveis:');
console.log('  - analyzeHoldboy() - Analisar dados do holdboy');
console.log('  - checkForDuplication() - Verificar duplicação em tempo real');
console.log('  - clearHoldboyData() - Limpar dados');
console.log('\n🔍 Agora faça algumas runs e depois execute analyzeHoldboy()');