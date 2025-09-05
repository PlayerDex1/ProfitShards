import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../hooks/use-auth';
import { useI18n } from '../i18n';
import { 
  TrendingUp, TrendingDown, Users, Target, Zap, MapPin, Clock, Trophy, 
  Activity, BarChart3, Database, RefreshCw, Calendar, Percent, Star, 
  Timer, ArrowUp, ArrowDown, Eye, Filter, PieChart, LineChart, Award, 
  Flame, Map, Shield, Crown, Gauge, Hash, UserCheck, AlertCircle,
  Gift, DollarSign, UserPlus, Settings, Download, Upload, Trash2,
  Play, Pause, Square, Edit, Plus, EyeOff, CheckCircle, XCircle,
  Search, Mail, Bell, Server, Cpu, HardDrive, Wifi, AlertTriangle
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

interface GiveawayData {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'completed';
  participants: number;
  maxParticipants?: number;
  startDate: string;
  endDate: string;
  requirements: any[];
  winners?: string[];
  completionRate: number;
}

interface UserData {
  email: string;
  totalRuns: number;
  totalProfit: number;
  efficiency: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

interface SystemHealth {
  apiStatus: 'healthy' | 'warning' | 'error';
  databaseStatus: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
}

export function EnhancedAdminDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'maps' | 'giveaways' | 'users' | 'feed' | 'monitoring' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const [mapAnalytics, setMapAnalytics] = useState<MapAnalytics | null>(null);
  const [giveaways, setGiveaways] = useState<GiveawayData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  
  // Filtros
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

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

  const loadGiveaways = async () => {
    try {
      const response = await fetch('/api/giveaways/list', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setGiveaways(result.giveaways || []);
      }
    } catch (error) {
      console.error('Erro ao carregar giveaways:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        // Simular dados de usuários baseados nos analytics
        const userData: UserData[] = [
          {
            email: 'user1@example.com',
            totalRuns: 45,
            totalProfit: 12500,
            efficiency: 87.5,
            lastActivity: new Date().toISOString(),
            status: 'active'
          },
          {
            email: 'user2@example.com',
            totalRuns: 32,
            totalProfit: 8900,
            efficiency: 82.1,
            lastActivity: new Date(Date.now() - 86400000).toISOString(),
            status: 'active'
          },
          {
            email: 'holdboy01@gmail.com',
            totalRuns: 156,
            totalProfit: 45600,
            efficiency: 94.2,
            lastActivity: new Date().toISOString(),
            status: 'active'
          }
        ];
        setUsers(userData);
      }
    } catch (error) {
      console.error('Erro ao carregar users:', error);
    }
  };

  const loadSystemHealth = async () => {
    try {
      // Simular dados de saúde do sistema
      const health: SystemHealth = {
        apiStatus: 'healthy',
        databaseStatus: 'healthy',
        uptime: 99.9,
        responseTime: 120,
        errorRate: 0.1,
        activeUsers: mapAnalytics?.userBehaviorPatterns.totalUniqueUsers || 0
      };
      setSystemHealth(health);
    } catch (error) {
      console.error('Erro ao carregar system health:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMapAnalytics(),
        loadGiveaways(),
        loadUsers(),
        loadSystemHealth()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendEmailReport = async () => {
    try {
      const response = await fetch('/api/admin/send-email-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'Rafaeelmcontato@gmail.com',
          reportType: 'daily',
          includeCharts: true
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('✅ Relatório enviado por email com sucesso!');
      } else {
        alert('❌ Erro ao enviar relatório: ' + result.error);
      }
    } catch (error) {
      alert('❌ Erro ao enviar relatório: ' + error);
    }
  };

  const createGiveaway = async () => {
    const title = prompt('Título do Giveaway:');
    const description = prompt('Descrição:');
    const maxParticipants = prompt('Máximo de participantes (opcional):');
    
    if (!title || !description) return;

    try {
      const response = await fetch('/api/giveaways/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
          requirements: []
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('✅ Giveaway criado com sucesso!');
        loadGiveaways();
      } else {
        alert('❌ Erro ao criar giveaway: ' + result.error);
      }
    } catch (error) {
      alert('❌ Erro ao criar giveaway: ' + error);
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

  // Filtrar usuários por busca
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Dados para gráfico de linha (simulado)
  const generateTrendData = (days: number) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        runs: Math.floor(Math.random() * 50) + 20,
        users: Math.floor(Math.random() * 10) + 5,
        profit: Math.floor(Math.random() * 10000) + 5000
      });
    }
    return data;
  };

  const trendData = generateTrendData(30);

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Dashboard Administrativo Avançado
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão completa do sistema - holdboy01@gmail.com
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filtro de Data */}
          <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {/* Busca de Usuário */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10 w-48"
            />
          </div>

          <Button onClick={loadAllData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-7">
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
          <TabsTrigger value="monitoring" className="gap-2">
            <Server className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral com Gráficos de Linha */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cards de Métricas */}
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mapAnalytics?.recentActivity.last24h || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mapAnalytics?.recentActivity.growthRate || 0}% de crescimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Giveaways Ativos</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {giveaways.filter(g => g.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {giveaways.reduce((sum, g) => sum + g.participants, 0)} participantes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Tendência */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Runs ao Longo do Tempo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Tendência de Runs (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-1">
                  {trendData.slice(-14).map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div 
                        className="bg-blue-500 rounded-t w-6 transition-all hover:bg-blue-600"
                        style={{ height: `${(day.runs / Math.max(...trendData.map(d => d.runs))) * 200}px` }}
                        title={`${day.date}: ${day.runs} runs`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Usuários Ativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuários Ativos (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-1">
                  {trendData.slice(-14).map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div 
                        className="bg-green-500 rounded-t w-6 transition-all hover:bg-green-600"
                        style={{ height: `${(day.users / Math.max(...trendData.map(d => d.users))) * 200}px` }}
                        title={`${day.date}: ${day.users} usuários`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestão de Giveaways */}
        <TabsContent value="giveaways" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestão de Giveaways</h2>
            <Button onClick={createGiveaway} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Giveaway
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Giveaways</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{giveaways.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {giveaways.filter(g => g.status === 'active').length}
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
                  {giveaways.reduce((sum, g) => sum + g.participants, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa Média</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {giveaways.length > 0 
                    ? (giveaways.reduce((sum, g) => sum + g.completionRate, 0) / giveaways.length * 100).toFixed(1)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Giveaways */}
          <Card>
            <CardHeader>
              <CardTitle>Giveaways</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {giveaways.map((giveaway, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{giveaway.title}</h3>
                        <Badge variant={giveaway.status === 'active' ? 'default' : 'secondary'}>
                          {giveaway.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{giveaway.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{giveaway.participants} participantes</span>
                        <span>{(giveaway.completionRate * 100).toFixed(1)}% conclusão</span>
                        <span>Até {new Date(giveaway.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestão de Usuários */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
            <div className="text-sm text-muted-foreground">
              {filteredUsers.length} usuários encontrados
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.status === 'active').length}
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
                  {users.reduce((sum, u) => sum + u.totalProfit, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.length > 0 
                    ? (users.reduce((sum, u) => sum + u.efficiency, 0) / users.length).toFixed(1)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{user.email}</h3>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{user.totalRuns} runs</span>
                        <span>{user.totalProfit.toLocaleString()} tokens</span>
                        <span>{user.efficiency.toFixed(1)}% eficiência</span>
                        <span>Última atividade: {new Date(user.lastActivity).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoramento do Sistema */}
        <TabsContent value="monitoring" className="space-y-6">
          <h2 className="text-2xl font-bold">Monitoramento do Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status da API</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth?.apiStatus === 'healthy' ? 'bg-green-500' : 
                    systemHealth?.apiStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium capitalize">{systemHealth?.apiStatus || 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth?.databaseStatus === 'healthy' ? 'bg-green-500' : 
                    systemHealth?.databaseStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium capitalize">{systemHealth?.databaseStatus || 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth?.uptime || 0}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth?.responseTime || 0}ms</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance do Sistema (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-1">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div 
                      className="bg-blue-500 rounded-t w-4 transition-all hover:bg-blue-600"
                      style={{ height: `${Math.random() * 200 + 50}px` }}
                      title={`${i}:00 - ${Math.floor(Math.random() * 100 + 50)}ms`}
                    />
                    <span className="text-xs text-muted-foreground">{i}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Configurações Administrativas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Relatórios por Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Relatórios por Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Email configurado: <strong>Rafaeelmcontato@gmail.com</strong>
                </div>
                <div className="space-y-2">
                  <Button onClick={sendEmailReport} className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Enviar Relatório Diário
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Bell className="h-4 w-4" />
                    Configurar Relatórios Automáticos
                  </Button>
                </div>
              </CardContent>
            </Card>

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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}