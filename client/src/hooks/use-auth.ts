import { useCallback, useEffect, useMemo, useState } from "react";

const CURRENT_USER_KEY = "worldshards-current-user";

async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...(opts || {}) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function getCurrentUsername(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await api<{ user: { id: string; email: string; username: string } | null }>("/api/auth/me");
        const email = me.user?.email ?? null;
        if (email) localStorage.setItem(CURRENT_USER_KEY, email);
        else localStorage.removeItem(CURRENT_USER_KEY);
        setUser(email);
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
        setUser(null);
      }
    })();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CURRENT_USER_KEY) {
        setUser(localStorage.getItem(CURRENT_USER_KEY));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  // Dummy functions to maintain compatibility (not needed for Google OAuth)
  const register = useCallback(async (email: string, password: string) => {
    return { ok: true as const };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    try {
      await api<{ ok: boolean }>("/api/auth/logout", { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    window.dispatchEvent(new CustomEvent("worldshards-auth-updated"));
  }, []);

  const requestReset = useCallback(async (email: string) => {
    return { ok: true, token: "dummy-token" };
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    return { ok: true as const };
  }, []);

  return { user, isAuthenticated, register, login, logout, requestReset, resetPassword };
}