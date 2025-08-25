export type MapSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface MapDropEntry {
  timestamp: number;
  mapSize: MapSize;
  tokensDropped: number;
  loads: number;
  totalLuck?: number;
  status?: 'excellent' | 'positive' | 'negative' | 'neutral';
  // 🆕 Novos campos Level/Tier/Charge
  level?: string;
  tier?: string;
  charge?: number;
  // 🆕 Data formatada para agrupamento por dia (reset 8h UTC)
  gameDay?: string;
}

// 🆕 Removido TTL - histórico infinito agora
// const TTL_MS = 2 * 24 * 60 * 60 * 1000; // Removido

// 🕰️ Função para calcular o "dia do jogo" baseado em reset às 8h UTC
function getGameDay(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getUTCHours();
  
  // Se antes das 8h UTC, considera o dia anterior
  if (hours < 8) {
    date.setUTCDate(date.getUTCDate() - 1);
  }
  
  // Retorna YYYY-MM-DD do "dia do jogo"
  return date.toISOString().split('T')[0];
}

function getStorageKey(): string {
  return 'worldshards-mapdrops-history';
}

export function getMapDropsHistory(): MapDropEntry[] {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return [];
    
    const arr: MapDropEntry[] = JSON.parse(raw);
    
    // 🆕 Histórico infinito - não filtra por tempo
    // 🆕 Adiciona gameDay para entradas antigas que não têm
    const updated = arr.map(entry => ({
      ...entry,
      gameDay: entry.gameDay || getGameDay(entry.timestamp)
    }));
    
    // Salva se houve updates
    if (updated.some((entry, idx) => entry.gameDay !== arr[idx]?.gameDay)) {
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    }
    
    return updated.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function appendMapDropEntry(entry: MapDropEntry): void {
  try {
    const history = getMapDropsHistory();
    
    // 🆕 Adiciona gameDay automaticamente
    const entryWithGameDay = {
      ...entry,
      gameDay: getGameDay(entry.timestamp)
    };
    
    history.unshift(entryWithGameDay); // Add to beginning
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

// 🆕 Função para agrupar histórico por dias de jogo
export function getMapDropsHistoryGroupedByDay(): Record<string, MapDropEntry[]> {
  const history = getMapDropsHistory();
  const grouped: Record<string, MapDropEntry[]> = {};
  
  history.forEach(entry => {
    const day = entry.gameDay || getGameDay(entry.timestamp);
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(entry);
  });
  
  return grouped;
}

// 🆕 Função para obter estatísticas de um dia específico
export function getDayStats(day: string): {
  totalRuns: number;
  totalTokens: number;
  totalCharges: number;
  avgTokensPerCharge: number;
} {
  const grouped = getMapDropsHistoryGroupedByDay();
  const dayEntries = grouped[day] || [];
  
  const totalRuns = dayEntries.length;
  const totalTokens = dayEntries.reduce((sum, entry) => sum + entry.tokensDropped, 0);
  const totalCharges = dayEntries.reduce((sum, entry) => sum + (entry.charge || entry.loads), 0);
  const avgTokensPerCharge = totalCharges > 0 ? totalTokens / totalCharges : 0;
  
  return {
    totalRuns,
    totalTokens,
    totalCharges,
    avgTokensPerCharge
  };
}