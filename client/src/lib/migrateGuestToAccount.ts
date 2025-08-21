import { getCurrentUsername } from '@/hooks/use-auth';
import { appendHistoryItem, refreshHistory } from '@/lib/historyApi';
import { appendMapDrop, refreshMapDrops } from '@/lib/mapDropsApi';
import type { HistoryItem } from '@/types/calculator';
import type { MapDropEntry } from '@/lib/mapDropsHistory';

function readLocal<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}

export async function migrateGuestToCurrentUser(): Promise<void> {
  const user = getCurrentUsername();
  if (!user || user === 'guest') return;

  // 1) Calculator history (legacy local key)
  const legacyHistory = readLocal<HistoryItem[]>(`worldshards-history-guest`) || [];
  if (legacyHistory.length > 0) {
    // upload in order
    for (const item of legacyHistory) {
      try { await appendHistoryItem(item); } catch {}
    }
  }

  // 2) Map drops (legacy keys)
  const legacyMapDrops = (readLocal<MapDropEntry[]>(`worldshards-mapdrops-guest`)
    || readLocal<MapDropEntry[]>(`worldshards-mapdrops-cache-guest`)
    || []) as MapDropEntry[];
  if (legacyMapDrops.length > 0) {
    for (const entry of legacyMapDrops) {
      try { await appendMapDrop(entry); } catch {}
    }
  }

  // 3) Calculator form: copy guest form to user-specific key
  try {
    const guestForm = localStorage.getItem('worldshards-form-guest');
    if (guestForm) localStorage.setItem(`worldshards-form-${user}`, guestForm);
  } catch {}

  // 4) Equipment (optional)
  try {
    const guestEquip = localStorage.getItem('worldshards-equipment-guest');
    if (guestEquip) localStorage.setItem(`worldshards-equipment-${user}`, guestEquip);
  } catch {}

  // Cleanup guest keys (optional; keep minimal to avoid data loss)
  // localStorage.removeItem('worldshards-history-guest');
  // localStorage.removeItem('worldshards-mapdrops-guest');
  // localStorage.removeItem('worldshards-mapdrops-cache-guest');
  // localStorage.removeItem('worldshards-form-guest');
  // localStorage.removeItem('worldshards-equipment-guest');

  // Refresh caches and notify UI
  try { await refreshHistory(); } catch {}
  try { await refreshMapDrops(); } catch {}
  window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
  window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
}