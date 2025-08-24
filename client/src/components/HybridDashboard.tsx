import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useI18n } from '../i18n';
import { 
  TrendingUp, TrendingDown, Users, Target, Zap, MapPin, Clock, Trophy, 
  Activity, BarChart3, Database, Download, Trash2, TestTube, Calendar,
  Percent, Star, Timer, ArrowUp, ArrowDown, Eye, Filter, RefreshCw,
  PieChart, LineChart, BarChart, TrendingUp as TrendUp, Award, Flame
} from 'lucide-react';

interface LuckRange {
  range: string;
  runs: number;
  totalTokens: number;
  avgTokens: number;
  users: number;
}

interface GlobalData {
  success: boolean;
  totalRuns: number;
  totalTokens: number;
  uniqueUsers: number;
  totalRegisteredUsers: number;
  luckRanges: LuckRange[];
  rawData: any[];
}

interface AnalyticsData {
  hourlyActivity: { hour: number; runs: number; tokens: number }[];
  mapEfficiency: { mapSize: string; avgEfficiency: number; totalRuns: number }[];
  weeklyTrends: { week: string; runs: number; tokens: number; users: number }[];
}

export function HybridDashboard() {
  const { t } = useI18n();
  
  // Estados para Analytics
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  
  // Estados para Global
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Estados para Admin Tools
  const [adminLoading, setAdminLoading] = useState(false);

  const [activeSection, setActiveSection] = useState<'overview' | 'analytics' | 'global' | 'admin'>('overview');

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result);
      } else {
        setAnalyticsError(result.error || 'Erro ao carregar analytics');
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setAnalyticsError('Erro de conexão');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadGlobalData = async () => {
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const response = await fetch('/api/admin/global-metrics', {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      
      if (result.success) {
        setGlobalData(result);
      } else {
        setGlobalError(result.error || 'Erro ao carregar dados globais');
      }
    } catch (error) {
      console.error('Erro ao carregar dados globais:', error);
      setGlobalError('Erro de conexão');
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'analytics' || activeSection === 'overview') {
      loadAnalytics();
    }
    if (activeSection === 'global' || activeSection === 'overview') {
      loadGlobalData();
    }
  }, [activeSection]);

  // Funções Admin
  const handleExport = async (format: 'json' | 'csv') => {
    setAdminLoading(true);
    try {
      const response = await fetch(`/api/admin/export-data?format=${format}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profitshards-data.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro no export:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleBackup = async () => {
    setAdminLoading(true);
    try {
      const response = await fetch('/api/admin/backup-database', {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        alert('✅ Backup criado com sucesso!');
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCleanOld = async () => {
    if (!confirm('⚠️ Remover dados antigos (90+ dias)? Esta ação não pode ser desfeita.')) return;
    
    setAdminLoading(true);
    try {
      const response = await fetch('/api/admin/clean-old-data', {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        alert(`✅ Limpeza concluída!\n\nRemovidos: ${result.recordsRemoved}\nMantidos: ${result.recordsKept}`);
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Dashboard Híbrido
          </h1>
          <p className="text-muted-foreground">Funcionalidade real com design moderno</p>
        </div>
        <div className="flex space-x-2">
          {([
            { key: 'overview', label: '📊 Visão Geral', icon: BarChart3 },
            { key: 'analytics', label: '📈 Analytics', icon: Activity },
            { key: 'global', label: '🌍 Global', icon: Target },
            { key: 'admin', label: '🔧 Admin', icon: Database }
          ] as const).map((section) => (
            <Button
              key={section.key}
              variant={activeSection === section.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(section.key)}
              className="flex items-center space-x-2"
            >
              <section.icon className="h-4 w-4" />
              <span className="hidden md:inline">{section.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Cards de estatísticas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {globalLoading ? '...' : globalData?.totalRuns.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                    <p className="text-2xl font-bold text-green-600">
                      {globalLoading ? '...' : globalData?.totalTokens.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {globalLoading ? '...' : globalData?.uniqueUsers || '0'}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registered</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {globalLoading ? '...' : globalData?.totalRegisteredUsers || '0'}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Eficiência Global */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-emerald-500/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Eficiência Global</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {globalData ? (globalData.totalRuns > 0 ? (globalData.totalTokens / globalData.totalRuns).toFixed(1) : '0') : '...'}
                    </p>
                    <p className="text-xs text-muted-foreground">tokens por run</p>
                  </div>
                  <Percent className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            {/* Melhor Faixa */}
            <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Melhor Faixa</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {globalData?.luckRanges.length > 0 ? 
                        globalData.luckRanges.reduce((best, current) => 
                          current.avgTokens > best.avgTokens ? current : best
                        ).range : '...'}
                    </p>
                    <p className="text-xs text-muted-foreground">maior eficiência</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Última Atividade</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {analyticsData?.hourlyActivity.length > 0 ? 
                        Math.max(...analyticsData.hourlyActivity.map(h => h.runs)) : '...'}
                    </p>
                    <p className="text-xs text-muted-foreground">runs no pico</p>
                  </div>
                  <Activity className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atividade por Hora - Expandida */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Atividade por Horário (24h)</span>
                  </div>
                  <Button onClick={loadAnalytics} variant="ghost" size="sm" disabled={analyticsLoading}>
                    {analyticsLoading ? '⏳' : '🔄'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.hourlyActivity ? (
                  <div className="space-y-3">
                    {/* Resumo do período */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Pico</p>
                        <p className="font-bold text-primary">
                          {Math.max(...analyticsData.hourlyActivity.map(h => h.runs))}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Média</p>
                        <p className="font-bold text-primary">
                          {(analyticsData.hourlyActivity.reduce((sum, h) => sum + h.runs, 0) / analyticsData.hourlyActivity.length).toFixed(1)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-bold text-primary">
                          {analyticsData.hourlyActivity.reduce((sum, h) => sum + h.runs, 0)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Gráfico de barras */}
                    <div className="space-y-2">
                      {analyticsData.hourlyActivity.map((hour, i) => {
                        const maxRuns = Math.max(...analyticsData.hourlyActivity.map(h => h.runs));
                        const percentage = maxRuns > 0 ? (hour.runs / maxRuns) * 100 : 0;
                        const isPeak = hour.runs === maxRuns && hour.runs > 0;
                        
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground w-12">{hour.hour}:00</span>
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="w-full bg-muted rounded-full h-3 ml-4 relative">
                                <div 
                                  className={`rounded-full h-3 transition-all ${
                                    isPeak 
                                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600' 
                                      : 'bg-gradient-to-r from-primary to-blue-600'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                                {isPeak && (
                                  <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <span className="text-sm font-medium w-12 text-right">
                                {hour.runs}
                                {hour.tokens > 0 && (
                                  <span className="block text-xs text-green-600">
                                    {hour.tokens.toLocaleString()}T
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {analyticsLoading ? 'Carregando...' : 'Sem dados disponíveis'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Análise de Faixas de Luck - Expandida */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span>Análise por Faixa de Luck</span>
                  </div>
                  <Button onClick={loadGlobalData} variant="ghost" size="sm" disabled={globalLoading}>
                    {globalLoading ? '⏳' : '🔄'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {globalData?.luckRanges ? (
                  <div className="space-y-4">
                    {/* Resumo das faixas */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Faixas Ativas</p>
                        <p className="font-bold text-primary">{globalData.luckRanges.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Melhor Média</p>
                        <p className="font-bold text-green-600">
                          {globalData.luckRanges.length > 0 ? 
                            Math.max(...globalData.luckRanges.map(r => r.avgTokens)).toFixed(1) : '0'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Lista detalhada */}
                    <div className="space-y-3">
                      {globalData.luckRanges.map((range, i) => {
                        const maxAvg = Math.max(...globalData.luckRanges.map(r => r.avgTokens));
                        const isBest = range.avgTokens === maxAvg;
                        const efficiency = maxAvg > 0 ? (range.avgTokens / maxAvg) * 100 : 0;
                        
                        return (
                          <div key={i} className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                            isBest 
                              ? 'bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border-yellow-500/20' 
                              : 'bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50'
                          }`}>
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-12 rounded-full ${
                                isBest 
                                  ? 'bg-gradient-to-b from-yellow-500 to-amber-600' 
                                  : 'bg-gradient-to-b from-primary to-blue-600'
                              }`}></div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold">{range.range}</p>
                                  {isBest && <Award className="h-4 w-4 text-yellow-500" />}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {range.runs.toLocaleString()} runs • {range.users} usuários
                                </p>
                                <div className="w-32 bg-muted rounded-full h-1.5 mt-1">
                                  <div 
                                    className="bg-gradient-to-r from-primary to-blue-600 rounded-full h-1.5 transition-all"
                                    style={{ width: `${efficiency}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-lg">
                                {range.avgTokens.toFixed(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">avg tokens</p>
                              <p className="text-xs text-primary">
                                {range.totalTokens.toLocaleString()} total
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {globalLoading ? 'Carregando...' : 'Sem dados disponíveis'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights e Tendências */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Insights */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendUp className="h-5 w-5 text-primary" />
                  <span>Insights de Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {globalData && analyticsData && (
                    <>
                      {/* Horário mais produtivo */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Horário Mais Produtivo</p>
                            <p className="text-sm text-muted-foreground">
                              {analyticsData.hourlyActivity.reduce((best, current) => 
                                current.runs > best.runs ? current : best
                              ).hour}:00 - {analyticsData.hourlyActivity.reduce((best, current) => 
                                current.runs > best.runs ? current : best
                              ).hour + 1}:00
                            </p>
                          </div>
                        </div>
                        <ArrowUp className="h-5 w-5 text-green-600" />
                      </div>

                      {/* Faixa mais popular */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Faixa Mais Popular</p>
                            <p className="text-sm text-muted-foreground">
                              {globalData.luckRanges.reduce((most, current) => 
                                current.users > most.users ? current : most
                              ).range} ({globalData.luckRanges.reduce((most, current) => 
                                current.users > most.users ? current : most
                              ).users} usuários)
                            </p>
                          </div>
                        </div>
                        <Trophy className="h-5 w-5 text-blue-600" />
                      </div>

                      {/* Taxa de sucesso */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-violet-600/10 rounded-lg border border-purple-500/20">
                        <div className="flex items-center space-x-3">
                          <Percent className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium">Taxa de Participação</p>
                            <p className="text-sm text-muted-foreground">
                              {globalData.totalRegisteredUsers > 0 ? 
                                ((globalData.uniqueUsers / globalData.totalRegisteredUsers) * 100).toFixed(1) : '0'}% 
                              dos usuários ativos
                            </p>
                          </div>
                        </div>
                        <Activity className="h-5 w-5 text-purple-600" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas Rápidas */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  <span>Estatísticas Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {globalData && (
                    <>
                      <div className="text-center p-3 bg-gradient-to-br from-red-500/10 to-pink-600/10 rounded-lg border border-red-500/20">
                        <Flame className="h-6 w-6 text-red-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-red-600">
                          {globalData.luckRanges.reduce((sum, range) => sum + range.runs, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Runs</p>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-br from-cyan-500/10 to-teal-600/10 rounded-lg border border-cyan-500/20">
                        <Zap className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-cyan-600">
                          {(globalData.totalTokens / 1000).toFixed(1)}K
                        </p>
                        <p className="text-xs text-muted-foreground">Total Tokens</p>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-br from-lime-500/10 to-green-600/10 rounded-lg border border-lime-500/20">
                        <Target className="h-6 w-6 text-lime-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-lime-600">
                          {globalData.totalRuns > 0 ? (globalData.totalTokens / globalData.totalRuns).toFixed(2) : '0'}
                        </p>
                        <p className="text-xs text-muted-foreground">Média Global</p>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-br from-violet-500/10 to-purple-600/10 rounded-lg border border-violet-500/20">
                        <Users className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-violet-600">
                          {globalData.uniqueUsers}/{globalData.totalRegisteredUsers}
                        </p>
                        <p className="text-xs text-muted-foreground">Ativos/Total</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {activeSection === 'analytics' && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>📈 Analytics Avançados</span>
              </span>
              <Button onClick={loadAnalytics} variant="outline" size="sm" disabled={analyticsLoading}>
                {analyticsLoading ? '⏳' : '🔄'} Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando analytics...</p>
              </div>
            )}

            {analyticsError && (
              <div className="text-center py-8">
                <p className="text-destructive">❌ Erro: {analyticsError}</p>
              </div>
            )}

            {analyticsData && (
              <div className="space-y-6">
                {/* Eficiência por Mapa */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Eficiência por Mapa</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analyticsData.mapEfficiency.map((map, i) => (
                      <div key={i} className="text-center p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border hover:shadow-md transition-shadow">
                        <p className="font-medium capitalize">{map.mapSize}</p>
                        <p className="text-2xl font-bold text-primary">{map.avgEfficiency.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">{map.totalRuns} runs</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Global Section */}
      {activeSection === 'global' && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>🌍 Dados Globais</span>
              </span>
              <Button onClick={loadGlobalData} variant="outline" size="sm" disabled={globalLoading}>
                {globalLoading ? '⏳' : '🔄'} Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {globalLoading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando dados globais...</p>
              </div>
            )}

            {globalError && (
              <div className="text-center py-8">
                <p className="text-destructive">❌ Erro: {globalError}</p>
              </div>
            )}

            {globalData && (
              <div className="space-y-6">
                {/* Resumo Global */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-muted-foreground">Total Runs</p>
                    <p className="text-2xl font-bold text-blue-600">{globalData.totalRuns.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-muted-foreground">Total Tokens</p>
                    <p className="text-2xl font-bold text-green-600">{globalData.totalTokens.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                    <p className="text-2xl font-bold text-purple-600">{globalData.uniqueUsers}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
                    <p className="text-sm text-muted-foreground">Registrados</p>
                    <p className="text-2xl font-bold text-orange-600">{globalData.totalRegisteredUsers}</p>
                  </div>
                </div>

                {/* Detalhes por Faixa */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Análise por Faixa de Luck</h3>
                  <div className="space-y-2">
                    {globalData.luckRanges.map((range, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-background rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-12 bg-gradient-to-b from-primary to-blue-600 rounded-full"></div>
                          <div>
                            <p className="font-semibold">{range.range}</p>
                            <p className="text-sm text-muted-foreground">{range.users} usuários</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{range.runs.toLocaleString()} runs</p>
                          <p className="text-sm text-green-600">{range.totalTokens.toLocaleString()} tokens</p>
                          <p className="text-xs text-muted-foreground">Média: {range.avgTokens.toFixed(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Section */}
      {activeSection === 'admin' && (
        <div className="space-y-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <span>🔧 Ferramentas Administrativas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Export Data */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Exportar Dados</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">Baixar todos os dados do sistema</p>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleExport('csv')} 
                      variant="outline" 
                      size="sm"
                      disabled={adminLoading}
                      className="flex-1"
                    >
                      CSV
                    </Button>
                    <Button 
                      onClick={() => handleExport('json')} 
                      variant="outline" 
                      size="sm"
                      disabled={adminLoading}
                      className="flex-1"
                    >
                      JSON
                    </Button>
                  </div>
                </div>

                {/* Backup */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>Backup Database</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">Criar backup completo do D1</p>
                  <Button 
                    onClick={handleBackup}
                    variant="outline" 
                    size="sm"
                    disabled={adminLoading}
                    className="w-full"
                  >
                    {adminLoading ? 'Processando...' : 'Criar Backup'}
                  </Button>
                </div>

                {/* Clean Data */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Limpeza de Dados</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">Remover dados antigos (90+ dias)</p>
                  <Button 
                    onClick={handleCleanOld}
                    variant="destructive" 
                    size="sm"
                    disabled={adminLoading}
                    className="w-full"
                  >
                    {adminLoading ? 'Processando...' : 'Limpar Antigos'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}