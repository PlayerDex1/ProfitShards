import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * Desloga automaticamente o usuário após período de inatividade.
 * Não exibe timer; escuta eventos de atividade e reinicia o relógio.
 */
export function useIdleLogout(timeoutMs: number = 15 * 60 * 1000) {
  const { isAuthenticated, logout } = useAuth();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const reset = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        try {
          logout();
        } catch {}
      }, timeoutMs);
    };

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'visibilitychange',
    ];

    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [isAuthenticated, logout, timeoutMs]);
}