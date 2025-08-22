import type { HistoryItem } from '@/types/calculator';

const STORAGE_KEY = 'worldshards-history';
const MAX_HISTORY_ITEMS = 100;

export function getHistoryCached(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const items: HistoryItem[] = JSON.parse(raw);
    return items.sort((a, b) => b.timestamp - a.timestamp);
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

