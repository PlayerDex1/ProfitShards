import { useState, useEffect } from 'react';

interface GlobalStats {
  totalUsers: number;
  totalCalculations: number;
  totalProfit: number;
  averageROI: number;
  successRate: number;
  activeUsersToday: number;
  calculationsToday: number;
  bestProfit: number;
  averageEfficiency: number;
  totalMapRuns: number;
  totalTokensFarmed: number;
  totalGiveaways: number;
  totalParticipants: number;
}

interface GlobalStatsResponse {
  success: boolean;
  data: GlobalStats;
  timestamp: string;
  period: string;
  error?: string;
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stats/global', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GlobalStatsResponse = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Erro ao carregar estatísticas');
        setStats(data.data); // Usar dados de fallback
      }
    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas globais:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Dados de fallback em caso de erro
      setStats({
        totalUsers: 0,
        totalCalculations: 0,
        totalProfit: 0,
        averageROI: 0,
        successRate: 0,
        activeUsersToday: 0,
        calculationsToday: 0,
        bestProfit: 0,
        averageEfficiency: 0,
        totalMapRuns: 0,
        totalTokensFarmed: 0,
        totalGiveaways: 0,
        totalParticipants: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Atualizar estatísticas a cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return '$' + (num / 1000).toFixed(1) + 'K';
    }
    return '$' + num.toFixed(2);
  };

  const formatPercentage = (num: number): string => {
    return num.toFixed(1) + '%';
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    formatNumber,
    formatCurrency,
    formatPercentage,
  };
}