import { useState, useEffect, useCallback } from 'react';
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

export function useDataSync() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  // Migrar dados do localStorage para o banco quando usuário faz login
  const migrateLocalDataToServer = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    try {
      // 1. Migrar histórico de cálculos
      const localHistory = localStorage.getItem('worldshards-history');
      if (localHistory) {
        const historyItems: HistoryItem[] = JSON.parse(localHistory);
        
        for (const item of historyItems) {
          try {
            await fetch('/api/user/save-calculation', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'profit',
                data: item.formData,
                results: item.results
              })
            });
          } catch (error) {
            console.warn('Failed to migrate history item:', error);
          }
        }
      }

      // 2. Migrar dados do formulário como preferências
      const formKey = `worldshards-form-${user}`;
      const localFormData = localStorage.getItem(formKey);
      if (localFormData) {
        const formData: CalculatorFormData = JSON.parse(localFormData);
        
        await fetch('/api/user/save-preferences', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              calculatorFormData: formData,
              migratedAt: Date.now()
            }
          })
        });
      }

      console.log('✅ Dados migrados do localStorage para o servidor');
      setLastSync(Date.now());
      
    } catch (error) {
      console.error('❌ Erro ao migrar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Carregar dados do servidor
  const loadServerData = useCallback(async (): Promise<UserData | null> => {
    if (!isAuthenticated) return null;

    try {
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
      return result.data;
    } catch (error) {
      console.error('❌ Erro ao carregar dados do servidor:', error);
      return null;
    }
  }, [isAuthenticated]);

  // Salvar cálculo no servidor
  const saveCalculationToServer = useCallback(async (formData: CalculatorFormData, results: any) => {
    if (!isAuthenticated) return false;

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

      console.log('✅ Cálculo salvo no servidor');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar cálculo no servidor:', error);
      return false;
    }
  }, [isAuthenticated]);

  // Salvar preferências no servidor
  const savePreferencesToServer = useCallback(async (preferences: any) => {
    if (!isAuthenticated) return false;

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

      console.log('✅ Preferências salvas no servidor');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar preferências no servidor:', error);
      return false;
    }
  }, [isAuthenticated]);

  // Executar migração quando usuário faz login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Verificar se já migrou recentemente (evitar migração repetida)
      const lastMigration = localStorage.getItem('last-data-migration');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 horas

      if (!lastMigration || (now - parseInt(lastMigration)) > oneDay) {
        console.log('🔄 Iniciando migração de dados do localStorage para o servidor...');
        migrateLocalDataToServer();
        localStorage.setItem('last-data-migration', now.toString());
      }
    }
  }, [isAuthenticated, user, migrateLocalDataToServer]);

  return {
    isLoading,
    lastSync,
    migrateLocalDataToServer,
    loadServerData,
    saveCalculationToServer,
    savePreferencesToServer
  };
}