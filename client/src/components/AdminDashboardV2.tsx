import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../hooks/use-auth';
import { useI18n } from '../i18n';
import { 
  TrendingUp, TrendingDown, Users, Target, Zap, MapPin, Clock, Trophy, 
  Activity, BarChart3, Database, RefreshCw, Calendar, Percent, Star, 
  Timer, ArrowUp, ArrowDown, Eye, Filter, PieChart, LineChart, Award, 
  Flame, Map, Shield, Crown, Gauge, Hash, UserCheck, AlertCircle
} from 'lucide-react';

interface MapAnalytics {
  mapSizeStats: {
    mapSize: string;
    totalRuns: number;
    avgTokens: number;
    avgEfficiency: number;
    topLevel: string;
    topTier: string;
    avgCharge: number;
  }[];
  levelTierStats: {
    level: string;
    tier: string;
    runs: number;
    avgTokens: number;
    avgEfficiency: number;
    popularMapSize: string;
  }[];
  chargeEfficiency: {
    chargeRange: string;
    runs: number;
    avgTokens: number;
    avgEfficiency: number;
  }[];
  hourlyActivity: {
    hour: number;
    runs: number;
    avgTokens: number;
    popularLevel: string;
  }[];
  userBehaviorPatterns: {
    totalUniqueUsers: number;
    avgRunsPerUser: number;
    casualUsers: number;
    regularUsers: number;
    powerUsers: number;
  };
  recentActivity: {
    last24h: number;
    last7d: number;
    last30d: number;
    growthRate: number;
  };
}

export function AdminDashboardV2() {
  const { user } = useAuth();
  const { t } = useI18n();
  
  const [activeSection, setActiveSection] = useState<'overview' | 'maps' | 'users' | 'realtime'>('overview');
  const [mapAnalytics, setMapAnalytics] = useState<MapAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Verificar se é admin
  const isAdmin = user && ['holdboy01@gmail.com', 'profitshards@gmail.com', 'admin@profitshards.com'].includes(user);

  const loadMapAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/map-analytics', {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      
      if (result.success) {
        setMapAnalytics(result.data);
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      } else {
        setError(result.error || 'Erro ao carregar analytics');
      }
    } catch (error) {
      console.error('Erro ao carregar map analytics:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadMapAnalytics();
      // Auto-refresh a cada 5 minutos
      const interval = setInterval(loadMapAnalytics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Esta seção é exclusiva para administradores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatPercent = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.8) return 'text-green-600';
    if (efficiency >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">📊 Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Analytics avançados e métricas dos usuários
            {lastUpdate && <span className="ml-2">• Atualizado: {lastUpdate}</span>}
          </p>
        </div>
        <Button onClick={loadMapAnalytics} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: '📊 Visão Geral', icon: BarChart3 },
              { id: 'maps', label: '🗺️ Mapas & Farming', icon: Map },
              { id: 'users', label: '👥 Usuários & Comportamento', icon: Users },
              { id: 'realtime', label: '⚡ Tempo Real', icon: Activity }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeSection === tab.id ? "default" : "ghost"}
                  size="lg"
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center space-x-3 min-h-[48px] px-6 py-3 text-base font-medium transition-all duration-200 ${
                    activeSection === tab.id 
                      ? 'shadow-md scale-[1.02]' 
                      : 'hover:scale-[1.01] hover:shadow-sm'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Erro: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !mapAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content Sections */}
      {mapAnalytics && (
        <>
          {/* VISÃO GERAL */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* KPIs Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Atividade 24h</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{mapAnalytics.recentActivity.last24h}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">runs hoje</p>
                      </div>
                      <Activity className="h-12 w-12 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Usuários Únicos</p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">{mapAnalytics.userBehaviorPatterns.totalUniqueUsers}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">últimas 4 semanas</p>
                      </div>
                      <Users className="h-12 w-12 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Crescimento</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{mapAnalytics.recentActivity.growthRate}%</p>
                          {getGrowthIcon(mapAnalytics.recentActivity.growthRate)}
                        </div>
                        <p className="text-sm text-purple-600 dark:text-purple-400">vs. mês anterior</p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Runs/Usuário</p>
                        <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{mapAnalytics.userBehaviorPatterns.avgRunsPerUser}</p>
                        <p className="text-sm text-orange-600 dark:text-orange-400">engajamento</p>
                      </div>
                      <Target className="h-12 w-12 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo de Atividade */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Atividade Recente</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Últimas 24h</span>
                      <Badge variant="default">{mapAnalytics.recentActivity.last24h} runs</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Últimos 7 dias</span>
                      <Badge variant="secondary">{mapAnalytics.recentActivity.last7d} runs</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Últimos 30 dias</span>
                      <Badge variant="outline">{mapAnalytics.recentActivity.last30d} runs</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5" />
                      <span>Segmentação de Usuários</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Casual (&lt; 5 runs)</span>
                      <Badge variant="outline">{mapAnalytics.userBehaviorPatterns.casualUsers} usuários</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Regular (5-20 runs)</span>
                      <Badge variant="secondary">{mapAnalytics.userBehaviorPatterns.regularUsers} usuários</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Power (&gt; 20 runs)</span>
                      <Badge variant="default">{mapAnalytics.userBehaviorPatterns.powerUsers} usuários</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* MAPAS & FARMING */}
          {activeSection === 'maps' && (
            <div className="space-y-8">
              {/* Top Mapas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Map className="h-5 w-5" />
                    <span>📊 Análise por Tamanho de Mapa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mapAnalytics.mapSizeStats.map((map, index) => (
                      <Card key={map.mapSize} className="border-primary/20">
                        <CardContent className="p-4">
                          <div className="text-center space-y-2">
                            <h4 className="font-bold text-lg">{map.mapSize}</h4>
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-primary">{formatNumber(map.totalRuns)}</div>
                              <div className="text-xs text-muted-foreground">runs totais</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <div className="font-medium">{map.avgTokens}</div>
                                <div className="text-muted-foreground">avg tokens</div>
                              </div>
                              <div>
                                <div className={`font-medium ${getEfficiencyColor(map.avgEfficiency)}`}>
                                  {formatPercent(map.avgEfficiency)}
                                </div>
                                <div className="text-muted-foreground">eficiência</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center space-x-2 pt-2">
                              <Badge variant="outline" className="text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                L{map.topLevel}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                T{map.topTier}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Level & Tier Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5" />
                    <span>🎖️ Análise Level & Tier</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mapAnalytics.levelTierStats.slice(0, 6).map((stat, index) => (
                      <Card key={`${stat.level}-${stat.tier}`} className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
                        <CardContent className="p-4">
                          <div className="text-center space-y-2">
                            <div className="flex items-center justify-center space-x-2">
                              <Badge variant="default" className="bg-yellow-600">
                                Level {stat.level}
                              </Badge>
                              <Badge variant="outline">
                                Tier {stat.tier}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xl font-bold">{stat.runs} runs</div>
                              <div className="text-sm text-muted-foreground">{stat.avgTokens} avg tokens</div>
                              <div className={`text-sm font-medium ${getEfficiencyColor(stat.avgEfficiency)}`}>
                                {formatPercent(stat.avgEfficiency)} eficiência
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Popular: {stat.popularMapSize}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Charge Efficiency */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>⚡ Eficiência por Charge</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mapAnalytics.chargeEfficiency.map((charge) => (
                      <Card key={charge.chargeRange} className="border-blue-200">
                        <CardContent className="p-4 text-center">
                          <div className="space-y-2">
                            <Badge variant="default" className="bg-blue-600">
                              {charge.chargeRange} cargas
                            </Badge>
                            <div className="text-lg font-bold">{charge.runs} runs</div>
                            <div className="text-sm">{charge.avgTokens} avg tokens</div>
                            <div className={`text-sm font-medium ${getEfficiencyColor(charge.avgEfficiency)}`}>
                              {formatPercent(charge.avgEfficiency)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* USUÁRIOS & COMPORTAMENTO */}
          {activeSection === 'users' && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>👥 Análise de Comportamento dos Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">Seção em Desenvolvimento</h3>
                    <p className="text-muted-foreground">
                      Analytics detalhados de usuários serão implementados na próxima versão.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TEMPO REAL */}
          {activeSection === 'realtime' && (
            <div className="space-y-8">
              {/* Atividade por Hora */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>⏰ Atividade por Hora (Últimos 7 dias)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {mapAnalytics.hourlyActivity.map((hour) => (
                      <Card key={hour.hour} className={`text-center p-2 ${hour.runs > 10 ? 'border-green-500' : hour.runs > 5 ? 'border-yellow-500' : 'border-muted'}`}>
                        <div className="text-sm font-bold">{String(hour.hour).padStart(2, '0')}:00</div>
                        <div className="text-xs text-muted-foreground">{hour.runs} runs</div>
                        <div className="text-xs">{hour.avgTokens} tokens</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          L{hour.popularLevel}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}