import type { HistoryItem } from '@/types/calculator';

const STORAGE_KEY = 'worldshards-history';
const MAX_HISTORY_ITEMS = 100;

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
        typeof item?.formData?.investment === 'number' &&
        typeof item?.formData?.gemsConsumed === 'number'
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

// Funções de debug removidas - sistema está funcionando corretamente

