import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useI18n } from '../i18n';
import { 
  TrendingUp, TrendingDown, Users, Target, Zap, MapPin, Clock, Trophy, 
  Activity, BarChart3, Database, Download, Trash2, TestTube 
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

          {/* Gráficos lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atividade por Hora */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Atividade por Horário</span>
                  <Button onClick={loadAnalytics} variant="ghost" size="sm" disabled={analyticsLoading}>
                    {analyticsLoading ? '⏳' : '🔄'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.hourlyActivity ? (
                  <div className="space-y-2">
                    {analyticsData.hourlyActivity.slice(0, 12).map((hour, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground w-12">{hour.hour}:00</span>
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-full bg-muted rounded-full h-2 ml-4">
                            <div 
                              className="bg-gradient-to-r from-primary to-blue-600 rounded-full h-2 transition-all"
                              style={{ width: `${Math.min((hour.runs / 50) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{hour.runs}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {analyticsLoading ? 'Carregando...' : 'Sem dados disponíveis'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Luck Ranges */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Faixas de Luck</span>
                  <Button onClick={loadGlobalData} variant="ghost" size="sm" disabled={globalLoading}>
                    {globalLoading ? '⏳' : '🔄'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {globalData?.luckRanges ? (
                  <div className="space-y-3">
                    {globalData.luckRanges.map((range, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg hover:from-muted/70 hover:to-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-8 bg-gradient-to-b from-primary to-blue-600 rounded-full"></div>
                          <div>
                            <p className="font-medium">{range.range}</p>
                            <p className="text-sm text-muted-foreground">{range.runs} runs</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{range.avgTokens.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">avg tokens</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {globalLoading ? 'Carregando...' : 'Sem dados disponíveis'}
                  </div>
                )}
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