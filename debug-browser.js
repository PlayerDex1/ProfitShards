// 🔍 SCRIPT DE DEBUG PARA EXECUTAR NO BROWSER
// Cole isso no console do browser em profitshards.pages.dev

console.log('🔍 INICIANDO DEBUG DO FEED...\n');

// 1. Verificar autenticação
console.log('1. 🔐 Verificando autenticação...');
const hasSession = document.cookie.includes('ps_session');
console.log(`   Cookie de sessão: ${hasSession ? '✅ Presente' : '❌ Ausente'}`);

// 2. Testar API do feed
console.log('\n2. 📊 Testando API do feed...');
fetch('/api/feed/activity-stream')
  .then(r => r.json())
  .then(data => {
    console.log(`   Status: ✅ Funcionando`);
    console.log(`   Runs: ${data.runs?.length || 0}`);
    console.log(`   Cache: ${data.cached ? 'Ativo' : 'Fresh'}`);
    console.log(`   Dados:`, data.runs?.slice(0, 1));
  })
  .catch(err => console.log(`   Status: ❌ Erro - ${err.message}`));

// 3. Testar API de save (deve dar 401 se não logado, ou 400 se logado)
console.log('\n3. 💾 Testando API de save...');
fetch('/api/admin/save-map-run', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mapSize: 'medium',
    luck: 1500,
    loads: 8, 
    tokensDropped: 200,
    timestamp: Date.now()
  })
})
.then(r => r.json())
.then(data => {
  console.log(`   Status save: ${data.success ? '✅ Sucesso' : '⚠️ ' + data.error}`);
  if (data.error === 'Unauthorized') {
    console.log(`   ❌ Não está logado corretamente`);
  } else if (data.error === 'Invalid session') {
    console.log(`   ❌ Sessão expirada`);
  } else if (data.success) {
    console.log(`   ✅ Dados salvos! ID: ${data.data?.id}`);
  }
})
.catch(err => console.log(`   Erro: ${err.message}`));

// 4. Verificar localStorage
console.log('\n4. 💾 Verificando dados locais...');
console.log(`   MapPlanner history: ${localStorage.getItem('mapdrops-history')?.length || 0} chars`);
console.log(`   Calculator history: ${localStorage.getItem('worldshards-history')?.length || 0} chars`);

// 5. Monitoras mudanças no feed por 60 segundos
console.log('\n5. 🔄 Monitorando feed por 60 segundos...');
let checks = 0;
let lastCount = 0;

const monitor = setInterval(async () => {
  checks++;
  try {
    const response = await fetch('/api/feed/activity-stream');
    const data = await response.json();
    const currentCount = data.runs?.length || 0;
    
    if (currentCount !== lastCount) {
      console.log(`   🚨 MUDANÇA! ${lastCount} → ${currentCount} runs`);
      if (currentCount > lastCount) {
        console.log(`   ✅ Nova run detectada:`, data.runs[0]);
      }
      lastCount = currentCount;
    } else {
      console.log(`   ⏱️ Check ${checks}: ${currentCount} runs (sem mudanças)`);
    }
  } catch (error) {
    console.log(`   ❌ Erro no check ${checks}: ${error.message}`);
  }
  
  if (checks >= 12) { // 60s / 5s = 12 checks
    clearInterval(monitor);
    console.log('\n📋 MONITORAMENTO FINALIZADO');
  }
}, 5000);

console.log('\n🎯 INSTRUÇÕES:');
console.log('1. Se não está logado: faça login primeiro');
console.log('2. Vá para aba Planejador');
console.log('3. Crie uma run com tokens > 0');
console.log('4. Observe este console para mudanças');
console.log('5. Se API save der erro, copie a mensagem\n');