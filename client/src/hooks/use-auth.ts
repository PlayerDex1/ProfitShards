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
        const me = await api<{ user: { id: string; email: string } | null }>("/api/auth/me");
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

  const register = useCallback(async (email: string, password: string) => {
    const res = await api<{ ok?: boolean; error?: string }>("/api/auth/register", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!res.ok) return { ok: false as const, error: res.error || 'register_failed' };
    return { ok: true as const };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ ok?: boolean; error?: string }>("/api/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    }).catch(async (e) => ({ ok: false, error: 'invalid_credentials' }));
    if (!('ok' in res) || !res.ok) {
      return { ok: false as const, error: (res as any)?.error || 'invalid_credentials' };
    }
    // Refresh me
    try {
      const me = await api<{ user: { id: string; email: string } | null }>("/api/auth/me");
      const emailNow = me.user?.email ?? null;
      if (emailNow) localStorage.setItem(CURRENT_USER_KEY, emailNow);
      else localStorage.removeItem(CURRENT_USER_KEY);
      setUser(emailNow);
      window.dispatchEvent(new CustomEvent("worldshards-auth-updated"));
    } catch {}
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await api<{ ok: boolean }>("/api/auth/logout", { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    window.dispatchEvent(new CustomEvent("worldshards-auth-updated"));
  }, []);

  const requestReset = useCallback(async (email: string) => {
    return api<{ ok: boolean; token?: string }>("/api/auth/request-reset", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    return api<{ ok?: boolean; error?: string }>("/api/auth/reset", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
      credentials: 'include',
    });
  }, []);

  return { user, isAuthenticated, register, login, logout, requestReset, resetPassword };
}