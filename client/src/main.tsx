import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { I18nProvider } from "./i18n";

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🎉 PWA: Service Worker registered successfully:', registration.scope);
        
        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          console.log('🔄 PWA: New version available');
        });
      })
      .catch((error) => {
        console.log('❌ PWA: Service Worker registration failed:', error);
      });
  });
}

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

// scheduleOneTimeMidnightReset removed (no automatic reset)

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

// Automatic resets disabled as requested; keep only manual URL trigger above

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}