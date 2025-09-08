// 📰 MONITOR DO FEED EM TEMPO REAL
// Script para monitorar duplicações no feed da comunidade

console.log('📰 MONITOR DO FEED ATIVO - Detectando duplicações em tempo real...');

const feedData = {
  runs: [],
  duplicates: [],
  users: new Set()
};

// Função para monitorar o feed
async function monitorFeed() {
  try {
    const response = await fetch('/api/feed/activity-stream');
    const data = await response.json();
    
    if (data.success && data.runs) {
      // Analisar novas runs
      data.runs.forEach(run => {
        const existingRun = feedData.runs.find(r => 
          r.id === run.id || 
          (r.playerName === run.playerName && 
           r.map === run.map && 
           r.tokens === run.tokens && 
           Math.abs(r.timestamp - run.timestamp) < 60000) // 1 minuto
        );
        
        if (existingRun) {
          // Duplicação detectada
          const duplicate = {
            timestamp: Date.now(),
            originalRun: existingRun,
            duplicateRun: run,
            user: run.playerName,
            map: run.map,
            tokens: run.tokens
          };
          
          feedData.duplicates.push(duplicate);
          console.log(`🚨 DUPLICAÇÃO DETECTADA: ${run.playerName} - ${run.map} - ${run.tokens} tokens`);
          console.log(`   Original: ${new Date(existingRun.timestamp).toLocaleTimeString()}`);
          console.log(`   Duplicata: ${new Date(run.timestamp).toLocaleTimeString()}`);
        } else {
          // Nova run
          feedData.runs.push(run);
          feedData.users.add(run.playerName);
        }
      });
      
      // Manter apenas as últimas 100 runs
      if (feedData.runs.length > 100) {
        feedData.runs = feedData.runs.slice(-100);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao monitorar feed:', error);
  }
}

// Função para analisar duplicações
function analyzeDuplications() {
  console.log('\n📊 ANÁLISE DE DUPLICAÇÕES NO FEED:');
  console.log('===================================');
  
  console.log(`👥 Total de usuários únicos: ${feedData.users.size}`);
  console.log(`📝 Total de runs: ${feedData.runs.length}`);
  console.log(`🚨 Total de duplicações: ${feedData.duplicates.length}`);
  
  if (feedData.duplicates.length > 0) {
    console.log('\n⚠️ DUPLICAÇÕES DETECTADAS:');
    
    // Agrupar por usuário
    const duplicatesByUser = {};
    feedData.duplicates.forEach(dup => {
      if (!duplicatesByUser[dup.user]) {
        duplicatesByUser[dup.user] = [];
      }
      duplicatesByUser[dup.user].push(dup);
    });
    
    Object.entries(duplicatesByUser).forEach(([user, dups]) => {
      console.log(`\n👤 ${user}: ${dups.length} duplicações`);
      dups.forEach((dup, index) => {
        const timeDiff = Math.abs(dup.duplicateRun.timestamp - dup.originalRun.timestamp);
        console.log(`  ${index + 1}. ${dup.map} - ${dup.tokens} tokens (${timeDiff}ms de diferença)`);
      });
    });
    
    // Identificar usuários com mais duplicações
    const userDuplicationCount = Object.entries(duplicatesByUser)
      .map(([user, dups]) => ({ user, count: dups.length }))
      .sort((a, b) => b.count - a.count);
    
    console.log('\n🏆 RANKING DE DUPLICAÇÕES:');
    userDuplicationCount.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.user}: ${entry.count} duplicações`);
    });
  } else {
    console.log('✅ Nenhuma duplicação detectada!');
  }
}

// Função para listar usuários ativos
function listActiveUsers() {
  console.log('\n👥 USUÁRIOS ATIVOS NO FEED:');
  console.log('============================');
  
  const users = Array.from(feedData.users);
  users.forEach((user, index) => {
    const userRuns = feedData.runs.filter(run => run.playerName === user);
    const userDuplicates = feedData.duplicates.filter(dup => dup.user === user);
    const status = userDuplicates.length > 0 ? '🚨' : '✅';
    
    console.log(`${index + 1}. ${status} ${user} (${userRuns.length} runs, ${userDuplicates.length} duplicações)`);
  });
}

// Função para limpar dados
function clearFeedData() {
  feedData.runs = [];
  feedData.duplicates = [];
  feedData.users.clear();
  console.log('🧹 Dados do feed limpos');
}

// Função para exportar dados
function exportFeedData() {
  const data = {
    timestamp: new Date().toISOString(),
    totalRuns: feedData.runs.length,
    totalDuplicates: feedData.duplicates.length,
    totalUsers: feedData.users.size,
    runs: feedData.runs,
    duplicates: feedData.duplicates,
    users: Array.from(feedData.users)
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `feed-analysis-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('📁 Dados do feed exportados');
}

// Iniciar monitoramento automático
let monitorInterval;
function startMonitoring() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
  }
  
  monitorInterval = setInterval(monitorFeed, 10000); // A cada 10 segundos
  console.log('🔄 Monitoramento automático iniciado (a cada 10 segundos)');
}

function stopMonitoring() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log('⏹️ Monitoramento automático parado');
  }
}

// Expor funções globalmente
window.monitorFeed = monitorFeed;
window.analyzeDuplications = analyzeDuplications;
window.listActiveUsers = listActiveUsers;
window.clearFeedData = clearFeedData;
window.exportFeedData = exportFeedData;
window.startMonitoring = startMonitoring;
window.stopMonitoring = stopMonitoring;

console.log('✅ MONITOR DO FEED ATIVO!');
console.log('📋 Comandos disponíveis:');
console.log('  - monitorFeed() - Verificar feed manualmente');
console.log('  - startMonitoring() - Iniciar monitoramento automático');
console.log('  - stopMonitoring() - Parar monitoramento automático');
console.log('  - analyzeDuplications() - Analisar duplicações detectadas');
console.log('  - listActiveUsers() - Listar usuários ativos');
console.log('  - clearFeedData() - Limpar dados');
console.log('  - exportFeedData() - Exportar dados');
console.log('\n🔍 Execute startMonitoring() para começar a monitorar automaticamente');