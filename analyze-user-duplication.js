// 🔍 ANÁLISE DE DUPLICAÇÃO POR USUÁRIO (TODOS OS USUÁRIOS)
// Script para analisar diferenças entre todos os usuários no feed

console.log('🔍 INICIANDO ANÁLISE DE DUPLICAÇÃO POR TODOS OS USUÁRIOS...');

// Função para interceptar logs e analisar
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

// Objeto dinâmico para armazenar dados de todos os usuários
const userData = {};

// Função para obter ou criar dados de um usuário
function getUserData(username) {
  if (!userData[username]) {
    userData[username] = {
      saves: [],
      duplicates: [],
      errors: [],
      timestamps: [],
      apiCalls: [],
      feedEntries: [],
      firstSeen: Date.now(),
      lastSeen: Date.now()
    };
  }
  userData[username].lastSeen = Date.now();
  return userData[username];
}

// Função para extrair nome de usuário de mensagens
function extractUsername(message) {
  // Padrões para extrair nomes de usuário
  const patterns = [
    /usuário:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/i,
    /user:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/i,
    /email:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/i,
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/i,
    /para usuário:\s*([a-zA-Z0-9._-]+)/i,
    /LOCK GLOBAL ATIVADO para usuário:\s*([a-zA-Z0-9._-]+)/i,
    /Usuário autenticado:\s*([a-zA-Z0-9._-]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

console.log = function(...args) {
  const message = args.join(' ');
  const timestamp = Date.now();
  
  // Extrair nome de usuário da mensagem
  const username = extractUsername(message);
  
  // Interceptar saves de localStorage
  if (message.includes('Map drop saved to localStorage') && username) {
    const user = getUserData(username);
    user.saves.push({
      timestamp: timestamp,
      message: message
    });
    user.timestamps.push(timestamp);
  }
  
  // Interceptar chamadas de API
  if ((message.includes('API CHAMADA') || message.includes('save-calculation')) && username) {
    const user = getUserData(username);
    user.apiCalls.push({
      timestamp: timestamp,
      message: message
    });
  }
  
  // Interceptar entradas no feed
  if ((message.includes('Run adicionada ao feed') || message.includes('feed da comunidade')) && username) {
    const user = getUserData(username);
    user.feedEntries.push({
      timestamp: timestamp,
      message: message
    });
  }
  
  // Interceptar locks globais
  if (message.includes('LOCK GLOBAL ATIVADO') && username) {
    const user = getUserData(username);
    user.lockActivations = user.lockActivations || [];
    user.lockActivations.push({
      timestamp: timestamp,
      message: message
    });
  }
  
  // Interceptar debounce
  if (message.includes('DUPLICAÇÃO PREVENIDA') && username) {
    const user = getUserData(username);
    user.duplicates.push({
      timestamp: timestamp,
      message: message
    });
  }
  
  // Interceptar sistema inteligente
  if (message.includes('sistema inteligente') && username) {
    const user = getUserData(username);
    user.smartSyncCalls = user.smartSyncCalls || [];
    user.smartSyncCalls.push({
      timestamp: timestamp,
      message: message
    });
  }
  
  originalLog.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ');
  const timestamp = Date.now();
  const username = extractUsername(message);
  
  if (message.includes('DUPLICAÇÃO') || message.includes('duplicada') || message.includes('duplicate')) {
    if (username) {
      const user = getUserData(username);
      user.duplicates.push({
        timestamp: timestamp,
        message: message
      });
    }
  }
  
  if (message.includes('WARNING') || message.includes('⚠️')) {
    if (username) {
      const user = getUserData(username);
      user.warnings = user.warnings || [];
      user.warnings.push({
        timestamp: timestamp,
        message: message
      });
    }
  }
  
  originalWarn.apply(console, args);
};

console.error = function(...args) {
  const message = args.join(' ');
  const timestamp = Date.now();
  const username = extractUsername(message);
  
  if (username) {
    const user = getUserData(username);
    user.errors.push({
      timestamp: timestamp,
      message: message
    });
  }
  
  originalError.apply(console, args);
};

// Função para analisar dados coletados
function analyzeUserData() {
  console.log('\n📊 ANÁLISE DE DADOS COLETADOS (TODOS OS USUÁRIOS):');
  console.log('==================================================');
  
  const users = Object.keys(userData);
  console.log(`\n👥 Total de usuários detectados: ${users.length}`);
  
  if (users.length === 0) {
    console.log('❌ Nenhum usuário detectado. Faça algumas runs primeiro.');
    return;
  }
  
  // Análise individual de cada usuário
  users.forEach(username => {
    const user = userData[username];
    console.log(`\n👤 ${username.toUpperCase()}:`);
    console.log(`- Total de saves: ${user.saves.length}`);
    console.log(`- Total de duplicações: ${user.duplicates.length}`);
    console.log(`- Total de erros: ${user.errors.length}`);
    console.log(`- Total de warnings: ${user.warnings ? user.warnings.length : 0}`);
    console.log(`- Chamadas de API: ${user.apiCalls.length}`);
    console.log(`- Entradas no feed: ${user.feedEntries.length}`);
    console.log(`- Locks ativados: ${user.lockActivations ? user.lockActivations.length : 0}`);
    console.log(`- Chamadas smart sync: ${user.smartSyncCalls ? user.smartSyncCalls.length : 0}`);
    
    // Calcular taxa de sucesso
    const totalAttempts = user.saves.length + user.duplicates.length;
    const successRate = totalAttempts > 0 ? (user.saves.length / totalAttempts * 100) : 0;
    console.log(`- Taxa de sucesso: ${successRate.toFixed(1)}%`);
    
    // Calcular intervalo médio entre saves
    if (user.timestamps.length > 1) {
      const intervals = [];
      for (let i = 1; i < user.timestamps.length; i++) {
        intervals.push(user.timestamps[i] - user.timestamps[i-1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      console.log(`- Intervalo médio entre saves: ${Math.round(avgInterval)}ms`);
    }
    
    // Tempo de atividade
    const activityTime = user.lastSeen - user.firstSeen;
    console.log(`- Tempo de atividade: ${Math.round(activityTime / 1000)}s`);
  });
  
  // Análise comparativa
  console.log('\n🔍 ANÁLISE COMPARATIVA:');
  const usersWithIssues = users.filter(username => {
    const user = userData[username];
    return user.duplicates.length > 0 || user.errors.length > 0;
  });
  
  console.log(`- Usuários com problemas: ${usersWithIssues.length}/${users.length}`);
  
  if (usersWithIssues.length > 0) {
    console.log('\n⚠️ USUÁRIOS COM PROBLEMAS:');
    usersWithIssues.forEach(username => {
      const user = userData[username];
      console.log(`\n🚨 ${username}:`);
      console.log(`  - Duplicações: ${user.duplicates.length}`);
      console.log(`  - Erros: ${user.errors.length}`);
      
      if (user.duplicates.length > 0) {
        console.log('  - Últimas duplicações:');
        user.duplicates.slice(-3).forEach((dup, index) => {
          console.log(`    ${index + 1}. ${new Date(dup.timestamp).toLocaleTimeString()}: ${dup.message.substring(0, 100)}...`);
        });
      }
    });
  }
  
  // Estatísticas gerais
  console.log('\n📈 ESTATÍSTICAS GERAIS:');
  const totalSaves = users.reduce((sum, username) => sum + userData[username].saves.length, 0);
  const totalDuplicates = users.reduce((sum, username) => sum + userData[username].duplicates.length, 0);
  const totalErrors = users.reduce((sum, username) => sum + userData[username].errors.length, 0);
  
  console.log(`- Total de saves: ${totalSaves}`);
  console.log(`- Total de duplicações: ${totalDuplicates}`);
  console.log(`- Total de erros: ${totalErrors}`);
  console.log(`- Taxa geral de duplicação: ${totalSaves > 0 ? (totalDuplicates / (totalSaves + totalDuplicates) * 100).toFixed(1) : 0}%`);
}

// Função para limpar dados
function clearAnalysisData() {
  Object.keys(userData).forEach(username => {
    delete userData[username];
  });
  console.log('🧹 Dados de análise limpos para todos os usuários');
}

// Função para obter dados de um usuário específico
function getUserAnalysis(username) {
  if (!userData[username]) {
    console.log(`❌ Usuário ${username} não encontrado nos dados coletados`);
    return;
  }
  
  const user = userData[username];
  console.log(`\n👤 ANÁLISE DETALHADA: ${username.toUpperCase()}`);
  console.log('=====================================');
  
  console.log(`📊 ESTATÍSTICAS:`);
  console.log(`- Saves: ${user.saves.length}`);
  console.log(`- Duplicações: ${user.duplicates.length}`);
  console.log(`- Erros: ${user.errors.length}`);
  console.log(`- Warnings: ${user.warnings ? user.warnings.length : 0}`);
  console.log(`- API Calls: ${user.apiCalls.length}`);
  console.log(`- Feed Entries: ${user.feedEntries.length}`);
  console.log(`- Lock Activations: ${user.lockActivations ? user.lockActivations.length : 0}`);
  console.log(`- Smart Sync Calls: ${user.smartSyncCalls ? user.smartSyncCalls.length : 0}`);
  
  if (user.duplicates.length > 0) {
    console.log(`\n⚠️ DUPLICAÇÕES DETALHADAS:`);
    user.duplicates.forEach((dup, index) => {
      console.log(`${index + 1}. ${new Date(dup.timestamp).toLocaleTimeString()}: ${dup.message}`);
    });
  }
  
  if (user.errors.length > 0) {
    console.log(`\n❌ ERROS DETALHADOS:`);
    user.errors.forEach((err, index) => {
      console.log(`${index + 1}. ${new Date(err.timestamp).toLocaleTimeString()}: ${err.message}`);
    });
  }
  
  if (user.warnings && user.warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS DETALHADOS:`);
    user.warnings.forEach((warn, index) => {
      console.log(`${index + 1}. ${new Date(warn.timestamp).toLocaleTimeString()}: ${warn.message}`);
    });
  }
}

// Função para listar todos os usuários
function listUsers() {
  const users = Object.keys(userData);
  console.log(`\n👥 USUÁRIOS DETECTADOS (${users.length}):`);
  users.forEach((username, index) => {
    const user = userData[username];
    const duplicates = user.duplicates.length;
    const errors = user.errors.length;
    const status = duplicates > 0 || errors > 0 ? '🚨' : '✅';
    console.log(`${index + 1}. ${status} ${username} (saves: ${user.saves.length}, duplicações: ${duplicates}, erros: ${errors})`);
  });
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
window.getUserAnalysis = getUserAnalysis;
window.listUsers = listUsers;

console.log('✅ SISTEMA DE ANÁLISE ATIVO PARA TODOS OS USUÁRIOS!');
console.log('📋 Comandos disponíveis:');
console.log('  - analyzeUserData() - Analisar dados de todos os usuários');
console.log('  - listUsers() - Listar todos os usuários detectados');
console.log('  - getUserAnalysis("username") - Análise detalhada de um usuário específico');
console.log('  - clearAnalysisData() - Limpar todos os dados');
console.log('  - exportAnalysisData() - Exportar dados para arquivo');
console.log('\n🔍 Agora faça algumas runs com diferentes usuários e depois execute:');
console.log('  1. listUsers() - para ver todos os usuários');
console.log('  2. analyzeUserData() - para análise geral');
console.log('  3. getUserAnalysis("rafaelrocha") - para análise específica do usuário com problemas');