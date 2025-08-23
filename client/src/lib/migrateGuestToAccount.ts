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
  if (!user) return;

  // Collect legacy owners to migrate (any key suffix other than current user)
  const legacyOwners = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) || '';
    if (k.startsWith('worldshards-history-') || k.startsWith('worldshards-mapdrops-') || k.startsWith('worldshards-mapdrops-cache-')) {
      const owner = k.split('-').pop() || '';
      if (owner && owner !== user) legacyOwners.add(owner);
    }
  }

  // History: upload all items from all legacy owners
  for (const owner of Array.from(legacyOwners)) {
    const key = `worldshards-history-${owner}`;
    const items = (readLocal<HistoryItem[]>(key) || []) as HistoryItem[];
    for (const item of items) {
      try { await appendHistoryItem(item); } catch {}
    }
  }

  // Map drops: DESABILITADO - API antiga removida
  // for (const owner of Array.from(legacyOwners)) {
  //   const k1 = `worldshards-mapdrops-${owner}`;
  //   const k2 = `worldshards-mapdrops-cache-${owner}`;
  //   const items = (readLocal<MapDropEntry[]>(k1) || readLocal<MapDropEntry[]>(k2) || []) as MapDropEntry[];
  //   for (const entry of items) {
  //     try { await appendMapDrop(entry); } catch {}
  //   }
  // }
  console.log('📊 Map drops migration skipped - using new metrics system');

  // Calculator form and equipment: migrate guest only for now
  try {
    const guestForm = localStorage.getItem('worldshards-form-guest');
    if (guestForm) localStorage.setItem(`worldshards-form-${user}`, guestForm);
  } catch {}
  try {
    const guestEquip = localStorage.getItem('worldshards-equipment-guest');
    if (guestEquip) localStorage.setItem(`worldshards-equipment-${user}`, guestEquip);
  } catch {}

  // Refresh caches and notify UI
  try { await refreshHistory(); } catch {}
  // try { await refreshMapDrops(); } catch {} // DESABILITADO - API antiga
  console.log('🔄 Map drops refresh skipped - using new metrics system');
  window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
  window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
}