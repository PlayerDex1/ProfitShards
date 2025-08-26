// 🧪 SCRIPT DE TESTES PARA PRODUÇÃO
// Testa todas as funcionalidades do feed melhorado

const PRODUCTION_URL = 'https://profitshards.pages.dev';
const ALTERNATIVE_URL = 'https://profitshards.online';

async function testProduction() {
    console.log('🚀 Iniciando testes em produção...\n');
    
    // 1. Teste básico de conectividade
    await testConnectivity();
    
    // 2. Teste da API do feed
    await testFeedAPI();
    
    // 3. Teste de performance
    await testPerformance();
    
    // 4. Teste de estrutura HTML
    await testHTMLStructure();
    
    console.log('\n✅ Testes concluídos!');
}

// Teste 1: Conectividade básica
async function testConnectivity() {
    console.log('🔗 Testando conectividade...');
    
    try {
        const response = await fetch(PRODUCTION_URL);
        const status = response.status;
        const isOnline = status === 200;
        
        console.log(`   Status: ${status} ${isOnline ? '✅' : '❌'}`);
        console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);
        
        if (isOnline) {
            const html = await response.text();
            const hasTitle = html.includes('<title>');
            const hasReact = html.includes('React');
            
            console.log(`   HTML válido: ${hasTitle ? '✅' : '❌'}`);
            console.log(`   Tamanho: ${(html.length / 1024).toFixed(2)}KB`);
        }
        
    } catch (error) {
        console.log(`   ❌ Erro de conectividade: ${error.message}`);
    }
    
    console.log('');
}

// Teste 2: API do feed
async function testFeedAPI() {
    console.log('📊 Testando API do feed...');
    
    try {
        const apiUrl = `${PRODUCTION_URL}/api/feed/activity-stream`;
        const startTime = Date.now();
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'ProductionTest/1.0'
            }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`   Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
        console.log(`   Tempo de resposta: ${responseTime}ms ${responseTime < 1000 ? '✅' : '⚠️'}`);
        
        if (response.ok) {
            const data = await response.json();
            
            console.log(`   Estrutura válida: ${data.success !== undefined ? '✅' : '❌'}`);
            console.log(`   Tem runs: ${data.runs && data.runs.length > 0 ? '✅' : '⚠️'}`);
            console.log(`   Total de runs: ${data.runs ? data.runs.length : 0}`);
            console.log(`   Cache ativo: ${data.cached ? '✅' : '❌'}`);
            
            // Validar estrutura dos dados
            if (data.runs && data.runs.length > 0) {
                const firstRun = data.runs[0];
                const hasRequiredFields = firstRun.id && firstRun.map && 
                                         firstRun.luck !== undefined && 
                                         firstRun.tokens !== undefined;
                                         
                console.log(`   Estrutura dos runs: ${hasRequiredFields ? '✅' : '❌'}`);
                console.log(`   Exemplo: ${JSON.stringify(firstRun, null, 2)}`);
            }
        } else {
            console.log(`   ❌ API retornou erro: ${response.statusText}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Erro na API: ${error.message}`);
    }
    
    console.log('');
}

// Teste 3: Performance
async function testPerformance() {
    console.log('⚡ Testando performance...');
    
    try {
        const tests = [];
        
        // Teste múltiplas requisições
        for (let i = 0; i < 3; i++) {
            const startTime = Date.now();
            const response = await fetch(PRODUCTION_URL);
            const endTime = Date.now();
            
            tests.push({
                attempt: i + 1,
                time: endTime - startTime,
                status: response.status
            });
        }
        
        const avgTime = tests.reduce((sum, test) => sum + test.time, 0) / tests.length;
        const allSuccessful = tests.every(test => test.status === 200);
        
        console.log(`   Média de tempo: ${avgTime.toFixed(0)}ms ${avgTime < 2000 ? '✅' : '⚠️'}`);
        console.log(`   Todos os testes: ${allSuccessful ? '✅' : '❌'}`);
        console.log(`   Detalhes: ${JSON.stringify(tests, null, 2)}`);
        
    } catch (error) {
        console.log(`   ❌ Erro no teste de performance: ${error.message}`);
    }
    
    console.log('');
}

// Teste 4: Estrutura HTML
async function testHTMLStructure() {
    console.log('🏗️ Testando estrutura HTML...');
    
    try {
        const response = await fetch(PRODUCTION_URL);
        const html = await response.text();
        
        // Verificações básicas
        const hasDoctype = html.includes('<!DOCTYPE html>');
        const hasViewport = html.includes('viewport');
        const hasTitle = html.includes('<title>');
        const hasCharset = html.includes('charset');
        const hasScript = html.includes('<script');
        
        console.log(`   DOCTYPE HTML5: ${hasDoctype ? '✅' : '❌'}`);
        console.log(`   Meta viewport: ${hasViewport ? '✅' : '❌'}`);
        console.log(`   Título presente: ${hasTitle ? '✅' : '❌'}`);
        console.log(`   Charset definido: ${hasCharset ? '✅' : '❌'}`);
        console.log(`   Scripts carregados: ${hasScript ? '✅' : '❌'}`);
        
        // Verificar se as melhorias do feed estão presentes
        const hasActivityStream = html.includes('ActivityStream') || html.includes('activity-stream');
        const hasModernCSS = html.includes('grid') || html.includes('flex');
        
        console.log(`   Feed presente: ${hasActivityStream ? '✅' : '❌'}`);
        console.log(`   CSS moderno: ${hasModernCSS ? '✅' : '❌'}`);
        
    } catch (error) {
        console.log(`   ❌ Erro ao verificar HTML: ${error.message}`);
    }
    
    console.log('');
}

// Teste de URLs alternativas
async function testAlternativeURLs() {
    console.log('🌐 Testando URLs alternativas...');
    
    const urls = [
        PRODUCTION_URL,
        ALTERNATIVE_URL,
        `${PRODUCTION_URL}/api/feed/activity-stream`,
        `${PRODUCTION_URL}/profile`,
    ];
    
    for (const url of urls) {
        try {
            const response = await fetch(url);
            console.log(`   ${url}: ${response.status} ${response.ok ? '✅' : '❌'}`);
        } catch (error) {
            console.log(`   ${url}: ❌ ${error.message}`);
        }
    }
    
    console.log('');
}

// Executar todos os testes
if (typeof window === 'undefined') {
    // Node.js environment  
    import('node-fetch').then(({ default: fetch }) => {
        global.fetch = fetch;
        testProduction().catch(console.error);
    });
} else {
    // Browser environment
    testProduction().catch(console.error);
}