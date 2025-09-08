// 🔍 DEBUG: Monitor de Duplicação - ProfitShards
// Cole este código no console do navegador (F12)

console.log('🚀 Iniciando monitor de duplicação...');

// Armazenar logs anteriores
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

// Arrays para rastrear chamadas
const apiCalls = [];
const localStorageCalls = [];
const feedEntries = [];

// Interceptar logs do console
console.log = function(...args) {
  const message = args.join(' ');
  
  // Rastrear chamadas de API
  if (message.includes('📥 [') && message.includes('Recebido cálculo para salvar')) {
    const callId = message.match(/\[([^\]]+)\]/)?.[1];
    const data = args.find(arg => typeof arg === 'object');
    apiCalls.push({
      id: callId,
      timestamp: Date.now(),
      data: data,
      message: message
    });
    console.log('🔍 API CALL DETECTED:', { id: callId, data });
  }
  
  // Rastrear salvamentos no localStorage
  if (message.includes('Map drop saved to localStorage')) {
    const data = args.find(arg => typeof arg === 'object');
    localStorageCalls.push({
      timestamp: Date.now(),
      data: data,
      message: message
    });
    console.log('💾 LOCALSTORAGE SAVE DETECTED:', data);
  }
  
  // Rastrear inserções no feed
  if (message.includes('Run adicionada ao feed da comunidade')) {
    const data = args.find(arg => typeof arg === 'object');
    feedEntries.push({
      timestamp: Date.now(),
      data: data,
      message: message
    });
    console.log('🔥 FEED ENTRY DETECTED:', data);
  }
  
  // Chamar log original
  originalLog.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ');
  
  // Rastrear duplicações
  if (message.includes('DUPLICAÇÃO DETECTADA')) {
    const data = args.find(arg => typeof arg === 'object');
    console.log('⚠️ DUPLICATION DETECTED:', data);
  }
  
  // Chamar warn original
  originalWarn.apply(console, args);
};

// Função para analisar duplicações
function analyzeDuplications() {
  console.log('\n📊 ANÁLISE DE DUPLICAÇÕES:');
  console.log('========================');
  
  // Analisar chamadas de API
  console.log(`\n🔍 API Calls: ${apiCalls.length}`);
  apiCalls.forEach((call, index) => {
    console.log(`${index + 1}. ID: ${call.id}, Time: ${new Date(call.timestamp).toLocaleTimeString()}`);
    if (call.data?.dataPreview) {
      console.log(`   Data: ${call.data.dataPreview.mapSize} - ${call.data.dataPreview.tokensDropped} tokens`);
    }
  });
  
  // Analisar localStorage
  console.log(`\n💾 LocalStorage Saves: ${localStorageCalls.length}`);
  localStorageCalls.forEach((save, index) => {
    console.log(`${index + 1}. Time: ${new Date(save.timestamp).toLocaleTimeString()}`);
    if (save.data) {
      console.log(`   Data: ${save.data.mapSize} - ${save.data.tokensDropped} tokens`);
    }
  });
  
  // Analisar feed entries
  console.log(`\n🔥 Feed Entries: ${feedEntries.length}`);
  feedEntries.forEach((entry, index) => {
    console.log(`${index + 1}. Time: ${new Date(entry.timestamp).toLocaleTimeString()}`);
    if (entry.data) {
      console.log(`   Data: ${entry.data.map} - ${entry.data.tokens} tokens - ${entry.data.playerName}`);
    }
  });
  
  // Detectar duplicações
  console.log('\n🔍 DETECÇÃO DE DUPLICAÇÕES:');
  
  // Verificar duplicações no localStorage
  const localStorageDuplicates = [];
  for (let i = 0; i < localStorageCalls.length; i++) {
    for (let j = i + 1; j < localStorageCalls.length; j++) {
      const call1 = localStorageCalls[i];
      const call2 = localStorageCalls[j];
      if (call1.data && call2.data && 
          call1.data.mapSize === call2.data.mapSize &&
          call1.data.tokensDropped === call2.data.tokensDropped &&
          Math.abs(call1.timestamp - call2.timestamp) < 5000) { // 5 segundos
        localStorageDuplicates.push({ call1, call2 });
      }
    }
  }
  
  if (localStorageDuplicates.length > 0) {
    console.log('⚠️ DUPLICAÇÕES NO LOCALSTORAGE:', localStorageDuplicates);
  } else {
    console.log('✅ Nenhuma duplicação no localStorage detectada');
  }
  
  // Verificar duplicações no feed
  const feedDuplicates = [];
  for (let i = 0; i < feedEntries.length; i++) {
    for (let j = i + 1; j < feedEntries.length; j++) {
      const entry1 = feedEntries[i];
      const entry2 = feedEntries[j];
      if (entry1.data && entry2.data && 
          entry1.data.map === entry2.data.map &&
          entry1.data.tokens === entry2.data.tokens &&
          entry1.data.playerName === entry2.data.playerName &&
          Math.abs(entry1.timestamp - entry2.timestamp) < 10000) { // 10 segundos
        feedDuplicates.push({ entry1, entry2 });
      }
    }
  }
  
  if (feedDuplicates.length > 0) {
    console.log('⚠️ DUPLICAÇÕES NO FEED:', feedDuplicates);
  } else {
    console.log('✅ Nenhuma duplicação no feed detectada');
  }
  
  // Verificar se localStorage e feed estão sincronizados
  console.log('\n🔄 SINCRONIZAÇÃO LOCALSTORAGE vs FEED:');
  if (localStorageCalls.length !== feedEntries.length) {
    console.log(`⚠️ DESBALANÇO: ${localStorageCalls.length} localStorage vs ${feedEntries.length} feed entries`);
  } else {
    console.log('✅ LocalStorage e Feed sincronizados');
  }
}

// Função para limpar dados
function clearDebugData() {
  apiCalls.length = 0;
  localStorageCalls.length = 0;
  feedEntries.length = 0;
  console.log('🧹 Dados de debug limpos');
}

// Função para monitorar em tempo real
function startRealTimeMonitoring() {
  console.log('👁️ Monitoramento em tempo real iniciado...');
  
  setInterval(() => {
    if (apiCalls.length > 0 || localStorageCalls.length > 0 || feedEntries.length > 0) {
      console.log(`\n📊 STATUS: ${apiCalls.length} API calls, ${localStorageCalls.length} localStorage, ${feedEntries.length} feed entries`);
    }
  }, 5000);
}

// Expor funções globalmente
window.debugDuplication = {
  analyze: analyzeDuplications,
  clear: clearDebugData,
  startMonitoring: startRealTimeMonitoring,
  getData: () => ({
    apiCalls,
    localStorageCalls,
    feedEntries
  })
};

console.log('✅ Monitor de duplicação instalado!');
console.log('📋 Comandos disponíveis:');
console.log('  debugDuplication.analyze() - Analisar duplicações');
console.log('  debugDuplication.clear() - Limpar dados');
console.log('  debugDuplication.startMonitoring() - Iniciar monitoramento em tempo real');
console.log('  debugDuplication.getData() - Ver dados coletados');

// Iniciar monitoramento automaticamente
startRealTimeMonitoring();