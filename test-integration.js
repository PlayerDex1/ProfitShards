// 🧪 TESTE DE INTEGRAÇÃO COMPLETA - SISTEMA DE GANHADORES
// Execute este script no console do navegador para testar a integração

console.log('🧪 INICIANDO TESTE DE INTEGRAÇÃO COMPLETA...');

// 1. TESTE DA API PÚBLICA
async function testPublicAPI() {
  console.log('\n📡 TESTE 1: API Pública de Ganhadores');
  
  try {
    const response = await fetch('/api/winners/public?limit=5');
    const result = await response.json();
    
    console.log('✅ API Pública funcionando:', {
      status: response.status,
      hasWinners: !!result.winners,
      winnersCount: result.winners?.length || 0,
      hasStats: !!result.stats,
      stats: result.stats
    });
    
    if (result.winners && result.winners.length > 0) {
      console.log('📊 Primeiro ganhador:', result.winners[0]);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro na API Pública:', error);
    return null;
  }
}

// 2. TESTE DA API ADMIN
async function testAdminAPI() {
  console.log('\n🔐 TESTE 2: API Admin de Ganhadores');
  
  try {
    const response = await fetch('/api/winners/public?admin=true&limit=5');
    const result = await response.json();
    
    console.log('✅ API Admin funcionando:', {
      status: response.status,
      hasWinners: !!result.winners,
      winnersCount: result.winners?.length || 0,
      hasStats: !!result.stats
    });
    
    if (result.winners && result.winners.length > 0) {
      const winner = result.winners[0];
      console.log('📊 Ganhador admin (dados completos):', {
        id: winner.id,
        email: winner.userEmail,
        notified: winner.notified,
        claimed: winner.claimed,
        shippingStatus: winner.shippingStatus,
        notificationMethod: winner.notificationMethod,
        notifiedAt: winner.notifiedAt
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro na API Admin:', error);
    return null;
  }
}

// 3. TESTE DE PERSISTÊNCIA
async function testPersistence() {
  console.log('\n💾 TESTE 3: Persistência de Dados');
  
  try {
    // Buscar dados duas vezes para verificar consistência
    const response1 = await fetch('/api/winners/public?admin=true&limit=10');
    const result1 = await response1.json();
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response2 = await fetch('/api/winners/public?admin=true&limit=10');
    const result2 = await response2.json();
    
    const consistent = JSON.stringify(result1) === JSON.stringify(result2);
    
    console.log('✅ Teste de persistência:', {
      consistent,
      firstCall: result1.winners?.length || 0,
      secondCall: result2.winners?.length || 0,
      dataChanged: !consistent
    });
    
    if (!consistent) {
      console.log('⚠️ Dados inconsistentes entre chamadas');
    }
    
    return consistent;
  } catch (error) {
    console.error('❌ Erro no teste de persistência:', error);
    return false;
  }
}

// 4. TESTE DE ESTRUTURA DO BANCO
async function testDatabaseStructure() {
  console.log('\n🗄️ TESTE 4: Estrutura do Banco de Dados');
  
  try {
    const response = await fetch('/api/winners/public?admin=true&limit=1');
    const result = await response.json();
    
    if (result.winners && result.winners.length > 0) {
      const winner = result.winners[0];
      const requiredFields = [
        'id', 'giveawayId', 'userEmail', 'totalPoints', 'position', 
        'announcedAt', 'notified', 'claimed', 'shippingStatus'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in winner));
      
      console.log('✅ Estrutura do banco:', {
        hasAllFields: missingFields.length === 0,
        missingFields,
        sampleData: {
          id: winner.id,
          notified: winner.notified,
          claimed: winner.claimed,
          shippingStatus: winner.shippingStatus
        }
      });
      
      return missingFields.length === 0;
    } else {
      console.log('⚠️ Nenhum ganhador para testar estrutura');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar estrutura:', error);
    return false;
  }
}

// 5. TESTE DE COMPONENTES FRONTEND
function testFrontendComponents() {
  console.log('\n🎨 TESTE 5: Componentes Frontend');
  
  try {
    // Verificar se os componentes estão renderizados
    const winnerManager = document.querySelector('[data-testid="winner-manager"]') || 
                         document.querySelector('.winner-manager') ||
                         document.querySelector('[class*="WinnerManager"]');
    
    const publicWinners = document.querySelector('[data-testid="public-winners"]') ||
                          document.querySelector('.public-winners') ||
                          document.querySelector('[class*="PublicWinnersList"]');
    
    console.log('✅ Componentes frontend:', {
      winnerManagerExists: !!winnerManager,
      publicWinnersExists: !!publicWinners,
      winnerManagerVisible: winnerManager?.offsetParent !== null,
      publicWinnersVisible: publicWinners?.offsetParent !== null
    });
    
    return {
      winnerManager: !!winnerManager,
      publicWinners: !!publicWinners
    };
  } catch (error) {
    console.error('❌ Erro ao testar componentes:', error);
    return { winnerManager: false, publicWinners: false };
  }
}

// 6. TESTE COMPLETO
async function runFullIntegrationTest() {
  console.log('🚀 EXECUTANDO TESTE COMPLETO DE INTEGRAÇÃO...\n');
  
  const results = {
    publicAPI: false,
    adminAPI: false,
    persistence: false,
    databaseStructure: false,
    frontendComponents: false
  };
  
  try {
    // Executar todos os testes
    const publicResult = await testPublicAPI();
    results.publicAPI = !!publicResult;
    
    const adminResult = await testAdminAPI();
    results.adminAPI = !!adminResult;
    
    results.persistence = await testPersistence();
    results.databaseStructure = await testDatabaseStructure();
    
    const frontendResult = testFrontendComponents();
    results.frontendComponents = frontendResult.winnerManager && frontendResult.publicWinners;
    
    // Resumo final
    console.log('\n📋 RESUMO DOS TESTES:');
    console.log('========================');
    console.log(`📡 API Pública: ${results.publicAPI ? '✅' : '❌'}`);
    console.log(`🔐 API Admin: ${results.adminAPI ? '✅' : '❌'}`);
    console.log(`💾 Persistência: ${results.persistence ? '✅' : '❌'}`);
    console.log(`🗄️ Estrutura DB: ${results.databaseStructure ? '✅' : '❌'}`);
    console.log(`🎨 Frontend: ${results.frontendComponents ? '✅' : '❌'}`);
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log(`\n🎯 RESULTADO FINAL: ${passedTests}/${totalTests} testes passaram (${successRate}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 SISTEMA TOTALMENTE FUNCIONAL!');
    } else {
      console.log('⚠️ ALGUNS PROBLEMAS DETECTADOS');
      console.log('Verifique os logs acima para detalhes');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Erro no teste completo:', error);
    return results;
  }
}

// 7. FUNÇÕES AUXILIARES
function showTestMenu() {
  console.log('\n🔧 MENU DE TESTES DISPONÍVEIS:');
  console.log('1. testPublicAPI() - Testa API pública');
  console.log('2. testAdminAPI() - Testa API admin');
  console.log('3. testPersistence() - Testa persistência');
  console.log('4. testDatabaseStructure() - Testa estrutura do banco');
  console.log('5. testFrontendComponents() - Testa componentes');
  console.log('6. runFullIntegrationTest() - Teste completo');
  console.log('7. showTestMenu() - Mostra este menu');
}

// 8. INICIALIZAÇÃO
console.log('🎯 Para executar o teste completo, digite: runFullIntegrationTest()');
console.log('🔧 Para ver o menu de testes: showTestMenu()');

// Exportar funções para uso global
window.testIntegration = {
  testPublicAPI,
  testAdminAPI,
  testPersistence,
  testDatabaseStructure,
  testFrontendComponents,
  runFullIntegrationTest,
  showTestMenu
};

console.log('✅ Script de teste carregado! Use window.testIntegration.* para acessar as funções');