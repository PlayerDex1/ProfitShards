import { useCallback, useEffect, useMemo, useState } from "react";

const CURRENT_USER_KEY = "worldshards-current-user";

export function getCurrentUsername(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY) || "Usuário Local";
}

export function useAuth() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Always set a local user for offline functionality
    const localUser = localStorage.getItem(CURRENT_USER_KEY) || "Usuário Local";
    localStorage.setItem(CURRENT_USER_KEY, localUser);
    setUser(localUser);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  // Dummy functions to maintain compatibility
  const register = useCallback(async (email: string, password: string) => {
    return { ok: true as const };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    // Keep user as local user, don't actually logout
    const localUser = "Usuário Local";
    localStorage.setItem(CURRENT_USER_KEY, localUser);
    setUser(localUser);
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