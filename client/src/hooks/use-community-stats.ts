import { useState, useEffect } from 'react';

interface CommunityStats {
  activeUsers: number;
  totalCalculations: number;
  successRate: number;
  satisfaction: number;
  totalProfit: number;
  totalTokens: number;
  totalMaps: number;
  avgEfficiency: number;
  lastUpdated: number;
}

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/community/stats', {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
        console.log('📊 Estatísticas da comunidade carregadas:', result.stats);
      } else {
        setError(result.error || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('❌ Erro ao carregar estatísticas da comunidade:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  };
}