import { useState, useEffect, useCallback } from 'react';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalCalculations: number;
    totalProfit: number;
    averageROI: number;
    successRate: number;
    activeUsersToday: number;
    calculationsToday: number;
    bestProfit: number;
    averageEfficiency: number;
  };
  recentActivity: {
    recentCalculations: any[];
    recentUsers: any[];
    topPerformers: any[];
  };
  mapAnalytics: {
    mapSizeStats: any[];
    levelTierStats: any[];
    hourlyActivity: any[];
  };
  userMetrics: {
    newUsersToday: number;
    returningUsers: number;
    averageSessionTime: number;
    mostActiveHours: string[];
  };
  systemHealth: {
    databaseStatus: 'healthy' | 'warning' | 'error';
    cacheStatus: 'active' | 'inactive';
    lastUpdate: string;
  };
}

interface DashboardResponse {
  success: boolean;
  data: DashboardStats | null;
  error?: string;
  timestamp: string;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const url = forceRefresh 
        ? `/api/admin/dashboard-stats?_=${Date.now()}`
        : '/api/admin/dashboard-stats';

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DashboardResponse = await response.json();
      
      if (data.success && data.data) {
        setStats(data.data);
        setLastUpdate(data.timestamp);
      } else {
        setError(data.error || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas do dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [fetchStats]);

  // Formatação de números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s atrás`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}min atrás`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    }
  };

  return {
    stats,
    loading,
    error,
    lastUpdate,
    isRefreshing,
    refreshStats,
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatTimeAgo
  };
}