import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { I18nProvider } from "./i18n";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

function resetAllUserDataIfNeeded() {
  try {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const lastReset = localStorage.getItem('ps_last_reset');
    if (lastReset === todayKey) return;

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
      // Remove dados por usuário atual (mantém tema/idioma)
      if (currentUser && perUserPrefixes.some(p => key === `${p}${currentUser}`)) {
        keysToRemove.push(key);
      }
      // Chaves conhecidas que não dependem de sufixo de usuário
      if (key === 'worldshards-visibility-profile') keysToRemove.push(key);
    }

    keysToRemove.forEach(k => localStorage.removeItem(k));
    localStorage.setItem('ps_last_reset', todayKey);
  } catch {}
}

resetAllUserDataIfNeeded();

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
