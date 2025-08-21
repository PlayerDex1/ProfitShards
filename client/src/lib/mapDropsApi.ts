import { getCurrentUsername } from '@/hooks/use-auth';
import type { MapDropEntry } from '@/lib/mapDropsHistory';

function cacheKey(user: string | null) {
  return `worldshards-mapdrops-cache-${user ?? 'guest'}`;
}

export function getMapDropsCached(): MapDropEntry[] {
  try {
    const key = cacheKey(getCurrentUsername());
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function refreshMapDrops(): Promise<void> {
  const user = getCurrentUsername();
  if (!user) return;
  const res = await fetch(`/api/mapdrops?user=${encodeURIComponent(user)}&limit=200`);
  if (!res.ok) return;
  const items = (await res.json()) as MapDropEntry[];
  localStorage.setItem(cacheKey(user), JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
}

export async function appendMapDrop(entry: MapDropEntry): Promise<void> {
  const user = getCurrentUsername();
  if (!user) return;
  await fetch('/api/mapdrops', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, entry }),
  });
  await refreshMapDrops();
}

export async function deleteMapDrop(timestamp: number): Promise<void> {
  const user = getCurrentUsername();
  if (!user) return;
  await fetch(`/api/mapdrops?user=${encodeURIComponent(user)}&timestamp=${timestamp}`, { method: 'DELETE' });
  await refreshMapDrops();
}

export async function clearMapDropsRemote(): Promise<void> {
  const user = getCurrentUsername();
  if (!user) return;
  await fetch(`/api/mapdrops?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
  await refreshMapDrops();
}

