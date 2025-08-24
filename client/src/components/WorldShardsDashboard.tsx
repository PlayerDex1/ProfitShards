import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useI18n } from '../i18n';
import { TrendingUp, TrendingDown, Users, Target, Zap, MapPin, Clock, Trophy } from 'lucide-react';

interface DashboardStats {
  totalFarms: number;
  totalTokens: number;
  averageEfficiency: number;
  activeUsers: number;
  topMaps: { name: string; count: number; efficiency: number }[];
  recentActivity: { user: string; tokens: number; map: string; time: string }[];
  hourlyStats: { hour: number; farms: number; tokens: number }[];
  efficiency: { current: number; change: number; trend: 'up' | 'down' }[];
}

export function WorldShardsDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Mock data para demonstração - substituir por dados reais da API
  const mockStats: DashboardStats = {
    totalFarms: 1247,
    totalTokens: 89543,
    averageEfficiency: 71.8,
    activeUsers: 89,
    topMaps: [
      { name: 'Large Map', count: 543, efficiency: 85.2 },
      { name: 'Medium Map', count: 421, efficiency: 78.9 },
      { name: 'Small Map', count: 283, efficiency: 65.4 },
      { name: 'XLarge Map', count: 156, efficiency: 92.1 },
    ],
    recentActivity: [
      { user: 'PlayerX', tokens: 1250, map: 'Large', time: '2 min ago' },
      { user: 'FarmerY', tokens: 890, map: 'Medium', time: '5 min ago' },
      { user: 'TokenZ', tokens: 2100, map: 'XLarge', time: '8 min ago' },
      { user: 'ShardA', tokens: 650, map: 'Small', time: '12 min ago' },
      { user: 'LuckB', tokens: 1800, map: 'Large', time: '15 min ago' },
    ],
    hourlyStats: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      farms: Math.floor(Math.random() * 100) + 20,
      tokens: Math.floor(Math.random() * 5000) + 1000,
    })),
    efficiency: [
      { current: 71.8, change: 5.2, trend: 'up' },
      { current: 68.3, change: -2.1, trend: 'down' },
      { current: 74.5, change: 8.7, trend: 'up' },
      { current: 69.9, change: -1.3, trend: 'down' },
    ]
  };

  useEffect(() => {
    setLoading(true);
    // Simular carregamento de dados
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros de tempo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('test.worldshards')}</h1>
          <p className="text-muted-foreground">{t('test.subtitle')}</p>
        </div>
        <div className="flex space-x-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('test.totalFarms')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalFarms.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('test.totalTokens')}</p>
                <p className="text-2xl font-bold text-green-600">{stats?.totalTokens.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('test.avgEfficiency')}</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.averageEfficiency}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('test.activeUsers')}</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade por Hora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>{t('test.hourlyActivity')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.hourlyStats.slice(0, 12).map((hour, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{hour.hour}:00</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${(hour.farms / 120) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{hour.farms}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Maps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>{t('test.topMaps')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topMaps.map((map, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">{map.name}</p>
                      <p className="text-sm text-muted-foreground">{map.count} farms</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{map.efficiency}%</p>
                    <p className="text-xs text-muted-foreground">efficiency</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>{t('test.recentActivity')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{activity.user[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.map} Map</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{activity.tokens.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Trends */}
      <Card>
        <CardHeader>
          <CardTitle>{t('test.efficiencyTrends')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.efficiency.map((eff, i) => (
              <div key={i} className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {eff.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${eff.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {eff.change > 0 ? '+' : ''}{eff.change}%
                  </span>
                </div>
                <p className="text-2xl font-bold">{eff.current}%</p>
                <p className="text-xs text-muted-foreground">Period {i + 1}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}