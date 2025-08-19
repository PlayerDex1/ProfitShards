import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * Desloga automaticamente o usuário após período de inatividade.
 * Não exibe timer; escuta eventos de atividade e reinicia o relógio.
 */
export function useIdleLogout(timeoutMs: number = Infinity) {
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
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (!Number.isFinite(timeoutMs)) return; // infinito: nunca agenda logout
      timerRef.current = window.setTimeout(() => {
        try { logout(); } catch {}
      }, timeoutMs);
    };

    const windowEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    windowEvents.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    document.addEventListener('visibilitychange', reset);
    reset();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      windowEvents.forEach((ev) => window.removeEventListener(ev, reset));
      document.removeEventListener('visibilitychange', reset);
    };
  }, [isAuthenticated, logout, timeoutMs]);
}