// WorldShards Map Drops History Management
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
    
    // Validate data structure
    if (!Array.isArray(data)) return [];
    
    // Filter and validate each entry
    return data.filter(item => 
      item && 
      typeof item === 'object' && 
      typeof item.timestamp === 'number' &&
      typeof item.tokensDropped === 'number' &&
      item.mapSize
    );
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
    
    const newEntry = {
      ...drop,
      timestamp: drop.timestamp || Date.now()
    };
    
    history.unshift(newEntry);
    
    // Keep only last 1000 entries to prevent storage overflow
    if (history.length > 1000) {
      history.splice(1000);
    }
    
    saveMapDropsHistory(history);
    console.log('✅ Map drop saved:', newEntry);
    
    // Disparar evento para tracking de missões do planejador
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('planner-used', {
        detail: { mapDrop: newEntry }
      }));
    }
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
    console.log('🗑️ Map drop deleted:', timestamp);
  } catch (error) {
    console.error('Error deleting map drop:', error);
  }
}

// Clear all map drops history
export function clearMapDropsHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
    console.log('🧹 Map drops history cleared');
  } catch (error) {
    console.error('Error clearing map drops history:', error);
  }
}

// Group history by day for analytics
export function getMapDropsHistoryGroupedByDay(): Array<[string, MapDrop[]]> {
  try {
    const history = getMapDropsHistory();
    const grouped = new Map<string, MapDrop[]>();
    
    history.forEach(drop => {
      if (!drop.timestamp) return;
      
      const date = new Date(drop.timestamp);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      
      grouped.get(dayKey)!.push(drop);
    });
    
    // Convert to array and sort by date (newest first)
    return Array.from(grouped.entries()).sort(([a], [b]) => b.localeCompare(a));
  } catch (error) {
    console.error('Error grouping map drops by day:', error);
    return [];
  }
}

// Get day statistics
export function getDayStats(day?: string): any {
  try {
    let targetDrops: MapDrop[];
    
    if (day) {
      // Use specific day
      const dayStart = new Date(day + 'T00:00:00.000Z').getTime();
      const dayEnd = new Date(day + 'T23:59:59.999Z').getTime();
      
      const history = getMapDropsHistory();
      targetDrops = history.filter(drop => 
        drop.timestamp >= dayStart && drop.timestamp <= dayEnd
      );
    } else {
      // Use today
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const endOfDay = startOfDay + (24 * 60 * 60 * 1000) - 1;
      
      const history = getMapDropsHistory();
      targetDrops = history.filter(drop => 
        drop.timestamp >= startOfDay && drop.timestamp <= endOfDay
      );
    }
    
    const totalTokens = targetDrops.reduce((sum, drop) => sum + (drop.tokensDropped || 0), 0);
    const totalLoads = targetDrops.reduce((sum, drop) => sum + (drop.loads || drop.charges || 0), 0);
    const totalRuns = targetDrops.length;
    const avgTokensPerLoad = totalLoads > 0 ? totalTokens / totalLoads : 0;
    
    // Group by map size
    const bySize = targetDrops.reduce((acc, drop) => {
      const size = drop.mapSize || 'unknown';
      if (!acc[size]) {
        acc[size] = { tokens: 0, loads: 0, count: 0 };
      }
      acc[size].tokens += drop.tokensDropped || 0;
      acc[size].loads += drop.loads || drop.charges || 0;
      acc[size].count += 1;
      return acc;
    }, {} as Record<string, any>);
    
    return {
      today: {
        totalTokens,
        totalLoads,
        avgTokensPerLoad,
        runsCount: totalRuns,
        totalRuns
      },
      bySize,
      recentRuns: targetDrops.slice(0, 10),
      totalRuns,
      totalTokens,
      totalLoads,
      avgTokensPerLoad
    };
  } catch (error) {
    console.error('Error calculating day stats:', error);
    return {
      today: { totalTokens: 0, totalLoads: 0, avgTokensPerLoad: 0, runsCount: 0, totalRuns: 0 },
      bySize: {},
      recentRuns: [],
      totalRuns: 0,
      totalTokens: 0,
      totalLoads: 0,
      avgTokensPerLoad: 0
    };
  }
}

// Helper function to format dates
export function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
}

// Helper function to format time
export function formatTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    return '--:--';
  }
}