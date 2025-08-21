import { getCurrentUsername } from "@/hooks/use-auth";
import { appendMapDrop, clearMapDropsRemote, deleteMapDrop, getMapDropsCached, refreshMapDrops } from "@/lib/mapDropsApi";

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

export function getMapDropsHistory(): MapDropEntry[] {
  try {
    const arr: MapDropEntry[] = getMapDropsCached();
    const now = Date.now();
    const filtered = arr.filter((e) => now - e.timestamp <= TTL_MS);
    if (filtered.length !== arr.length) {
      // rewrite cache
      const user = getCurrentUsername();
      if (user) localStorage.setItem(`worldshards-mapdrops-cache-${user}`, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function appendMapDropEntry(entry: MapDropEntry) {
  appendMapDrop(entry).catch(() => {});
}

export function deleteMapDropEntry(timestamp: number) {
  deleteMapDrop(timestamp).catch(() => {});
}

export function clearMapDropsHistory() {
  clearMapDropsRemote().catch(() => {});
}

// Warm cache on load
try { refreshMapDrops(); } catch {}