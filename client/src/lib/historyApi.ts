import { getCurrentUsername } from '@/hooks/use-auth';
import type { HistoryItem } from '@/types/calculator';

function cacheKey(user: string | null) {
  return `worldshards-history-cache-${user ?? 'guest'}`;
}

export function getHistoryCached(): HistoryItem[] {
  try {
    const key = cacheKey(getCurrentUsername());
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function refreshHistory(): Promise<void> {
  const user = getCurrentUsername();
  if (!user) return; // keep empty when not logged
  const res = await fetch(`/api/history?user=${encodeURIComponent(user)}&limit=500`);
  if (!res.ok) return;
  const items = (await res.json()) as HistoryItem[];
  localStorage.setItem(cacheKey(user), JSON.stringify(items.slice(-500)));
  window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
}

export async function appendHistoryItem(item: HistoryItem): Promise<void> {
  const user = getCurrentUsername();
  if (!user) return;
  await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, item }),
  });
  await refreshHistory();
}

export async function clearHistoryRemote(): Promise<void> {
  const user = getCurrentUsername();
  if (!user) return;
  await fetch(`/api/history?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
  await refreshHistory();
}

export async function deleteHistoryItem(timestamp: number): Promise<void> {
  const user = getCurrentUsername();
  if (!user) return;
  await fetch(`/api/history?user=${encodeURIComponent(user)}&timestamp=${timestamp}`, { method: 'DELETE' });
  await refreshHistory();
}

