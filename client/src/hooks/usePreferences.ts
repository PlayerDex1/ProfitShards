import { useCallback, useEffect, useState } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";

export interface UserPreferences {
  mapSize: string;
  loadsPerMap: number;
}

function keyForUser(username: string | null) {
  const u = username ?? 'guest';
  return `worldshards-prefs-${u}`;
}

const DEFAULT_PREFS: UserPreferences = {
  mapSize: '',
  loadsPerMap: 0,
};

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(keyForUser(getCurrentUsername()));
      setPrefs(raw ? JSON.parse(raw) : DEFAULT_PREFS);
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

  const save = useCallback((next: UserPreferences) => {
    setPrefs(next);
    localStorage.setItem(keyForUser(getCurrentUsername()), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('worldshards-prefs-updated'));
  }, []);

  return { prefs, save };
}