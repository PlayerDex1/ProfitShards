// 🔍 DIAGNÓSTICO COMPLETO DO MINI HISTÓRICO
console.log('%c🚨 INICIANDO DIAGNÓSTICO COMPLETO', 'color: #FF6B6B; font-weight: bold; font-size: 16px;');

// 1. VERIFICAR LOCALSTORAGE
console.log('\n%c1️⃣ VERIFICANDO LOCALSTORAGE:', 'color: #4ECDC4; font-weight: bold;');
const historyKey = 'worldshards-map-drops';
const rawHistory = localStorage.getItem(historyKey);
console.log('📦 Raw localStorage:', rawHistory);

if (rawHistory) {
  try {
    const parsedHistory = JSON.parse(rawHistory);
    console.log('✅ Histórico parseado:', parsedHistory);
    console.log('📊 Total de runs:', parsedHistory.length);
    
    if (parsedHistory.length > 0) {
      console.log('🔍 Primeira run:', parsedHistory[0]);
      console.log('🔍 Última run:', parsedHistory[parsedHistory.length - 1]);
    }
  } catch (e) {
    console.log('❌ Erro ao parsear:', e);
  }
} else {
  console.log('❌ Nenhum histórico encontrado no localStorage');
}

// 2. VERIFICAR FUNÇÕES IMPORTADAS
console.log('\n%c2️⃣ VERIFICANDO FUNÇÕES:', 'color: #45B7D1; font-weight: bold;');

// Tentar acessar as funções do window (se estiverem expostas)
const funções = [
  'getMapDropsHistory',
  'getMapDropsHistoryGroupedByDay', 
  'appendMapDropEntry',
  'getDayStats'
];

funções.forEach(funcName => {
  if (window[funcName]) {
    console.log(`✅ ${funcName}: Disponível`);
  } else {
    console.log(`❌ ${funcName}: NÃO ENCONTRADA`);
  }
});

// 3. TESTAR FUNÇÃO DE AGRUPAMENTO MANUALMENTE
console.log('\n%c3️⃣ TESTANDO AGRUPAMENTO MANUAL:', 'color: #96CEB4; font-weight: bold;');

if (rawHistory) {
  try {
    const history = JSON.parse(rawHistory);
    const grouped = new Map();
    
    history.forEach((drop, index) => {
      console.log(`🔍 Processando drop ${index}:`, drop);
      
      if (!drop.timestamp) {
        console.log(`⚠️ Drop ${index} sem timestamp`);
        return;
      }
      
      const date = new Date(drop.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      console.log(`📅 Drop ${index} → ${dayKey}`);
      
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      
      grouped.get(dayKey).push(drop);
    });
    
    console.log('📊 Agrupamento resultado:', Array.from(grouped.entries()));
    
    // Testar renderização de cada grupo
    Array.from(grouped.entries()).forEach(([day, dayEntries]) => {
      console.log(`\n📅 DIA: ${day}`);
      dayEntries.forEach((run, i) => {
        console.log(`  🏃 Run ${i}:`, {
          level: run.level,
          tier: run.tier,
          charge: run.charge,
          mapSize: run.mapSize,
          tokensDropped: run.tokensDropped,
          timestamp: run.timestamp
        });
      });
    });
    
  } catch (e) {
    console.log('❌ Erro no agrupamento manual:', e);
  }
}

// 4. VERIFICAR ELEMENTOS DOM
console.log('\n%c4️⃣ VERIFICANDO DOM:', 'color: #F7DC6F; font-weight: bold;');

// Procurar elementos relacionados ao histórico
const elementos = [
  'div[class*="space-y-2"]', // Container das runs
  'div[class*="bg-slate-800"]', // Cards das runs
  'div:contains("LEVEL/TIER")', // Headers
];

elementos.forEach(selector => {
  const els = document.querySelectorAll(selector);
  console.log(`🔍 ${selector}: ${els.length} elementos encontrados`);
});

// 5. CRIAR RUN DE TESTE
console.log('\n%c5️⃣ CRIANDO RUN DE TESTE:', 'color: #BB8FCE; font-weight: bold;');

const testRun = {
  timestamp: Date.now(),
  mapSize: 'medium',
  tokensDropped: 999,
  loads: 5,
  totalLuck: 1500,
  status: 'positive',
  level: 'TEST_LEVEL',
  tier: 'TEST_TIER',
  charge: 999
};

console.log('🧪 Run de teste criada:', testRun);

// Tentar salvar a run de teste
try {
  const currentHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
  currentHistory.unshift(testRun);
  localStorage.setItem(historyKey, JSON.stringify(currentHistory));
  console.log('✅ Run de teste salva no localStorage');
  
  // Disparar evento para atualizar UI
  window.dispatchEvent(new Event('worldshards-history-updated'));
  console.log('✅ Evento de atualização disparado');
  
} catch (e) {
  console.log('❌ Erro ao salvar run de teste:', e);
}

// 6. RELATÓRIO FINAL
console.log('\n%c6️⃣ RELATÓRIO FINAL:', 'color: #FF6B6B; font-weight: bold;');
console.log('📋 Próximos passos baseados nos resultados acima:');
console.log('   1. Verifique se as funções estão disponíveis');
console.log('   2. Verifique se o agrupamento funciona');
console.log('   3. Verifique se a run de teste aparece na UI');
console.log('   4. Se nada funcionar, problema pode ser em arquivo deletado');

console.log('\n%c✅ DIAGNÓSTICO COMPLETO!', 'color: #2ECC71; font-weight: bold; font-size: 16px;');