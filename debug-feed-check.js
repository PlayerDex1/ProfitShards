// 🔍 DEBUG FEED - Verificar se há dados fake no feed
console.log('🔍 VERIFICANDO FEED DA COMUNIDADE...');

async function checkFeed() {
  try {
    console.log('📊 Buscando dados do feed...');
    
    const response = await fetch('/api/feed/activity-stream', {
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Feed carregado com sucesso!');
      console.log('📊 Total de runs:', result.runs.length);
      
      // Verificar se há dados fake
      const fakePlayers = ['DragonSlayer', 'LuckMaster', 'TokenHunter', 'GemCrafter', 'MapExplorer', 'FarmKing', 'CrystalMiner', 'ShardCollector', 'LuckyFarmer', 'MapMaster', 'TokenKing', 'GemHunter', 'CrystalSeeker', 'ShardLord', 'FarmWizard', 'MapLegend'];
      
      const realRuns = result.runs.filter(run => !fakePlayers.includes(run.player));
      const fakeRuns = result.runs.filter(run => fakePlayers.includes(run.player));
      
      console.log('📊 Runs reais:', realRuns.length);
      console.log('📊 Runs fake:', fakeRuns.length);
      
      if (fakeRuns.length > 0) {
        console.log('❌ DADOS FAKE DETECTADOS!');
        console.log('🔍 Primeiros 5 runs fake:', fakeRuns.slice(0, 5));
      } else {
        console.log('✅ Apenas dados reais encontrados!');
      }
      
      // Verificar se há runs recentes
      const recentRuns = result.runs.slice(0, 10);
      console.log('🔍 Últimas 10 runs:', recentRuns);
      
    } else {
      console.log('❌ Erro ao carregar feed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkFeed();