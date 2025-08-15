import { useCallback, useEffect, useMemo, useState } from "react";

const USERS_KEY = "worldshards-users";
const CURRENT_USER_KEY = "worldshards-current-user";

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

function readUsers(): Record<string, { passHash: string }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, { passHash: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUsername(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    setUser(getCurrentUsername());
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  const login = useCallback(async (username: string, password: string) => {
    const trimmed = username.trim();
    if (!trimmed || !password) {
      return { ok: false, error: "Informe nick e senha" } as const;
    }
    const users = readUsers();
    const passHash = await sha256(password);

    if (!users[trimmed]) {
      // registro implícito
      users[trimmed] = { passHash };
      writeUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, trimmed);
      setUser(trimmed);
      window.dispatchEvent(new CustomEvent("worldshards-auth-updated"));
      return { ok: true, isNew: true } as const;
    }

    if (users[trimmed].passHash !== passHash) {
      return { ok: false, error: "Senha incorreta" } as const;
    }

    localStorage.setItem(CURRENT_USER_KEY, trimmed);
    setUser(trimmed);
    window.dispatchEvent(new CustomEvent("worldshards-auth-updated"));
    return { ok: true, isNew: false } as const;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    window.dispatchEvent(new CustomEvent("worldshards-auth-updated"));
  }, []);

  return { user, isAuthenticated, login, logout };
}