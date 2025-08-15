import { useCallback, useEffect, useMemo, useState } from "react";
import { Equipment, EquipmentSession, clampLuck, Rarity } from "@/types/equipment";
import { getCurrentUsername } from "@/hooks/use-auth";
import { appendEquipmentLuckSnapshot } from "@/lib/equipmentHistory";

const DEFAULT_EQUIPMENT: EquipmentSession = {
  weapon: { luck: 0, rarity: 'comum' },
  axe: { luck: 0, rarity: 'comum' },
  armor: { luck: 0, rarity: 'comum' },
  pickaxe: { luck: 0, rarity: 'comum' },
};

function storageKeyForUser(username: string | null): string {
  const user = username ?? 'guest';
  return `worldshards-equip-session-${user}`;
}

export function useEquipment() {
  const [session, setSession] = useState<EquipmentSession>(DEFAULT_EQUIPMENT);
  const [isOpen, setIsOpen] = useState(false);

  const loadSession = useCallback(() => {
    const key = storageKeyForUser(getCurrentUsername());
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setSession(JSON.parse(raw));
      } else {
        setSession(DEFAULT_EQUIPMENT);
      }
    } catch {
      setSession(DEFAULT_EQUIPMENT);
    }
  }, []);

  useEffect(() => {
    loadSession();
    const onAuth = () => loadSession();
    window.addEventListener('worldshards-auth-updated', onAuth);
    return () => window.removeEventListener('worldshards-auth-updated', onAuth);
  }, [loadSession]);

  useEffect(() => {
    const key = storageKeyForUser(getCurrentUsername());
    localStorage.setItem(key, JSON.stringify(session));
    appendEquipmentLuckSnapshot(session);
  }, [session]);

  const totalLuck = useMemo(() => {
    return session.weapon.luck + session.axe.luck + session.armor.luck + session.pickaxe.luck;
  }, [session]);

  const openEquipment = () => setIsOpen(true);
  const closeEquipment = () => setIsOpen(false);

  const updateEquipment = useCallback((field: keyof EquipmentSession, next: Equipment) => {
    setSession((prev) => ({ ...prev, [field]: { luck: clampLuck(next.luck), rarity: next.rarity as Rarity } }));
  }, []);

  return { session, totalLuck, isOpen, openEquipment, closeEquipment, updateEquipment, setSession };
}