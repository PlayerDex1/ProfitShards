import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isInstalled: boolean;
  isActive: boolean;
  isOnline: boolean;
  isOffline: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isInstalled: false,
    isActive: false,
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    registration: null,
    error: null
  });

  // Registrar service worker
  const registerServiceWorker = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Service Worker não é suportado' }));
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('🚀 [SW] Service Worker registrado:', registration);

      setState(prev => ({
        ...prev,
        registration,
        isInstalled: true,
        error: null
      }));

      // Aguardar ativação
      await navigator.serviceWorker.ready;
      
      setState(prev => ({
        ...prev,
        isActive: true
      }));

      return true;
    } catch (error) {
      console.error('❌ [SW] Falha ao registrar Service Worker:', error);
      setState(prev => ({
        ...prev,
        error: `Falha ao registrar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }));
      return false;
    }
  }, [state.isSupported]);

  // Atualizar service worker
  const updateServiceWorker = useCallback(async () => {
    if (!state.registration) return false;

    try {
      await state.registration.update();
      console.log('🔄 [SW] Service Worker atualizado');
      return true;
    } catch (error) {
      console.error('❌ [SW] Falha ao atualizar Service Worker:', error);
      return false;
    }
  }, [state.registration]);

  // Limpar cache
  const clearCache = useCallback(async () => {
    if (!state.registration) return false;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('🧹 [SW] Cache limpo');
      
      // Recarregar página para aplicar mudanças
      window.location.reload();
      
      return true;
    } catch (error) {
      console.error('❌ [SW] Falha ao limpar cache:', error);
      return false;
    }
  }, [state.registration]);

  // Enviar mensagem para service worker
  const sendMessage = useCallback(async (type: string, data?: any) => {
    if (!state.registration?.active) return false;

    try {
      state.registration.active.postMessage({ type, data });
      console.log('📤 [SW] Mensagem enviada:', { type, data });
      return true;
    } catch (error) {
      console.error('❌ [SW] Falha ao enviar mensagem:', error);
      return false;
    }
  }, [state.registration]);

  // Sincronizar dados offline
  const syncOfflineData = useCallback(async () => {
    if (!state.registration) return false;

    try {
      // Registrar sync para quando voltar online
      if ('sync' in state.registration) {
        await (state.registration as any).sync.register('background-sync');
        console.log('🔄 [SW] Background sync registrado');
      }
      
      return true;
    } catch (error) {
      console.error('❌ [SW] Falha ao registrar background sync:', error);
      return false;
    }
  }, [state.registration]);

  // Verificar atualizações
  const checkForUpdates = useCallback(async () => {
    if (!state.registration) return false;

    try {
      await state.registration.update();
      
      // Verificar se há nova versão
      const newWorker = state.registration.installing || state.registration.waiting;
      
      if (newWorker) {
        console.log('🆕 [SW] Nova versão disponível');
        
        // Aguardar instalação
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            console.log('✅ [SW] Nova versão instalada');
            
            // Perguntar ao usuário se quer atualizar
            if (confirm('Nova versão disponível! Deseja atualizar agora?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ [SW] Falha ao verificar atualizações:', error);
      return false;
    }
  }, [state.registration]);

  // Efeitos
  useEffect(() => {
    // Registrar service worker automaticamente
    registerServiceWorker();

    // Listener para mudanças de conectividade
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true, isOffline: false }));
      console.log('🌐 [SW] Conexão restaurada');
      
      // Sincronizar dados offline quando voltar online
      if (state.registration) {
        syncOfflineData();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false, isOffline: true }));
      console.log('📡 [SW] Conexão perdida');
    };

    // Listener para mudanças do service worker
    const handleControllerChange = () => {
      setState(prev => ({ ...prev, isActive: !!navigator.serviceWorker.controller }));
    };

    const handleMessage = (event: MessageEvent) => {
      console.log('📨 [SW] Mensagem recebida:', event.data);
      
      // Processar mensagens do service worker
      switch (event.data.type) {
        case 'CACHE_UPDATED':
          console.log('💾 [SW] Cache atualizado');
          break;
        case 'OFFLINE_DATA_SYNCED':
          console.log('✅ [SW] Dados offline sincronizados');
          break;
        default:
          console.log('📨 [SW] Mensagem desconhecida:', event.data);
      }
    };

    // Adicionar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Verificar atualizações periodicamente
    const updateInterval = setInterval(checkForUpdates, 1000 * 60 * 60); // 1 hora

    return () => {
      // Remover listeners
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      
      // Limpar intervalo
      clearInterval(updateInterval);
    };
  }, [registerServiceWorker, syncOfflineData, checkForUpdates, state.registration]);

  // Efeito para verificar status inicial
  useEffect(() => {
    if (state.registration) {
      setState(prev => ({
        ...prev,
        isActive: !!navigator.serviceWorker.controller,
        isInstalled: !!state.registration.installing || !!state.registration.waiting || !!state.registration.active
      }));
    }
  }, [state.registration]);

  return {
    ...state,
    registerServiceWorker,
    updateServiceWorker,
    clearCache,
    sendMessage,
    syncOfflineData,
    checkForUpdates
  };
}