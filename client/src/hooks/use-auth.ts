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
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const me = await api<{ user: { id: string; email: string; username: string } | null }>("/api/auth/me");
      const email = me.user?.email ?? null;
      if (email) {
        localStorage.setItem(CURRENT_USER_KEY, email);
        console.log('User authenticated:', email);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
        console.log('No user authenticated');
      }
      setUser(email);
    } catch (error) {
      console.log('Auth check failed:', error);
      localStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check for login success parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      console.log('Login success detected, refreshing auth state');
      // Remove the parameter from URL
      urlParams.delete('login');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
      
      // Refresh auth state after a brief delay
      setTimeout(() => {
        checkAuth();
      }, 1000);
    }
  }, [checkAuth]);

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
      console.log('Logout successful');
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

  return { user, isAuthenticated, loading, register, login, logout, requestReset, resetPassword };
}