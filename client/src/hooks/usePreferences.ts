import { useCallback, useEffect, useState } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";

export interface MapEnergyCosts {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

export interface UserPreferences {
  mapSize: string;
  loadsPerMap: number;
  energyCosts: MapEnergyCosts;
}

function keyForUser(username: string | null) {
  const u = username ?? 'guest';
  return `worldshards-prefs-${u}`;
}

const DEFAULT_PREFS: UserPreferences = {
  mapSize: '',
  loadsPerMap: 0,
  energyCosts: { small: 1, medium: 2, large: 4, xlarge: 6 },
};

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(keyForUser(getCurrentUsername()));
      const parsed = raw ? JSON.parse(raw) : DEFAULT_PREFS;
      setPrefs({ ...DEFAULT_PREFS, ...parsed, energyCosts: { ...DEFAULT_PREFS.energyCosts, ...(parsed?.energyCosts || {}) } });
    } catch {
      setPrefs(DEFAULT_PREFS);
    }
  }, []);

  useEffect(() => {
    load();
    const onAuth = () => load();
    window.addEventListener('worldshards-auth-updated', onAuth);
    return () => window.removeEventListener('worldshards-auth-updated', onAuth);
  }, [load]);

  const save = useCallback((next: Partial<UserPreferences>) => {
    const merged: UserPreferences = { ...prefs, ...next, energyCosts: { ...prefs.energyCosts, ...(next.energyCosts || {}) } };
    setPrefs(merged);
    localStorage.setItem(keyForUser(getCurrentUsername()), JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('worldshards-prefs-updated'));
  }, [prefs]);

  return { prefs, save };
}