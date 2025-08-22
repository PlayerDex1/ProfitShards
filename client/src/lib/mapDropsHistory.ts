export type MapSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface MapDropEntry {
  timestamp: number;
  mapSize: MapSize;
  tokensDropped: number;
  loads: number;
  totalLuck?: number;
  status?: 'excellent' | 'positive' | 'negative' | 'neutral';
}

const TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 dias

function getStorageKey(): string {
  return 'worldshards-mapdrops-history';
}

export function getMapDropsHistory(): MapDropEntry[] {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return [];
    
    const arr: MapDropEntry[] = JSON.parse(raw);
    const now = Date.now();
    const filtered = arr.filter((e) => now - e.timestamp <= TTL_MS);
    
    if (filtered.length !== arr.length) {
      // Clean up old entries
      localStorage.setItem(getStorageKey(), JSON.stringify(filtered));
    }
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function appendMapDropEntry(entry: MapDropEntry): void {
  try {
    const history = getMapDropsHistory();
    history.unshift(entry); // Add to beginning
    localStorage.setItem(getStorageKey(), JSON.stringify(history));
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
  } catch (error) {
    console.error('Error saving map drop entry:', error);
  }
}

export function deleteMapDropEntry(timestamp: number): void {
  try {
    const history = getMapDropsHistory();
    const filtered = history.filter(entry => entry.timestamp !== timestamp);
    localStorage.setItem(getStorageKey(), JSON.stringify(filtered));
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
  } catch (error) {
    console.error('Error deleting map drop entry:', error);
  }
}

export function clearMapDropsHistory(): void {
  try {
    localStorage.removeItem(getStorageKey());
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
  } catch (error) {
    console.error('Error clearing map drops history:', error);
  }
}