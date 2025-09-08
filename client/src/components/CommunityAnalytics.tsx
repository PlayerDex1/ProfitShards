import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, TrendingUp, Calculator, Map, 
  BarChart3, Activity, Target, Zap,
  RefreshCw, Calendar, Award, Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

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

interface TrendData {
  date: string;
  users: number;
  calculations: number;
  profit: number;
}

export function CommunityAnalytics() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
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
      console.error('❌ Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrends = async () => {
    try {
      // Simular dados de tendências para teste
      const mockTrends = [
        { date: '2025-09-08', users: 5, calculations: 25, profit: 1000 },
        { date: '2025-09-07', users: 3, calculations: 15, profit: 750 },
        { date: '2025-09-06', users: 7, calculations: 35, profit: 1200 }
      ];
      setTrends(mockTrends);
      console.log('📈 Tendências simuladas carregadas:', mockTrends);
    } catch (err) {
      console.error('❌ Erro ao carregar tendências:', err);
    }
  };

  useEffect(() => {
    loadStats();
    loadTrends();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatProfit = (profit: number): string => {
    if (profit >= 1000000000) return `$${(profit / 1000000000).toFixed(1)}B`;
    if (profit >= 1000000) return `$${(profit / 1000000).toFixed(1)}M`;
    if (profit >= 1000) return `$${(profit / 1000).toFixed(1)}K`;
    return `$${profit.toFixed(0)}`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Sempre mostrar conteúdo, mesmo se loading ou error
  if (loading) {
    console.log('🔄 CommunityAnalytics: Carregando...');
  }

  if (error) {
    console.log('❌ CommunityAnalytics: Erro:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análise da Comunidade</h2>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cálculos</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalCalculations || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Todos os tempos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Farmados</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalTokens || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapas Planejados</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalMaps || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Estratégias criadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tendências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendências dos Últimos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="calculations" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Dados de tendências não disponíveis</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Atividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribuição de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Cálculos de Lucro</span>
                </div>
                <Badge variant="secondary">{stats?.totalCalculations || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Mapas Planejados</span>
                </div>
                <Badge variant="secondary">{stats?.totalMaps || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Usuários Ativos</span>
                </div>
                <Badge variant="secondary">{stats?.activeUsers || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.successRate || 0}%
            </div>
              <p className="text-sm text-muted-foreground">
                Cálculos com eficiência &gt; 50%
              </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Eficiência Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats?.avgEfficiency || 0}%
            </div>
            <p className="text-sm text-muted-foreground">
              Performance média da comunidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lucro Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatProfit(stats?.totalProfit || 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              Acumulado da comunidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Atualização */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Última atualização: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'N/A'}</span>
            </div>
            <Button onClick={loadStats} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}