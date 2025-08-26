import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, BarChart3, Target, Zap, RefreshCw, Trophy, DollarSign } from 'lucide-react';

interface CommunityStats {
  totalRuns: number;
  totalProfit: number;
  activePlayers: number;
  successRate: number;
  topMaps: Array<{
    map: string;
    count: number;
    avgTokens: number;
  }>;
  avgEfficiency: number;
  totalCalculations: number;
  lastUpdated: string;
}

interface StatsResponse {
  success: boolean;
  stats: CommunityStats;
  cached?: boolean;
  fallback?: boolean;
  timestamp: string;
}

export function CommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchStats = async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = force 
        ? `/api/stats/community-metrics?force=true&_=${Date.now()}`
        : '/api/stats/community-metrics';

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: force ? { 'Cache-Control': 'no-cache' } : {}
      });

      const result: StatsResponse = await response.json();

      if (result.success) {
        setStats(result.stats);
        setIsCached(result.cached || false);
        setIsFallback(result.fallback || false);
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      } else {
        setError('Erro ao carregar estatísticas');
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(() => fetchStats(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount}`;
  };

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground mb-4">
            {error || 'Erro ao carregar estatísticas'}
          </div>
          <Button onClick={() => fetchStats(true)} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com info de atualização */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">📊 Estatísticas da Comunidade</h3>
          <p className="text-sm text-muted-foreground">
            Dados reais dos usuários • 
            {lastUpdate && ` Atualizado: ${lastUpdate}`}
            {isCached && <span className="text-orange-500 ml-1">(cache)</span>}
            {isFallback && <span className="text-yellow-500 ml-1">(estimado)</span>}
          </p>
        </div>
        <Button 
          onClick={() => fetchStats(true)} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Runs */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(stats.totalRuns)}+
                </div>
                <div className="text-xs text-muted-foreground">Runs Esta Semana</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Profit */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.totalProfit)}
                </div>
                <div className="text-xs text-muted-foreground">Lucro Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Players */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(stats.activePlayers)}+
                </div>
                <div className="text-xs text-muted-foreground">Players Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.successRate}%
                </div>
                <div className="text-xs text-muted-foreground">Taxa Sucesso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Maps */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <h4 className="text-sm font-medium">Top Mapas Populares</h4>
            </div>
            <div className="space-y-2">
              {stats.topMaps.slice(0, 3).map((map, index) => (
                <div key={map.map} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{map.map}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{map.count} runs</div>
                    <div className="text-xs text-muted-foreground">
                      ~{map.avgTokens} tokens
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métricas extras */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-medium">Métricas Gerais</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Eficiência Média</span>
                <Badge variant={stats.avgEfficiency >= 90 ? 'default' : 'secondary'}>
                  {stats.avgEfficiency}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Cálculos</span>
                <span className="text-sm font-medium">
                  {formatNumber(stats.totalCalculations)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última Atualização</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(stats.lastUpdated).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rodapé informativo */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Todas as estatísticas são agregadas e anônimas • 
          🔄 Atualização automática a cada 5 minutos • 
          📊 Baseado em dados reais de usuários
        </p>
      </div>
    </div>
  );
}