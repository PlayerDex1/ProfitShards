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
  const [userProfile, setUserProfile] = useState<{ email: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 [PROFITSHARDS AUTH] Checking auth status...');
      const me = await api<{ user: { id: string; email: string; username: string } | null }>("/api/auth/me");
      console.log('🔍 [PROFITSHARDS AUTH] Auth response:', me);
      
      const email = me.user?.email ?? null;
      const username = me.user?.username ?? null;
      if (email) {
        localStorage.setItem(CURRENT_USER_KEY, email);
        console.log('✅ [PROFITSHARDS AUTH] User authenticated:', email, 'username:', username);
        
        // Manter compatibilidade: user = email (string)
        setUser(email);
        
        // Novo: userProfile = objeto completo
        setUserProfile({ email, username: username || email.split('@')[0] });
        
        // Trigger migration if user just logged in
        try {
          const { migrateGuestToCurrentUser } = await import('@/lib/migrateGuestToAccount');
          await migrateGuestToCurrentUser();
          console.log('✅ [PROFITSHARDS AUTH] Data migration completed');
        } catch (migrationError) {
          console.error('❌ [PROFITSHARDS AUTH] Migration error:', migrationError);
        }
        
        // Dispatch auth updated event
        window.dispatchEvent(new CustomEvent("worldshards-auth-updated"));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
        console.log('❌ [PROFITSHARDS AUTH] No user authenticated');
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.log('❌ [PROFITSHARDS AUTH] Auth check failed:', error);
      localStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Verificar se já temos usuário no localStorage para resposta imediata
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      // Se temos usuário, usar imediatamente e verificar em background
      setUser(storedUser);
      setUserProfile({ email: storedUser, username: storedUser.split('@')[0] });
      setLoading(false);
      
      // Verificar em background se o usuário ainda é válido
      setTimeout(() => checkAuth(), 1000);
    } else {
      // Se não temos usuário, verificar uma vez
      checkAuth();
    }
  }, [checkAuth]);

  // Check for login success parameter and force refresh
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      console.log('🎉 [PROFITSHARDS AUTH] Login success detected, refreshing auth state');
      
      // Remove the parameter from URL
      urlParams.delete('login');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
      
      // Force immediate refresh
      console.log('🔄 [PROFITSHARDS AUTH] Immediate auth refresh...');
      checkAuth();
      
      // Apenas uma verificação adicional para garantir sincronização
      setTimeout(() => {
        console.log('🔄 [PROFITSHARDS AUTH] Final auth refresh...');
        checkAuth();
      }, 2000);
    }
  }, [checkAuth]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CURRENT_USER_KEY) {
        const newUser = localStorage.getItem(CURRENT_USER_KEY);
        console.log('🔄 [PROFITSHARDS AUTH] Storage event, new user:', newUser);
        setUser(newUser);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  // Manual refresh function for debugging
  const refreshAuth = useCallback(() => {
    console.log('🔄 [PROFITSHARDS AUTH] Manual refresh triggered');
    checkAuth();
  }, [checkAuth]);

  // Dummy functions to maintain compatibility (not needed for Google OAuth)
  const register = useCallback(async (email: string, password: string) => {
    return { ok: true as const };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 [PROFITSHARDS AUTH] Logging out...');
      await api<{ ok: boolean }>("/api/auth/logout", { method: 'POST', credentials: 'include' });
      console.log('✅ [PROFITSHARDS AUTH] Logout successful');
    } catch (error) {
      console.error('❌ [PROFITSHARDS AUTH] Logout error:', error);
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setUserProfile(null);
    window.dispatchEvent(new CustomEvent("worldshards-auth-updated"));
  }, []);

  const requestReset = useCallback(async (email: string) => {
    return { ok: true, token: "dummy-token" };
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    return { ok: true as const };
  }, []);

  return { user, userProfile, isAuthenticated, loading, register, login, logout, requestReset, resetPassword, refreshAuth };
}