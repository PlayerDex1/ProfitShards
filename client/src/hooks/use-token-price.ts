import { useState, useEffect, useCallback } from 'react';

interface TokenPriceData {
  price: number;
  cached: boolean;
  lastUpdate: number;
  source: string;
  error?: string;
}

interface UseTokenPriceReturn {
  price: number | null;
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
  source: string | null;
  refreshPrice: () => Promise<void>;
  isStale: boolean;
}

const TOKEN_PRICE_CACHE_KEY = 'worldshards-token-price-cache';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos (reduzido de 5 para 2)

// Token sendo testado atualmente
const CURRENT_TOKEN = 'Pudgy Penguins (PUDGY)';

export function useTokenPrice(): UseTokenPriceReturn {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [source, setSource] = useState<string | null>(null);

  // Função para buscar preço da API
  const fetchPrice = useCallback(async (): Promise<TokenPriceData | null> => {
    try {
      const response = await fetch('/api/prices/token');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch price');
      }
      
      return {
        price: data.price,
        cached: data.cached,
        lastUpdate: data.lastUpdate,
        source: data.source,
        error: data.error
      };
    } catch (err) {
      console.error('❌ [TOKEN PRICE] Error fetching price:', err);
      throw err;
    }
  }, []);

  // Função para atualizar preço
  const refreshPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const priceData = await fetchPrice();
      
      if (priceData) {
        setPrice(priceData.price);
        setLastUpdate(priceData.lastUpdate);
        setSource(priceData.source);
        
        // Salvar no cache local
        const cacheData = {
          price: priceData.price,
          lastUpdate: priceData.lastUpdate,
          source: priceData.source
        };
        localStorage.setItem(TOKEN_PRICE_CACHE_KEY, JSON.stringify(cacheData));
        
        console.log('✅ [TOKEN PRICE] Price updated successfully:', priceData.price);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ [TOKEN PRICE] Failed to refresh price:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchPrice]);

  // Carregar preço do cache local na inicialização
  useEffect(() => {
    try {
      const cached = localStorage.getItem(TOKEN_PRICE_CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        
        // Verificar se o cache ainda é válido
        if (now - cacheData.lastUpdate < CACHE_DURATION) {
          setPrice(cacheData.price);
          setLastUpdate(cacheData.lastUpdate);
          setSource(cacheData.source);
          console.log('💰 [TOKEN PRICE] Loaded from local cache:', cacheData.price);
        } else {
          // Cache expirado, buscar novo preço
          console.log('⏰ [TOKEN PRICE] Local cache expired, fetching fresh price...');
          refreshPrice();
        }
      } else {
        // Sem cache, buscar preço inicial
        console.log('🆕 [TOKEN PRICE] No local cache, fetching initial price...');
        refreshPrice();
      }
    } catch (err) {
      console.error('❌ [TOKEN PRICE] Error loading from cache:', err);
      // Em caso de erro no cache, buscar preço fresco
      refreshPrice();
    }
  }, [refreshPrice]);

  // Verificar se o preço está desatualizado
  const isStale = lastUpdate ? (Date.now() - lastUpdate) > CACHE_DURATION : true;

  return {
    price,
    loading,
    error,
    lastUpdate,
    source,
    refreshPrice,
    isStale
  };
}