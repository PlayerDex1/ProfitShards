// 🔍 MONITOR EM TEMPO REAL - Feed de Atividade
// Execute este script enquanto testa o MapPlanner

const SITE_URL = 'https://profitshards.pages.dev';
const CHECK_INTERVAL = 10000; // 10 segundos

let lastRunCount = 0;
let monitoring = true;

async function getCurrentFeed() {
    try {
        const response = await fetch(`${SITE_URL}/api/feed/activity-stream`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`❌ Erro: ${error.message}`);
        return null;
    }
}

async function startMonitoring() {
    console.log('🔍 MONITOR DO FEED INICIADO');
    console.log('============================');
    console.log(`📡 Verificando a cada ${CHECK_INTERVAL/1000}s`);
    console.log(`🌐 Site: ${SITE_URL}`);
    console.log('');

    // Estado inicial
    const initialFeed = await getCurrentFeed();
    if (initialFeed) {
        lastRunCount = initialFeed.runs?.length || 0;
        console.log(`📊 Estado inicial: ${lastRunCount} runs`);
        
        if (initialFeed.runs && initialFeed.runs.length > 0) {
            console.log(`📄 Última run: ${JSON.stringify(initialFeed.runs[0], null, 2)}`);
        }
    }
    
    console.log('');
    console.log('🎯 AGORA FAÇA O TESTE:');
    console.log('1. Abra: https://profitshards.pages.dev/perfil');
    console.log('2. Faça login com Google');
    console.log('3. Vá para aba "Planejador"');
    console.log('4. Crie uma run (mapa + tokens)');
    console.log('5. Clique "Aplicar"');
    console.log('6. Aguarde este monitor detectar mudanças...');
    console.log('');

    let checkCount = 0;
    const monitor = setInterval(async () => {
        checkCount++;
        const currentTime = new Date().toLocaleTimeString();
        
        const feed = await getCurrentFeed();
        if (!feed) {
            console.log(`⏱️ ${currentTime} - Check ${checkCount}: ❌ Erro na API`);
            return;
        }

        const currentRunCount = feed.runs?.length || 0;
        
        if (currentRunCount !== lastRunCount) {
            console.log('');
            console.log('🚨 MUDANÇA DETECTADA! 🚨');
            console.log(`⏱️ Horário: ${currentTime}`);
            console.log(`📊 Runs antes: ${lastRunCount}`);
            console.log(`📊 Runs agora: ${currentRunCount}`);
            
            if (currentRunCount > lastRunCount) {
                console.log('✅ NOVA RUN ADICIONADA!');
                const newRun = feed.runs[0]; // Primeira run (mais recente)
                console.log('📄 Nova run detectada:');
                console.log(JSON.stringify(newRun, null, 2));
                
                // Verificar se não é dados demo
                if (newRun.id.startsWith('demo-')) {
                    console.log('⚠️ ATENÇÃO: Esta ainda é uma run demo');
                    console.log('   Continue testando para adicionar dados reais');
                } else {
                    console.log('🎉 SUCESSO! Esta é uma run real de usuário!');
                }
            } else {
                console.log('ℹ️ Quantidade de runs diminuiu (possível limpeza)');
            }
            
            lastRunCount = currentRunCount;
            console.log('');
        } else {
            // Status normal
            const status = feed.cached ? '💾 cache' : '🔄 fresh';
            console.log(`⏱️ ${currentTime} - Check ${checkCount}: ${currentRunCount} runs (${status})`);
        }
    }, CHECK_INTERVAL);

    // Parar após 10 minutos
    setTimeout(() => {
        clearInterval(monitor);
        console.log('');
        console.log('⏱️ Monitor finalizado após 10 minutos');
        console.log('Para continuar monitorando, execute novamente o script');
        monitoring = false;
    }, 10 * 60 * 1000);
}

// Função para verificar status da API
async function quickAPITest() {
    console.log('🔧 Teste rápido da API...');
    
    const endpoints = [
        '/api/feed/activity-stream',
        '/api/admin/save-map-run',
        '/api/admin/save-user-metrics'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const start = Date.now();
            const response = await fetch(`${SITE_URL}${endpoint}`, {
                method: endpoint.includes('save-') ? 'POST' : 'GET',
                headers: { 'Content-Type': 'application/json' },
                body: endpoint.includes('save-') ? '{}' : undefined
            });
            
            const time = Date.now() - start;
            const isOk = response.ok || (endpoint.includes('save-') && response.status === 401);
            const statusIcon = isOk ? '✅' : '❌';
            
            console.log(`  ${endpoint}: ${response.status} (${time}ms) ${statusIcon}`);
        } catch (error) {
            console.log(`  ${endpoint}: ❌ ${error.message}`);
        }
    }
    console.log('');
}

// Detectar ambiente
if (typeof window === 'undefined') {
    // Node.js
    import('node-fetch').then(({ default: fetch }) => {
        global.fetch = fetch;
        
        quickAPITest().then(() => {
            startMonitoring();
        });
    });
} else {
    // Browser
    quickAPITest().then(() => {
        startMonitoring();
    });
}

// Exportar para uso manual
if (typeof module !== 'undefined') {
    module.exports = { startMonitoring, getCurrentFeed };
}