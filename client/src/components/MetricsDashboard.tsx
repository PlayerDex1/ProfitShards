import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../hooks/use-auth';
import { useI18n } from '../i18n';

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
  topUsers: { email: string; totalRuns: number; totalTokens: number; avgEfficiency: number }[];
  weeklyTrends: { week: string; runs: number; tokens: number; users: number }[];
}

export function MetricsDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'analytics' | 'global' | 'admin'>('analytics');
  
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

  const isAdmin = user === 'holdboy01@gmail.com';

  // Função para carregar Analytics Avançados
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setAnalyticsData(result);
      
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setAnalyticsError(error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Função para carregar dados globais
  const loadGlobalData = async () => {
    setGlobalLoading(true);
    setGlobalError(null);
    
    try {
      const response = await fetch('/api/admin/global-metrics', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setGlobalData(result);
      
    } catch (error) {
      console.error('Erro ao carregar dados globais:', error);
      setGlobalError(error.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Função para exportar dados
  const exportData = async (format: 'csv' | 'json') => {
    setAdminLoading(true);
    
    try {
      const response = await fetch(`/api/admin/export-data?format=${format}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`✅ Dados exportados em ${format.toUpperCase()}!`);
      
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert(`❌ Erro ao exportar: ${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  // Função para backup do D1
  const backupDatabase = async () => {
    setAdminLoading(true);
    
    try {
      const response = await fetch('/api/admin/backup-database', {
        method: 'POST',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Backup realizado!\n\nRegistros salvos: ${result.recordsBackup}\nData: ${result.timestamp}`);
      } else {
        alert(`❌ Erro no backup: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Erro no backup:', error);
      alert(`❌ Erro no backup: ${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  // Função para limpar dados antigos
  const cleanOldData = async () => {
    if (!confirm('⚠️ Confirma limpar dados com mais de 90 dias?')) return;
    
    setAdminLoading(true);
    
    try {
      const response = await fetch('/api/admin/clean-old-data', {
        method: 'POST',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Limpeza concluída!\n\nRegistros removidos: ${result.recordsRemoved}\nRegistros mantidos: ${result.recordsKept}`);
        loadGlobalData(); // Recarregar dados
      } else {
        alert(`❌ Erro na limpeza: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Erro na limpeza:', error);
      alert(`❌ Erro na limpeza: ${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  // Função para testar D1 diretamente
  const testD1Direct = async () => {
    setAdminLoading(true);
    
    try {
      const response = await fetch('/api/admin/test-d1-direct', {
        method: 'POST',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ D1 Teste OK!\n\nInseridos: ${result.inserted} registros\nTotal: ${result.totalRecords} registros\n\nPor usuário:\n${result.recordsByUser.map(r => `${r.user_email}: ${r.count}`).join('\n')}`);
      } else {
        alert(`❌ D1 Teste FALHOU:\n${result.error}`);
      }
      
    } catch (error) {
      console.error('Erro no teste D1:', error);
      alert(`❌ Erro no teste D1:\n${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'global') {
      loadGlobalData();
    }
  }, [activeTab]);

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Acesso restrito para administradores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'analytics'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          📈 {t('analytics.title')}
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'global'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🌍 {t('analytics.globalData')}
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'admin'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🔧 {t('analytics.adminTools')}
        </button>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>📈 {t('analytics.title')}</span>
                <Button onClick={loadAnalytics} variant="outline" size="sm" disabled={analyticsLoading}>
                  {analyticsLoading ? '⏳' : '🔄'} {t('analytics.update')}
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
                  {/* Atividade por Hora */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">🕐 Atividade por Horário</h3>
                    <div className="grid grid-cols-8 gap-2">
                      {analyticsData.hourlyActivity.map((hour, i) => (
                        <div key={i} className="text-center p-2 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">{hour.hour}h</div>
                          <div className="font-mono text-sm">{hour.runs}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Eficiência por Mapa */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">🗺️ Eficiência por Mapa</h3>
                    <div className="space-y-2">
                      {analyticsData.mapEfficiency.map((map, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <span className="font-medium">{map.mapSize.toUpperCase()}</span>
                          <div className="text-right">
                            <div className="font-mono">{map.avgEfficiency.toFixed(1)} T/L</div>
                            <div className="text-xs text-muted-foreground">{map.totalRuns} runs</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Usuários */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">🏆 Top Usuários</h3>
                    <div className="space-y-2">
                      {analyticsData.topUsers.slice(0, 5).map((user, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'}</span>
                            <span className="font-medium">{user.username || user.email.split('@')[0]}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono">{user.totalTokens.toLocaleString()} tokens</div>
                            <div className="text-xs text-muted-foreground">{user.totalRuns} runs • {user.avgEfficiency.toFixed(1)} T/L</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global Tab */}
      {activeTab === 'global' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🌍 Dados Globais</span>
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
                <div className="space-y-4">
                  {/* Cards de Resumo */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{globalData.totalRuns}</div>
                      <div className="text-sm text-muted-foreground">Total Runs</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{globalData.totalTokens.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Tokens</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{globalData.uniqueUsers}</div>
                      <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{globalData.totalRuns > 0 ? Math.round(globalData.totalTokens / globalData.totalRuns) : 0}</div>
                      <div className="text-sm text-muted-foreground">Média Global</div>
                    </div>
                  </div>

                  {/* Tabela de Faixas de Luck */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Faixa de Luck</th>
                          <th className="text-center p-2">Runs</th>
                          <th className="text-center p-2">Tokens</th>
                          <th className="text-center p-2">Média</th>
                          <th className="text-center p-2">Usuários</th>
                        </tr>
                      </thead>
                      <tbody>
                        {globalData.luckRanges.map((range, i) => (
                          <tr key={i} className="border-b hover:bg-muted/20">
                            <td className="p-2 font-medium">{range.range}</td>
                            <td className="text-center p-2 font-mono">{range.runs}</td>
                            <td className="text-center p-2 font-mono">{range.totalTokens.toLocaleString()}</td>
                            <td className="text-center p-2 font-mono">{range.avgTokens}</td>
                            <td className="text-center p-2 font-mono">{range.users}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Tools Tab */}
      {activeTab === 'admin' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🔧 Ferramentas Administrativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exportar Dados */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">📊 Exportar Dados</h3>
                  <p className="text-sm text-muted-foreground mb-3">Baixar todos os dados do sistema</p>
                  <div className="space-x-2">
                    <Button onClick={() => exportData('csv')} size="sm" disabled={adminLoading}>
                      📄 CSV
                    </Button>
                    <Button onClick={() => exportData('json')} size="sm" variant="outline" disabled={adminLoading}>
                      📋 JSON
                    </Button>
                  </div>
                </div>

                {/* Backup Database */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">💾 Backup Database</h3>
                  <p className="text-sm text-muted-foreground mb-3">Criar backup completo do D1</p>
                  <Button onClick={backupDatabase} size="sm" disabled={adminLoading}>
                    💾 Criar Backup
                  </Button>
                </div>

                {/* Limpeza de Dados */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">🧹 Limpeza de Dados</h3>
                  <p className="text-sm text-muted-foreground mb-3">Remover dados antigos (90+ dias)</p>
                  <Button onClick={cleanOldData} size="sm" variant="destructive" disabled={adminLoading}>
                    🧹 Limpar Antigos
                  </Button>
                </div>

                {/* Teste D1 */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">🧪 Teste D1</h3>
                  <p className="text-sm text-muted-foreground mb-3">Testar conectividade do banco</p>
                  <Button onClick={testD1Direct} size="sm" variant="outline" disabled={adminLoading}>
                    🧪 Testar D1
                  </Button>
                </div>
              </div>

              {adminLoading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Processando...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}