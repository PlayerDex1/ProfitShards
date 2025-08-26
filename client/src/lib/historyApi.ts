import type { HistoryItem } from '@/types/calculator';

const STORAGE_KEY = 'worldshards-history';
const MAX_HISTORY_ITEMS = 100;

export function forceCleanCorruptedHistory(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log('🧹 forceCleanCorruptedHistory: Nenhum histórico encontrado no localStorage');
      return;
    }
    
    const items: any[] = JSON.parse(raw);
    console.log(`🔍 forceCleanCorruptedHistory: Encontrados ${items.length} itens para validar`);
    
    const validItems = items.filter((item, index) => {
      // Log detalhado do item sendo validado
      const checks = {
        isObject: item && typeof item === 'object',
        hasTimestamp: typeof item?.timestamp === 'number',
        hasResults: item?.results && typeof item.results === 'object',
        hasFinalProfit: typeof item?.results?.finalProfit === 'number',
        hasFormData: item?.formData && typeof item.formData === 'object',
        hasInvestment: typeof item?.formData?.investment === 'number',
        hasGemsConsumed: typeof item?.formData?.gemsConsumed === 'number'
      };
      
      const isValid = Object.values(checks).every(Boolean);
      
      if (!isValid) {
        console.log(`❌ Item ${index} inválido:`, { item, checks });
      }
      
      return isValid;
    });
    
    console.log(`✅ forceCleanCorruptedHistory: ${validItems.length} itens válidos de ${items.length} totais`);
    
    if (validItems.length !== items.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
      console.log(`🧹 forceCleanCorruptedHistory: ${items.length - validItems.length} itens corrompidos removidos`);
      
      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
    }
  } catch (error) {
    console.error('Erro ao limpar histórico corrompido:', error);
    // Em caso de erro grave, limpar tudo
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
  }
}

export function getHistoryCached(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const items: HistoryItem[] = JSON.parse(raw);
    
    // Filtrar apenas itens válidos com estrutura correta
    const validItems = items.filter(item => 
      item && 
      typeof item.timestamp === 'number' &&
      item.results && 
      typeof item.results.finalProfit === 'number' &&
      item.formData &&
      typeof item.formData.investment === 'number'
    );
    
    // Se removemos itens inválidos, salvar a versão limpa
    if (validItems.length !== items.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
      console.log(`🧹 getHistoryCached: ${items.length - validItems.length} itens corrompidos removidos automaticamente`);
    }
    
    return validItems.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function appendHistoryItem(item: HistoryItem): void {
  try {
    const history = getHistoryCached();
    history.unshift(item); // Add to beginning
    
    // Keep only the most recent items
    const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
  } catch (error) {
    console.error('Error saving history item:', error);
  }
}

export function deleteHistoryItem(timestamp: number): void {
  try {
    const history = getHistoryCached();
    const filtered = history.filter(item => item.timestamp !== timestamp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
}

export function clearHistoryRemote(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

// For compatibility - no-op since we're using localStorage
export async function refreshHistory(): Promise<void> {
  // No-op for localStorage implementation
}

export function createTestHistoryItem(): void {
  const testItem = {
    timestamp: Date.now(),
    formData: {
      investment: 1000,
      gemsPurchased: 100,
      gemsRemaining: 50,
      gemsConsumed: 50,
      tokensEquipment: 1000,
      tokensFarmed: 2000,
      loadsUsed: 10,
      tokenPrice: 1.5,
      gemPrice: 10
    },
    results: {
      totalTokens: 3000,
      tokensEquipment: 1000,
      tokensFarmed: 2000,
      totalTokenValue: 4500,
      gemsCost: 500,
      grossProfit: 4500,
      rebuyCost: 0,
      finalProfit: 4000,
      netProfit: 4000,
      roi: 400,
      efficiency: 200
    }
  };
  
  console.log('🧪 Criando item de teste:', testItem);
  appendHistoryItem(testItem);
  console.log('🧪 Histórico após item de teste:', getHistoryCached());
}

// Adicionar ao window para debug no console
if (typeof window !== 'undefined') {
  (window as any).createTestHistoryItem = createTestHistoryItem;
  (window as any).getHistoryCached = getHistoryCached;
  (window as any).forceCleanCorruptedHistory = forceCleanCorruptedHistory;
}

