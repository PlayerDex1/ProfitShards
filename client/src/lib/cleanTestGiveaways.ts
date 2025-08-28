// Função para limpar giveaways de teste do localStorage
// Isso garante que apenas giveaways principais apareçam na Home

export function cleanTestGiveaways() {
  try {
    // Limpar giveaways de teste do localStorage
    const testStorageKey = 'giveaway_admin_data';
    const stored = localStorage.getItem(testStorageKey);
    
    if (stored) {
      const data = JSON.parse(stored);
      // Resetar para estado vazio
      const cleanData = {
        giveaways: [],
        activeGiveawayId: null,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(testStorageKey, JSON.stringify(cleanData));
      console.log('✅ Giveaways de teste limpos - apenas principais aparecerão na Home');
    }
  } catch (error) {
    console.error('Erro ao limpar giveaways de teste:', error);
  }
}

// Auto-executar ao importar
cleanTestGiveaways();