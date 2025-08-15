import { EquipmentSession } from "@/types/equipment";
import { getCurrentUsername } from "@/hooks/use-auth";

export interface EquipmentLuckSnapshot {
  timestamp: number;
  luck: number;
}

function keyForUser(username: string | null): string {
  const user = username ?? 'guest';
  return `worldshards-equip-history-${user}`;
}

export function getEquipmentLuckHistory(): EquipmentLuckSnapshot[] {
  try {
    const key = keyForUser(getCurrentUsername());
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendEquipmentLuckSnapshot(session: EquipmentSession) {
  const key = keyForUser(getCurrentUsername());
  const history: EquipmentLuckSnapshot[] = getEquipmentLuckHistory();
  const luck = session.weapon.luck + session.axe.luck + session.armor.luck + session.pickaxe.luck;
  history.push({ timestamp: Date.now(), luck });
  localStorage.setItem(key, JSON.stringify(history.slice(-100)));
  window.dispatchEvent(new CustomEvent('worldshards-equip-history-updated'));
}