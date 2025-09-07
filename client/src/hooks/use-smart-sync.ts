import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { CalculatorFormData } from '@/types/calculator';
import { HistoryItem } from '@/types/calculator';

interface UserData {
  calculations: any[];
  preferences: any;
  equipmentBuilds: any[];
  mapDrops: any[];
  activity: any[];
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const CACHE_TTL = {
  CALCULATIONS: 5 * 60 * 1000, // 5 minutes
  PREFERENCES: 10 * 60 * 1000, // 10 minutes
  MAP_DROPS: 2 * 60 * 1000, // 2 minutes
  EQUIPMENT: 15 * 60 * 1000, // 15 minutes
};

export function useSmartSync() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const syncQueueRef = useRef<Array<() => Promise<void>>>([]);
  const isProcessingQueueRef = useRef(false);

  // Cache inteligente com TTL
  const getCachedData = useCallback((key: string): any | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return entry.data;
  }, []);

  const setCachedData = useCallback((key: string, data: any, ttl: number) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, []);

  // Sistema de fila para sincronização
  const processSyncQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || syncQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    setSyncStatus('syncing');

    try {
      while (syncQueueRef.current.length > 0) {
        const syncTask = syncQueueRef.current.shift();
        if (syncTask) {
          await syncTask();
        }
      }
      setSyncStatus('success');
      setLastSync(Date.now());
    } catch (error) {
      console.error('❌ Erro na fila de sincronização:', error);
      setSyncStatus('error');
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, []);

  // Adicionar tarefa à fila de sincronização
  const queueSyncTask = useCallback((task: () => Promise<void>) => {
    syncQueueRef.current.push(task);
    processSyncQueue();
  }, [processSyncQueue]);

  // Carregar dados do servidor com cache inteligente
  const loadServerData = useCallback(async (forceRefresh = false): Promise<UserData | null> => {
    if (!isAuthenticated) return null;

    const cacheKey = `server-data-${user}`;
    
    // Verificar cache primeiro
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log('📦 Dados carregados do cache');
        return cachedData;
      }
    }

    try {
      console.log('🌐 Carregando dados do servidor...');
      const response = await fetch('/api/user/get-data', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load server data');
      }

      const result = await response.json();
      const userData = result.data;

      // Cachear dados por 5 minutos
      setCachedData(cacheKey, userData, CACHE_TTL.CALCULATIONS);
      
      console.log('✅ Dados carregados do servidor e cacheados');
      return userData;
    } catch (error) {
      console.error('❌ Erro ao carregar dados do servidor:', error);
      return null;
    }
  }, [isAuthenticated, user, getCachedData, setCachedData]);

  // Salvar cálculo no servidor com retry automático
  const saveCalculationToServer = useCallback(async (formData: CalculatorFormData, results: any, retryCount = 0): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const maxRetries = 3;
    
    try {
      const response = await fetch('/api/user/save-calculation', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'profit',
          data: formData,
          results: results
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save calculation');
      }

      // Invalidar cache após salvar
      cacheRef.current.delete(`server-data-${user}`);
      
      console.log('✅ Cálculo salvo no servidor');
      return true;
    } catch (error) {
      console.error(`❌ Erro ao salvar cálculo (tentativa ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        // Retry com backoff exponencial
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return saveCalculationToServer(formData, results, retryCount + 1);
      }
      
      return false;
    }
  }, [isAuthenticated, user]);

  // Salvar map drop no servidor com retry
  const saveMapDropToServer = useCallback(async (mapDropData: any, retryCount = 0): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const maxRetries = 3;
    
    try {
      const response = await fetch('/api/user/save-calculation', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'mapdrops',
          data: mapDropData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save map drop');
      }

      // Invalidar cache após salvar
      cacheRef.current.delete(`server-data-${user}`);
      
      console.log('✅ Map drop salvo no servidor');
      return true;
    } catch (error) {
      console.error(`❌ Erro ao salvar map drop (tentativa ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return saveMapDropToServer(mapDropData, retryCount + 1);
      }
      
      return false;
    }
  }, [isAuthenticated, user]);

  // Salvar preferências no servidor
  const savePreferencesToServer = useCallback(async (preferences: any): Promise<boolean> => {
    if (!isAuthenticated) return false;

    return new Promise((resolve) => {
      queueSyncTask(async () => {
        try {
          const response = await fetch('/api/user/save-preferences', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences)
          });

          if (!response.ok) {
            throw new Error('Failed to save preferences');
          }

          // Invalidar cache após salvar
          cacheRef.current.delete(`server-data-${user}`);
          
          console.log('✅ Preferências salvas no servidor');
          resolve(true);
        } catch (error) {
          console.error('❌ Erro ao salvar preferências no servidor:', error);
          resolve(false);
        }
      });
    });
  }, [isAuthenticated, user, queueSyncTask]);

  // Sincronização em tempo real (polling inteligente)
  const startRealtimeSync = useCallback(() => {
    if (!isAuthenticated) return;

    const syncInterval = setInterval(async () => {
      try {
        const serverData = await loadServerData(true); // Force refresh
        if (serverData) {
          // Verificar se há novos dados e atualizar UI
          window.dispatchEvent(new CustomEvent('server-data-updated', {
            detail: serverData
          }));
        }
      } catch (error) {
        console.warn('⚠️ Erro na sincronização em tempo real:', error);
      }
    }, 30000); // Sincronizar a cada 30 segundos

    return () => clearInterval(syncInterval);
  }, [isAuthenticated, loadServerData]);

  // Migração inteligente de dados
  const migrateLocalDataToServer = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    setSyncStatus('syncing');

    try {
      console.log('🔄 Iniciando migração inteligente...');

      // 1. Migrar histórico de cálculos
      const localHistory = localStorage.getItem('worldshards-history');
      if (localHistory) {
        const historyItems: HistoryItem[] = JSON.parse(localHistory);
        console.log(`📊 Migrando ${historyItems.length} cálculos...`);
        
        for (const item of historyItems) {
          await saveCalculationToServer(item.formData, item.results);
          await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
        }
      }

      // 2. Migrar map drops
      const localMapDrops = localStorage.getItem('worldshards-map-drops');
      if (localMapDrops) {
        const mapDrops = JSON.parse(localMapDrops);
        console.log(`🗺️ Migrando ${mapDrops.length} map drops...`);
        
        for (const drop of mapDrops) {
          await saveMapDropToServer(drop);
          await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
        }
      }

      // 3. Migrar preferências
      const formKey = `worldshards-form-${user}`;
      const localFormData = localStorage.getItem(formKey);
      if (localFormData) {
        const formData: CalculatorFormData = JSON.parse(localFormData);
        await savePreferencesToServer({
          data: {
            calculatorFormData: formData,
            migratedAt: Date.now()
          }
        });
      }

      console.log('✅ Migração inteligente concluída!');
      setSyncStatus('success');
      setLastSync(Date.now());
      
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, saveCalculationToServer, saveMapDropToServer, savePreferencesToServer]);

  // Iniciar sincronização em tempo real quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const cleanup = startRealtimeSync();
      return cleanup;
    }
  }, [isAuthenticated, startRealtimeSync]);

  // Executar migração quando usuário faz login
  useEffect(() => {
    if (isAuthenticated && user) {
      const lastMigration = localStorage.getItem('last-data-migration');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      if (!lastMigration || (now - parseInt(lastMigration)) > oneDay) {
        console.log('🔄 Iniciando migração inteligente...');
        migrateLocalDataToServer();
        localStorage.setItem('last-data-migration', now.toString());
      }
    }
  }, [isAuthenticated, user, migrateLocalDataToServer]);

  return {
    isLoading,
    lastSync,
    syncStatus,
    loadServerData,
    saveCalculationToServer,
    saveMapDropToServer,
    savePreferencesToServer,
    migrateLocalDataToServer,
    queueSyncTask,
    getCachedData,
    setCachedData
  };
}