// 🔍 DEBUG PROFIT - Código para colar no console
// Cole este código no console do navegador (F12) e pressione Enter

console.log('🔍 INICIANDO DEBUG PROFIT...');

// Função para testar a API de lucros
async function testProfitAPI() {
  try {
    console.log('🔍 Testando API /api/admin/get-profit-stats...');
    
    const response = await fetch('/api/admin/get-profit-stats', {
      credentials: 'include'
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Response OK:', response.ok);
    
    const result = await response.json();
    console.log('📊 Resultado completo:', result);
    
    if (result.success) {
      console.log('✅ Dados carregados com sucesso!');
      console.log('📊 Total de cálculos:', result.stats.totalCalculations);
      console.log('💰 Lucro total:', result.stats.totalProfit);
      console.log('📈 Lucro médio:', result.stats.avgProfit);
      console.log('⚡ Eficiência média:', result.stats.avgEfficiency);
      
      // Verificar se há dados de exemplo
      if (result.stats.levelStats && result.stats.levelStats.length > 0) {
        console.log('🎯 Primeiro level:', result.stats.levelStats[0]);
      }
      
      if (result.stats.recentActivity && result.stats.recentActivity.length > 0) {
        console.log('📅 Atividade recente:', result.stats.recentActivity[0]);
      }
      
    } else {
      console.error('❌ Erro na API:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  }
}

// Função para testar a API de dados brutos
async function testRawDataAPI() {
  try {
    console.log('🔍 Testando API /api/admin/debug-profit-raw...');
    
    const response = await fetch('/api/admin/debug-profit-raw', {
      credentials: 'include'
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Response OK:', response.ok);
    
    const result = await response.json();
    console.log('📊 Dados brutos:', result);
    
    if (result.success) {
      console.log('✅ Dados brutos carregados!');
      console.log('📊 Total encontrado:', result.total_found);
      
      if (result.debug_data && result.debug_data.length > 0) {
        console.log('🔍 Primeiro cálculo bruto:', result.debug_data[0]);
        
        // Verificar se total_profit está sendo salvo
        const firstCalc = result.debug_data[0];
        if (firstCalc.total_profit !== undefined) {
          console.log('💰 Total profit do primeiro cálculo:', firstCalc.total_profit);
        } else {
          console.log('❌ Total profit não encontrado no primeiro cálculo');
        }
      }
      
    } else {
      console.error('❌ Erro na API de dados brutos:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API de dados brutos:', error);
  }
}

// Função para verificar dados salvos na calculadora
async function checkCalculatorData() {
  try {
    console.log('🔍 Verificando dados salvos na calculadora...');
    
    // Verificar localStorage
    const savedData = localStorage.getItem('calculator-history');
    if (savedData) {
      const history = JSON.parse(savedData);
      console.log('📊 Histórico no localStorage:', history.length, 'itens');
      
      if (history.length > 0) {
        const lastCalc = history[history.length - 1];
        console.log('🔍 Último cálculo salvo:', lastCalc);
        console.log('💰 Total profit do último cálculo:', lastCalc.results?.totalProfit);
      }
    } else {
      console.log('❌ Nenhum histórico encontrado no localStorage');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados da calculadora:', error);
  }
}

// Executar todos os testes
console.log('🚀 Executando todos os testes...');
console.log('='.repeat(50));

testProfitAPI().then(() => {
  console.log('='.repeat(50));
  return testRawDataAPI();
}).then(() => {
  console.log('='.repeat(50));
  return checkCalculatorData();
}).then(() => {
  console.log('='.repeat(50));
  console.log('✅ TODOS OS TESTES CONCLUÍDOS!');
  console.log('🔍 Verifique os logs acima para identificar o problema');
});

// Instruções
console.log('📋 INSTRUÇÕES:');
console.log('1. Cole este código no console (F12)');
console.log('2. Pressione Enter');
console.log('3. Verifique os logs acima');
console.log('4. Me diga o que aparece nos logs');