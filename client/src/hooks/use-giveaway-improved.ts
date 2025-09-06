import { useState, useEffect, useCallback, useRef } from "react";
import { Giveaway } from "@/types/giveaway";

interface UseGiveawayOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseGiveawayReturn {
  currentGiveaway: Giveaway | null;
  participateInGiveaway: (giveawayId: string) => Promise<boolean>;
  isParticipating: boolean;
  isLoading: boolean;
  error: string | null;
  refreshGiveaway: () => Promise<void>;
}

export function useGiveawayImproved(options: UseGiveawayOptions = {}): UseGiveawayReturn {
  const {
    timeout = 5000,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [currentGiveaway, setCurrentGiveaway] = useState<Giveaway | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // Função para buscar giveaway ativo com retry e timeout
  const fetchActiveGiveaway = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/giveaways/active', {
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      if (data.giveaway) {
        setCurrentGiveaway(data.giveaway);
        retryCountRef.current = 0; // Reset retry count on success
        console.log('✅ [GIVEAWAY] Dados carregados com sucesso:', data.giveaway.title);
      } else {
        setCurrentGiveaway(null);
        console.log('ℹ️ [GIVEAWAY] Nenhum giveaway ativo encontrado');
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      if (err instanceof Error && err.name === 'AbortError') {
        console.log('⏰ [GIVEAWAY] Requisição cancelada');
        return;
      }

      console.error('❌ [GIVEAWAY] Erro na busca:', err);
      
      // Tentar novamente se não excedeu o limite
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        console.log(`🔄 [GIVEAWAY] Tentativa ${retryCountRef.current}/${retryAttempts} em ${retryDelay}ms`);
        
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchActiveGiveaway();
          }
        }, retryDelay);
      } else {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        retryCountRef.current = 0;
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [timeout, retryAttempts, retryDelay]);

  // Função para participar do giveaway
  const participateInGiveaway = useCallback(async (giveawayId: string): Promise<boolean> => {
    if (isParticipating || !currentGiveaway) return false;

    try {
      setIsParticipating(true);
      setError(null);

      const response = await fetch('/api/giveaways/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ giveawayId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [GIVEAWAY] Participação confirmada');
        // Recarregar dados do giveaway
        await fetchActiveGiveaway();
        return true;
      } else {
        throw new Error(result.error || 'Erro ao participar');
      }
    } catch (err) {
      console.error('❌ [GIVEAWAY] Erro na participação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao participar');
      return false;
    } finally {
      setIsParticipating(false);
    }
  }, [isParticipating, currentGiveaway, fetchActiveGiveaway]);

  // Função para refresh manual
  const refreshGiveaway = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0; // Reset retry count for manual refresh
    await fetchActiveGiveaway();
  }, [fetchActiveGiveaway]);

  // Effect para buscar giveaway inicial
  useEffect(() => {
    isMountedRef.current = true;
    fetchActiveGiveaway();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchActiveGiveaway]);

  // Effect para cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Effect para escutar mudanças no localStorage (opcional)
  useEffect(() => {
    const handleStorageChange = () => {
      if (isMountedRef.current) {
        fetchActiveGiveaway();
      }
    };

    window.addEventListener('giveaway-data-updated', handleStorageChange);
    window.addEventListener('main-giveaways-updated', handleStorageChange);

    return () => {
      window.removeEventListener('giveaway-data-updated', handleStorageChange);
      window.removeEventListener('main-giveaways-updated', handleStorageChange);
    };
  }, [fetchActiveGiveaway]);

  return {
    currentGiveaway,
    participateInGiveaway,
    isParticipating,
    isLoading,
    error,
    refreshGiveaway
  };
}