import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../hooks/use-auth';
import { useI18n } from '../i18n';
import { 
  TrendingUp, TrendingDown, Users, Target, Zap, MapPin, Clock, Trophy, 
  Activity, BarChart3, Database, RefreshCw, Calendar, Percent, Star, 
  Timer, ArrowUp, ArrowDown, Eye, Filter, PieChart, LineChart, Award, 
  Flame, Map, Shield, Crown, Gauge, Hash, UserCheck, AlertCircle,
  Gift, DollarSign, UserPlus, Settings, Download, Upload, Trash2,
  Play, Pause, Square, Edit, Plus, EyeOff, CheckCircle, XCircle
} from 'lucide-react';

// Interfaces para os dados
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

interface GiveawayAnalytics {
  totalGiveaways: number;
  activeGiveaways: number;
  totalParticipants: number;
  totalWinners: number;
  participationRate: number;
  completionRate: number;
  topGiveaways: {
    id: string;
    title: string;
    participants: number;
    completionRate: number;
  }[];
}

interface UserProfitAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalProfit: number;
  avgProfitPerUser: number;
  topEarners: {
    email: string;
    totalProfit: number;
    runs: number;
    efficiency: number;
  }[];
  profitDistribution: {
    range: string;
    users: number;
    percentage: number;
  }[];
}

interface FeedAnalytics {
  totalActivities: number;
  activitiesToday: number;
  activitiesThisWeek: number;
  topActivities: {
    type: string;
    count: number;
    percentage: number;
  }[];
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    engagementRate: number;
  };
}

export function UltimateAdminDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'maps' | 'giveaways' | 'users' | 'feed' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const [mapAnalytics, setMapAnalytics] = useState<MapAnalytics | null>(null);
  const [giveawayAnalytics, setGiveawayAnalytics] = useState<GiveawayAnalytics | null>(null);
  const [userProfitAnalytics, setUserProfitAnalytics] = useState<UserProfitAnalytics | null>(null);
  const [feedAnalytics, setFeedAnalytics] = useState<FeedAnalytics | null>(null);

  // Verificar se é admin
  const isAdmin = user === 'holdboy01@gmail.com';

  // Carregar dados
  const loadMapAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/map-analytics', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setMapAnalytics(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar map analytics:', error);
    }
  };

  const loadGiveawayAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/giveaway-analytics', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setGiveawayAnalytics(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar giveaway analytics:', error);
    }
  };

  const loadUserProfitAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setUserProfitAnalytics(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar user profit analytics:', error);
    }
  };

  const loadFeedAnalytics = async () => {
    try {
      const response = await fetch('/api/feed/activity-stream?limit=1000', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        // Processar dados do feed
        const activities = result.runs || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        const activitiesToday = activities.filter((activity: any) => 
          activity.timestamp >= todayTimestamp
        ).length;
        
        const weekAgo = todayTimestamp - (7 * 24 * 60 * 60 * 1000);
        const activitiesThisWeek = activities.filter((activity: any) => 
          activity.timestamp >= weekAgo
        ).length;

        // Agrupar por tipo de atividade
        const activityTypes: { [key: string]: number } = {};
        activities.forEach((activity: any) => {
          const type = activity.map || 'Unknown';
          activityTypes[type] = (activityTypes[type] || 0) + 1;
        });

        const topActivities = Object.entries(activityTypes)
          .map(([type, count]) => ({
            type,
            count,
            percentage: (count / activities.length) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Usuários únicos
        const uniqueUsers = new Set(activities.map((activity: any) => activity.user_email)).size;

        setFeedAnalytics({
          totalActivities: activities.length,
          activitiesToday,
          activitiesThisWeek,
          topActivities,
          userEngagement: {
            totalUsers: uniqueUsers,
            activeUsers: uniqueUsers,
            engagementRate: 85.5 // Placeholder
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar feed analytics:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMapAnalytics(),
        loadGiveawayAnalytics(),
        loadUserProfitAnalytics(),
        loadFeedAnalytics()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
        <p className="text-muted-foreground">
          Apenas administradores podem acessar este dashboard.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão completa do sistema - holdboy01@gmail.com
          </p>
        </div>
        <Button onClick={loadAllData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="maps" className="gap-2">
            <Map className="h-4 w-4" />
            Mapas
          </TabsTrigger>
          <TabsTrigger value="giveaways" className="gap-2">
            <Gift className="h-4 w-4" />
            Giveaways
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="feed" className="gap-2">
            <Activity className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total de Usuários */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mapAnalytics?.userBehaviorPatterns.totalUniqueUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% em relação ao mês passado
                </p>
              </CardContent>
            </Card>

            {/* Total de Runs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Runs</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mapAnalytics?.recentActivity.last30d || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>

            {/* Atividades Hoje */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedAnalytics?.activitiesToday || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mapAnalytics?.recentActivity.growthRate || 0}% de crescimento
                </p>
              </CardContent>
            </Card>

            {/* Giveaways Ativos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Giveaways Ativos</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {giveawayAnalytics?.activeGiveaways || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {giveawayAnalytics?.totalParticipants || 0} participantes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Resumo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atividade por Hora */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mapAnalytics?.hourlyActivity.slice(0, 8).map((hour, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{hour.hour}:00</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(hour.runs / Math.max(...(mapAnalytics?.hourlyActivity.map(h => h.runs) || [1]))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{hour.runs}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Mapas */}
            <Card>
              <CardHeader>
                <CardTitle>Top Mapas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mapAnalytics?.mapSizeStats.slice(0, 4).map((map, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{map.mapSize}</Badge>
                        <span className="text-sm">{map.totalRuns} runs</span>
                      </div>
                      <div className="text-sm font-medium">
                        {map.avgTokens} tokens
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análise de Mapas */}
        <TabsContent value="maps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Estatísticas de Mapas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Estatísticas por Tamanho de Mapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mapAnalytics?.mapSizeStats.map((map, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold capitalize">{map.mapSize} Map</h3>
                        <Badge variant="secondary">{map.totalRuns} runs</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tokens Médios:</span>
                          <div className="font-medium">{map.avgTokens}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Eficiência:</span>
                          <div className="font-medium">{(map.avgEfficiency * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carga Média:</span>
                          <div className="font-medium">{map.avgCharge}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comportamento dos Usuários */}
            <Card>
              <CardHeader>
                <CardTitle>Comportamento dos Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {mapAnalytics?.userBehaviorPatterns.totalUniqueUsers || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Usuários Únicos</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Casuais</span>
                      <span className="text-sm font-medium">
                        {mapAnalytics?.userBehaviorPatterns.casualUsers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Regulares</span>
                      <span className="text-sm font-medium">
                        {mapAnalytics?.userBehaviorPatterns.regularUsers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Power Users</span>
                      <span className="text-sm font-medium">
                        {mapAnalytics?.userBehaviorPatterns.powerUsers || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análise de Giveaways */}
        <TabsContent value="giveaways" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Giveaways</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {giveawayAnalytics?.totalGiveaways || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {giveawayAnalytics?.activeGiveaways || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {giveawayAnalytics?.totalParticipants || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencedores</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {giveawayAnalytics?.totalWinners || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Giveaways */}
          <Card>
            <CardHeader>
              <CardTitle>Top Giveaways por Participação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {giveawayAnalytics?.topGiveaways.map((giveaway, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{giveaway.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {giveaway.participants} participantes
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {(giveaway.completionRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Usuários */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfitAnalytics?.totalUsers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfitAnalytics?.activeUsers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfitAnalytics?.totalProfit?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfitAnalytics?.avgProfitPerUser?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Earners */}
          <Card>
            <CardHeader>
              <CardTitle>Top Earners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userProfitAnalytics?.topEarners.slice(0, 5).map((earner, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{earner.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {earner.runs} runs • {earner.efficiency.toFixed(1)}% eficiência
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {earner.totalProfit.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise do Feed */}
        <TabsContent value="feed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Atividades</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedAnalytics?.totalActivities || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedAnalytics?.activitiesToday || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedAnalytics?.activitiesThisWeek || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedAnalytics?.userEngagement.engagementRate || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Atividades */}
          <Card>
            <CardHeader>
              <CardTitle>Top Tipos de Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedAnalytics?.topActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{activity.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.count} atividades
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {activity.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ações Administrativas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Administrativas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => fetch('/api/admin/force-map-runs-today?force=true', { method: 'POST' })}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Forçar Map Runs de Hoje
                </Button>
                
                <Button 
                  onClick={() => fetch('/api/admin/clear-feed', { method: 'POST' })}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar Feed
                </Button>
                
                <Button 
                  onClick={() => fetch('/api/admin/reset-metrics', { method: 'POST' })}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  Resetar Métricas
                </Button>
              </CardContent>
            </Card>

            {/* Exportar Dados */}
            <Card>
              <CardHeader>
                <CardTitle>Exportar Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => window.open('/api/admin/analytics', '_blank')}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Exportar Analytics
                </Button>
                
                <Button 
                  onClick={() => window.open('/api/admin/map-analytics', '_blank')}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Exportar Map Analytics
                </Button>
                
                <Button 
                  onClick={() => window.open('/api/feed/activity-stream?limit=10000', '_blank')}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Exportar Feed Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}