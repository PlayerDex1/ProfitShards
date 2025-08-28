// 🔍 DEBUG GIVEAWAY - Cole este código no console do navegador
// Vai testar toda a cadeia: dados → API → banco

console.log('🚀 INICIANDO DEBUG COMPLETO DO GIVEAWAY...');

async function debugGiveaway() {
  try {
    console.log('📋 PASSO 1: Criando dados de teste...');
    
    // Dados de teste
    const testGiveaway = {
      id: `debug_test_${Date.now()}`,
      title: "Debug Test Giveaway",
      description: "Teste de debug do sistema",
      prize: "1x Debug Box",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      status: "active",
      maxParticipants: 100,
      currentParticipants: 0,
      rules: ["Regra de teste"],
      requirements: [
        {
          id: "test_req",
          type: "login",
          description: "Login de teste",
          points: 1,
          isRequired: true,
          url: ""
        }
      ],
      winnerAnnouncement: "",
      imageUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ DADOS DE TESTE CRIADOS:', testGiveaway);
    
    console.log('📡 PASSO 2: Testando API save...');
    
    // Testar API save
    const saveResponse = await fetch('/api/giveaways/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(testGiveaway)
    });
    
    console.log('📊 RESPOSTA SAVE:', {
      status: saveResponse.status,
      statusText: saveResponse.statusText,
      ok: saveResponse.ok,
      headers: Object.fromEntries(saveResponse.headers.entries())
    });
    
    if (saveResponse.ok) {
      const saveResult = await saveResponse.json();
      console.log('✅ SAVE SUCESSO:', saveResult);
    } else {
      const saveError = await saveResponse.text();
      console.error('❌ SAVE ERRO:', saveError);
    }
    
    console.log('🔍 PASSO 3: Verificando se salvou no banco...');
    
    // Testar debug API
    const debugResponse = await fetch('/api/giveaways/debug');
    const debugData = await debugResponse.json();
    
    console.log('📊 ESTADO DO BANCO APÓS SAVE:', {
      totalGiveaways: debugData.debug.totalGiveaways,
      giveaways: debugData.debug.allGiveaways,
      nossoTesteEncontrado: debugData.debug.allGiveaways.find(g => g.id === testGiveaway.id)
    });
    
    console.log('🔍 PASSO 4: Testando API active...');
    
    // Testar API active
    const activeResponse = await fetch('/api/giveaways/active');
    const activeData = await activeResponse.json();
    
    console.log('📊 GIVEAWAY ATIVO:', activeData);
    
    console.log('📋 PASSO 5: Resumo completo...');
    
    const summary = {
      1: `Dados criados: ✅`,
      2: `API save: ${saveResponse.ok ? '✅' : '❌'} (${saveResponse.status})`,
      3: `Salvou no banco: ${debugData.debug.totalGiveaways > 0 ? '✅' : '❌'} (${debugData.debug.totalGiveaways} giveaways)`,
      4: `API active funciona: ${activeResponse.ok ? '✅' : '❌'}`,
      5: `Giveaway aparece: ${activeData.giveaway ? '✅' : '❌'}`,
      problemas: []
    };
    
    // Identificar problemas
    if (!saveResponse.ok) {
      summary.problemas.push('API save falhou');
    }
    if (debugData.debug.totalGiveaways === 0) {
      summary.problemas.push('Não salvou no banco D1');
    }
    if (!activeData.giveaway) {
      summary.problemas.push('API active não encontra giveaway');
    }
    
    console.log('🎯 RESUMO FINAL:', summary);
    
    if (summary.problemas.length === 0) {
      console.log('🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
    } else {
      console.log('⚠️ PROBLEMAS ENCONTRADOS:', summary.problemas);
    }
    
    return {
      testGiveaway,
      saveResponse: {
        status: saveResponse.status,
        ok: saveResponse.ok
      },
      bankState: debugData.debug,
      activeResult: activeData,
      summary
    };
    
  } catch (error) {
    console.error('💥 ERRO GERAL NO DEBUG:', error);
    return { error: error.message };
  }
}

// Executar debug
debugGiveaway().then(result => {
  console.log('🏁 DEBUG FINALIZADO:', result);
}).catch(error => {
  console.error('💥 FALHA NO DEBUG:', error);
});

console.log('⏳ Aguarde... testando toda a cadeia...');