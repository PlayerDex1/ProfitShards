import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { I18nProvider } from "./i18n";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

const RESET_VERSION = '2025-08-20-01';

function performOneTimeReset() {
  try {
    const currentUser = localStorage.getItem('worldshards-current-user');
    const perUserPrefixes = [
      'worldshards-form-',
      'worldshards-history-',
      'worldshards-equip-builds-',
      'worldshards-equip-history-',
      'worldshards-mapdrops-',
      'worldshards-prefs-',
      'worldshards-equipment-',
    ];

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (currentUser && perUserPrefixes.some(p => key === `${p}${currentUser}`)) {
        keysToRemove.push(key);
      }
      if (key === 'worldshards-visibility-profile') keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    localStorage.setItem('ps_reset_version', RESET_VERSION);
    localStorage.removeItem('ps_reset_target');
  } catch {}
}

function scheduleOneTimeMidnightReset() {
  try {
    if (localStorage.getItem('ps_reset_version') === RESET_VERSION) return;

    let target = localStorage.getItem('ps_reset_target');
    let targetMs: number;
    if (target) {
      targetMs = parseInt(target, 10);
    } else {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      targetMs = next.getTime();
      localStorage.setItem('ps_reset_target', String(targetMs));
    }

    const nowMs = Date.now();
    if (nowMs >= targetMs) {
      performOneTimeReset();
      return;
    }

    const delay = Math.max(0, targetMs - nowMs);
    setTimeout(() => {
      if (localStorage.getItem('ps_reset_version') === RESET_VERSION) return;
      performOneTimeReset();
    }, delay);
  } catch {}
}

// Force reset if URL contains ?reset=1 (one-time trigger per visit)
try {
  const url = new URL(window.location.href);
  const force = url.searchParams.get('reset');
  if (force === '1') {
    performOneTimeReset();
    // Clean the URL to avoid repeating
    url.searchParams.delete('reset');
    window.history.replaceState({}, '', url.toString());
  }
} catch {}

// Versioned automatic reset: runs once per RESET_VERSION on next visit
if (localStorage.getItem('ps_reset_version') !== RESET_VERSION) {
  performOneTimeReset();
}
scheduleOneTimeMidnightReset();

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <App />
    <SpeedInsights />
    <Analytics />
  </I18nProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}