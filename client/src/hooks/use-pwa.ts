import { useState, useEffect } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Verificar se o app está instalado
  useEffect(() => {
    const checkInstalled = () => {
      // Verificar se está rodando como PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInApp = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInApp);
    };

    checkInstalled();
    window.addEventListener('resize', checkInstalled);
    return () => window.removeEventListener('resize', checkInstalled);
  }, []);

  // Escutar prompt de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as any);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Escutar quando o app é instalado
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ [PWA] Service Worker registered:', registration);
          setSwRegistration(registration);
          
          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  console.log('🔄 [PWA] New version available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ [PWA] Service Worker registration failed:', error);
        });
    }
  }, []);

  // Instalar PWA
  const installPWA = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ [PWA] User accepted the install prompt');
        return true;
      } else {
        console.log('❌ [PWA] User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('❌ [PWA] Error during installation:', error);
      return false;
    }
  };

  // Atualizar Service Worker
  const updateSW = async () => {
    if (!swRegistration) return;

    try {
      await swRegistration.update();
      console.log('🔄 [PWA] Service Worker updated');
    } catch (error) {
      console.error('❌ [PWA] Error updating Service Worker:', error);
    }
  };

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('❌ [PWA] This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ [PWA] Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('❌ [PWA] Error requesting notification permission:', error);
      return false;
    }
  };

  // Enviar notificação
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted' && swRegistration) {
      swRegistration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA,
    updateSW,
    requestNotificationPermission,
    sendNotification,
    swRegistration,
  };
}