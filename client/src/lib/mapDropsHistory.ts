import { getCurrentUsername } from "@/hooks/use-auth";

export type MapSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface MapDropEntry {
  timestamp: number;
  mapSize: MapSize;
  tokensDropped: number;
  loads: number;
  totalLuck?: number;
  status?: 'excellent' | 'positive' | 'negative' | 'neutral';
}

function keyForUser(user: string | null) {
  return `worldshards-mapdrops-${user ?? 'guest'}`;
}

const TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 dias

export function getMapDropsHistory(): MapDropEntry[] {
  try {
    const key = keyForUser(getCurrentUsername());
    const raw = localStorage.getItem(key);
    const arr: MapDropEntry[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const filtered = arr.filter((e) => now - e.timestamp <= TTL_MS);
    if (filtered.length !== arr.length) {
      localStorage.setItem(key, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function appendMapDropEntry(entry: MapDropEntry) {
  const key = keyForUser(getCurrentUsername());
  const arr = getMapDropsHistory();
  arr.push(entry);
  const now = Date.now();
  const filtered = arr.filter((e) => now - e.timestamp <= TTL_MS).slice(-200);
  localStorage.setItem(key, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
}

export function deleteMapDropEntry(timestamp: number) {
  const key = keyForUser(getCurrentUsername());
  const arr = getMapDropsHistory();
  const next = arr.filter((e) => e.timestamp !== timestamp);
  localStorage.setItem(key, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
}

export function clearMapDropsHistory() {
  const key = keyForUser(getCurrentUsername());
  localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
}