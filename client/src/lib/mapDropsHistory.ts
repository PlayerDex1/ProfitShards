// Map Drops History Management
export type MapSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface MapDrop {
  mapSize: MapSize;
  tokensDropped: number;
  loads: number;
  charges: number;
  timestamp: number;
  totalLuck?: number;
  status?: string;
  level?: string;
  tier?: string;
  charge?: number;
}

const STORAGE_KEY = 'worldshards-map-drops';

// Get map drops history from localStorage
export function getMapDropsHistory(): MapDrop[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading map drops history:', error);
    return [];
  }
}

// Save map drops history to localStorage
function saveMapDropsHistory(drops: MapDrop[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drops));
    // Dispatch event for component updates
    window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
  } catch (error) {
    console.error('Error saving map drops history:', error);
  }
}

// Add new map drop entry
export function appendMapDropEntry(drop: MapDrop): void {
  try {
    const history = getMapDropsHistory();
    history.unshift({
      ...drop,
      timestamp: drop.timestamp || Date.now()
    });
    
    // Keep only last 1000 entries to prevent storage overflow
    if (history.length > 1000) {
      history.splice(1000);
    }
    
    saveMapDropsHistory(history);
  } catch (error) {
    console.error('Error appending map drop:', error);
  }
}

// Delete specific map drop entry
export function deleteMapDropEntry(timestamp: number): void {
  try {
    const history = getMapDropsHistory();
    const filtered = history.filter(drop => drop.timestamp !== timestamp);
    saveMapDropsHistory(filtered);
  } catch (error) {
    console.error('Error deleting map drop:', error);
  }
}

// Clear all map drops history
export function clearMapDropsHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
  } catch (error) {
    console.error('Error clearing map drops history:', error);
  }
}

// Group history by day for analytics
export function getMapDropsHistoryGroupedByDay(): any[] {
  try {
    const history = getMapDropsHistory();
    const grouped = new Map();
    
    history.forEach(drop => {
      const date = new Date(drop.timestamp);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, {
          date: dayKey,
          entries: [],
          totalTokens: 0,
          totalLoads: 0,
          avgTokensPerLoad: 0
        });
      }
      
      const dayData = grouped.get(dayKey);
      dayData.entries.push(drop);
      dayData.totalTokens += drop.tokensDropped || 0;
      dayData.totalLoads += drop.loads || 0;
      dayData.avgTokensPerLoad = dayData.totalLoads > 0 ? dayData.totalTokens / dayData.totalLoads : 0;
    });
    
    return Array.from(grouped.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error grouping map drops by day:', error);
    return [];
  }
}

// Get day statistics
export function getDayStats(): any {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).getTime();
    
    const history = getMapDropsHistory();
    const todayDrops = history.filter(drop => 
      drop.timestamp >= startOfDay && drop.timestamp <= endOfDay
    );
    
    const totalTokens = todayDrops.reduce((sum, drop) => sum + (drop.tokensDropped || 0), 0);
    const totalLoads = todayDrops.reduce((sum, drop) => sum + (drop.loads || 0), 0);
    const avgTokensPerLoad = totalLoads > 0 ? totalTokens / totalLoads : 0;
    
    // Group by map size
    const bySize = todayDrops.reduce((acc, drop) => {
      if (!acc[drop.mapSize]) {
        acc[drop.mapSize] = { tokens: 0, loads: 0, count: 0 };
      }
      acc[drop.mapSize].tokens += drop.tokensDropped || 0;
      acc[drop.mapSize].loads += drop.loads || 0;
      acc[drop.mapSize].count += 1;
      return acc;
    }, {} as Record<string, any>);
    
    return {
      today: {
        totalTokens,
        totalLoads,
        avgTokensPerLoad,
        runsCount: todayDrops.length
      },
      bySize,
      recentRuns: todayDrops.slice(0, 10)
    };
  } catch (error) {
    console.error('Error calculating day stats:', error);
    return {
      today: { totalTokens: 0, totalLoads: 0, avgTokensPerLoad: 0, runsCount: 0 },
      bySize: {},
      recentRuns: []
    };
  }
}