import type { HistoryItem } from '@/types/calculator';

const STORAGE_KEY = 'worldshards-history';
const MAX_HISTORY_ITEMS = 100;

// Sync statistics with backend
async function syncStatistics(action: 'add' | 'delete' | 'clear', item?: HistoryItem): Promise<void> {
  try {
    if (action === 'clear') {
      // Clear all user statistics
      await fetch('/api/admin/clear-user-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getUserId() })
      });
      return;
    }

    if (!item) return;

    await fetch('/api/admin/sync-history-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        userId: getUserId(),
        timestamp: item.timestamp,
        data: {
          // investment removido - não é mais usado
          gemsCost: item.results.gemsCost,
          tokensCost: item.results.tokensCost,
          totalCost: item.results.totalCost,
          finalProfit: item.results.finalProfit,
          roi: item.results.roi,
          efficiency: item.results.efficiency,
          tokensEquipment: item.results.tokensEquipment,
          tokensFarmed: item.formData.tokensFarmed,
          totalTokens: item.results.totalTokens
        }
      })
    });
  } catch (error) {
    console.log('⚠️ Failed to sync statistics:', error);
    // Don't throw - statistics sync is not critical
  }
}

// Get consistent user ID for statistics
function getUserId(): string {
  let userId = localStorage.getItem('user-stats-id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('user-stats-id', userId);
  }
  return userId;
}

export function forceCleanCorruptedHistory(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    
    const items: any[] = JSON.parse(raw);
    const validItems = items.filter(item => {
      // Verificação de integridade dos dados
      return (
        item && 
        typeof item === 'object' &&
        typeof item?.timestamp === 'number' &&
        item?.results && 
        typeof item.results === 'object' &&
        typeof item?.results?.finalProfit === 'number' &&
        item?.formData && 
        typeof item.formData === 'object' &&
        typeof item?.results?.gemsCost === 'number'
      );
    });
    
    if (validItems.length !== items.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
      console.log(`🧹 Histórico: ${items.length - validItems.length} itens corrompidos removidos`);
      
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
      typeof item.results.gemsCost === 'number'
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
    
    // Sync with statistics (send to backend)
    syncStatistics('add', item);
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
  } catch (error) {
    console.error('Error saving history item:', error);
  }
}

export function deleteHistoryItem(timestamp: number): void {
  try {
    const history = getHistoryCached();
    const itemToDelete = history.find(item => item.timestamp === timestamp);
    const filtered = history.filter(item => item.timestamp !== timestamp);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Sync with statistics (remove from backend)
    if (itemToDelete) {
      syncStatistics('delete', itemToDelete);
    }
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
}

export function clearHistoryRemote(): void {
  try {
    // Sync with statistics (clear all)
    syncStatistics('clear');
    
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

// Funções de debug removidas - sistema está funcionando corretamente

