import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Map, Target, RefreshCw } from 'lucide-react';

interface MapMetricsData {
  totalRuns: number;
  averageLuck: number;
  averageTokens: number;
  uniqueUsers: number;
  mapBreakdown: Array<{
    map_name: string;
    total_runs: number;
    avg_luck: number;
    avg_tokens: number;
    avg_efficiency: number;
  }>;
  luckRanges: Array<{
    luck_range: string;
    total_runs: number;
    avg_tokens: number;
    avg_efficiency: number;
  }>;
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MapMetricsData | null>(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<any>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [localData, setLocalData] = useState<any[]>([]);
  const [showLocalData, setShowLocalData] = useState(false);

  const fetchDebugData = async () => {
    try {
      const response = await fetch('/api/admin/debug-data', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setDebugData(data);
      console.log('🔍 DEBUG DATA COMPLETO:', data);
    } catch (err) {
      console.error('Erro ao buscar debug data:', err);
    }
  };

  const fixTimestamps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/fix-timestamps', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🔧 TIMESTAMPS CORRIGIDOS:', result);
      
      // Recarregar dados após correção
      await loadMetrics();
      await fetchDebugData();
      
    } catch (err) {
      console.error('Erro ao corrigir timestamps:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetMetrics = async () => {
    if (!confirm('⚠️ ATENÇÃO: Isso vai apagar TODOS os dados de métricas! Continuar?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reset-metrics', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🗑️ MÉTRICAS RESETADAS:', result);
      
      // Recarregar dados após reset
      await loadMetrics();
      await fetchDebugData();
      
    } catch (err) {
      console.error('Erro ao resetar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async () => {
    const email = prompt('Digite o email do usuário para verificar:');
    if (!email) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/check-user', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🔍 VERIFICAÇÃO DE USUÁRIO:', result);
      
      // Mostrar resultado em alert também
      const metrics = result.metrics?.total_records || 0;
      const sessions = result.sessions?.active_sessions || 0;
      alert(`👤 Usuário: ${email}\n📊 Métricas: ${metrics} registros\n🔐 Sessões: ${sessions} ativas\n\nVeja console para detalhes completos`);
      
    } catch (err) {
      console.error('Erro ao verificar usuário:', err);
      alert('Erro ao verificar usuário. Veja console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const viewLocalData = () => {
    console.log('VIEW: Coletando dados locais...');
    const allData = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('worldshards-mapdrops-')) continue;
      
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const userEmail = key.replace('worldshards-mapdrops-', '');
        
        data.forEach((entry: any) => {
          allData.push({
            ...entry,
            userEmail,
            mapName: entry.mapSize || 'unknown',
            date: new Date(entry.timestamp).toLocaleDateString('pt-BR'),
            time: new Date(entry.timestamp).toLocaleTimeString('pt-BR')
          });
        });
        
      } catch (error) {
        console.log('VIEW: Erro ao processar', key, error);
      }
    }
    
    console.log('VIEW: Total coletado:', allData.length);
    setLocalData(allData);
    setShowLocalData(true);
  };

  const syncLocalData = async () => {
    alert('Função syncLocalData executada!');
    console.log('SYNC: Iniciando...');
    
    // Coletar dados do localStorage
    console.log('SYNC: Coletando dados do localStorage...');
    const allHistoryData = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('worldshards-mapdrops-')) continue;
      
      console.log('SYNC: Chave encontrada:', key);
      
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const userEmail = key.replace('worldshards-mapdrops-', '');
        
        console.log('SYNC: Email:', userEmail, 'Entradas:', data.length);
        
        data.forEach((entry) => {
          const entryWithEmail = { ...entry, userEmail };
          allHistoryData.push(entryWithEmail);
          console.log('SYNC: Entrada adicionada:', JSON.stringify(entryWithEmail, null, 2));
        });
        
      } catch (error) {
        console.log('SYNC: Erro ao processar', key, error);
      }
    }
    
    console.log('SYNC: Total coletado:', allHistoryData.length);
    
    try {
      const response = await fetch('/api/admin/sync-local-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyData: allHistoryData })
      });
      
      const result = await response.json();
      console.log('SYNC: Resultado:', result);
      alert(`Resultado: Recebidos: ${result.received || 0}, Salvos: ${result.saved || 0}, Ignorados: ${result.skipped || 0}`);
      
    } catch (error) {
      console.log('SYNC: Erro:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/metrics?days=${period}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando métricas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-red-500 mb-4">Erro ao carregar métricas: {error}</p>
            <Button onClick={loadMetrics} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-6">
            Nenhuma métrica disponível ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
              <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">🗺️ Métricas do Map Planner</h2>
            <p className="text-muted-foreground">Análise de TODAS as runs de mapa (sem filtro de período)</p>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={loadMetrics} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
                      <Button onClick={fetchDebugData} variant="outline" size="sm">
              Debug Data
            </Button>
            <Button onClick={fixTimestamps} variant="outline" size="sm" className="bg-yellow-100">
              Fix Timestamps
            </Button>
            <Button 
              onClick={() => { loadMetrics(); fetchDebugData(); }} 
              variant="default" 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
            >
              Reload All
            </Button>
            <Button 
              onClick={resetMetrics} 
              variant="outline" 
              size="sm" 
              className="bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
            >
              Reset Data
            </Button>
            <Button 
              onClick={checkUser} 
              variant="outline" 
              size="sm" 
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300"
            >
              Check User
            </Button>
            <Button 
              onClick={viewLocalData} 
              variant="outline" 
              size="sm" 
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
            >
              View Local Data
            </Button>
            <Button 
              onClick={syncLocalData} 
              variant="outline" 
              size="sm" 
              className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
            >
              Sync Local Data
            </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Map className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Runs</p>
                <p className="text-2xl font-bold">{metrics.totalRuns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Usuários Únicos</p>
                <p className="text-2xl font-bold">{metrics.uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Luck Médio</p>
                <p className="text-2xl font-bold">{metrics.averageLuck.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Tokens Médios</p>
                <p className="text-2xl font-bold">{metrics.averageTokens.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown por Mapa */}
      {metrics.mapBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🗺️ Breakdown por Mapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Mapa</th>
                    <th className="text-left p-2">Total Runs</th>
                    <th className="text-left p-2">Luck Médio</th>
                    <th className="text-left p-2">Tokens Médios</th>
                    <th className="text-left p-2">Eficiência</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.mapBreakdown.map((map: any, index: number) => (
                    <tr key={map.map_name} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium capitalize">{map.map_name}</td>
                      <td className="p-2">{map.total_runs}</td>
                      <td className="p-2">{map.avg_luck.toFixed(1)}</td>
                      <td className="p-2 text-green-600 font-semibold">{map.avg_tokens.toFixed(1)}</td>
                      <td className="p-2 text-blue-600">{map.avg_efficiency.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown por Faixa de Luck */}
      {metrics.luckRanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Breakdown por Faixa de Luck</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Faixa de Luck</th>
                    <th className="text-left p-2">Total Runs</th>
                    <th className="text-left p-2">Tokens Médios</th>
                    <th className="text-left p-2">Eficiência</th>
                    <th className="text-left p-2">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.luckRanges.map((range: any, index: number) => {
                    const performance = range.avg_efficiency > 3.0 ? 'excellent' : 
                                      range.avg_efficiency > 2.5 ? 'positive' : 
                                      range.avg_efficiency > 2.0 ? 'neutral' : 'negative';
                    const performanceColor = performance === 'excellent' ? 'text-green-600' :
                                           performance === 'positive' ? 'text-blue-600' :
                                           performance === 'neutral' ? 'text-yellow-600' : 'text-red-600';
                    const performanceIcon = performance === 'excellent' ? '🔥' :
                                          performance === 'positive' ? '✅' :
                                          performance === 'neutral' ? '⚡' : '📉';
                    
                    return (
                      <tr key={range.luck_range} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{range.luck_range}</td>
                        <td className="p-2">{range.total_runs}</td>
                        <td className="p-2 text-green-600 font-semibold">{range.avg_tokens.toFixed(1)}</td>
                        <td className="p-2 text-blue-600">{range.avg_efficiency.toFixed(2)}</td>
                        <td className={`p-2 ${performanceColor} font-medium`}>
                          {performanceIcon} {performance === 'excellent' ? 'Excelente' :
                                            performance === 'positive' ? 'Bom' :
                                            performance === 'neutral' ? 'Normal' : 'Baixo'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder quando não há dados */}
      {metrics.totalRuns === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Coletando Dados Reais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Map className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-2">Sistema Ativo</p>
              <p className="text-sm mb-4">
                As métricas aparecerão conforme os usuários salvarem suas runs no Map Planner.
              </p>
              <div className="p-4 bg-muted/50 rounded-lg text-left">
                <h4 className="font-semibold mb-2">🔄 Como funciona:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Usuários fazem runs e salvam no Map Planner</li>
                  <li>• Dados são coletados automaticamente (anônimos)</li>
                  <li>• Métricas são calculadas em tempo real</li>
                  <li>• Dashboard atualiza com dados reais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Privacidade */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="text-green-600 text-2xl">🔒</div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Privacidade Garantida
              </h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>✅ Dados 100% anônimos - sem emails ou nicks</li>
                <li>✅ Apenas métricas de gameplay (mapa, luck, tokens)</li>
                <li>✅ Acesso restrito apenas ao administrador</li>
                <li>✅ Foco em otimização da experiência do jogo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Data Section */}
      {debugData && (
        <Card className="mt-6 border-gray-400 bg-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-yellow-300">🔍 Debug Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-3">
              <div className="p-2 bg-gray-700 rounded">
                <strong className="text-blue-300">Admin:</strong> 
                <span className="ml-2 text-green-300">{debugData.admin_user}</span>
              </div>
              
              <div className="p-2 bg-gray-700 rounded">
                <strong className="text-blue-300">Tabelas no banco:</strong> 
                <span className="ml-2 text-yellow-300">{debugData.database_info.total_tables}</span>
              </div>
              
              <div className="p-2 bg-gray-700 rounded">
                <strong className="text-blue-300">Map Drop Metrics:</strong>
                <div className="ml-4 mt-1">
                  {debugData.map_drop_metrics.table_exists ? 
                    <span className="text-green-300">✅ Tabela existe ({debugData.map_drop_metrics.total_records} registros)</span> : 
                    <span className="text-red-300">❌ Tabela não existe</span>
                  }
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-2 bg-gray-700 rounded">
                  <strong className="text-blue-300">Usuários:</strong> 
                  <span className="ml-2 text-cyan-300">{debugData.other_tables.users.count}</span>
                </div>
                
                <div className="p-2 bg-gray-700 rounded">
                  <strong className="text-blue-300">Sessões ativas:</strong> 
                  <span className="ml-2 text-cyan-300">{debugData.other_tables.sessions.active_count}</span>
                </div>
              </div>
              
              {debugData.map_drop_metrics.recent_data && debugData.map_drop_metrics.recent_data.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold text-yellow-300 hover:text-yellow-200">
                    📊 Últimos registros ({debugData.map_drop_metrics.recent_data.length}) - Clique para expandir
                  </summary>
                  <div className="mt-3 p-3 bg-black rounded border border-gray-600">
                    <pre className="text-xs text-green-300 overflow-auto max-h-60 whitespace-pre-wrap">
                      {JSON.stringify(debugData.map_drop_metrics.recent_data, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
              
              <div className="mt-4 p-2 bg-blue-900 rounded border border-blue-600">
                <div className="text-blue-200 text-xs">
                  💡 <strong>Dica:</strong> Se você acabou de fazer um teste e não apareceu, 
                  clique em "Fix Timestamps" e depois "Refresh" para recarregar os dados.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Data Section */}
      {showLocalData && localData.length > 0 && (
        <Card className="mt-6 border-gray-400 bg-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-yellow-300">💾 Dados Locais do Map Planner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Usuário</th>
                    <th className="text-left p-2">Mapa</th>
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Hora</th>
                    <th className="text-left p-2">Luck</th>
                    <th className="text-left p-2">Tokens</th>
                    <th className="text-left p-2">Eficiência</th>
                  </tr>
                </thead>
                <tbody>
                  {localData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{item.userEmail}</td>
                      <td className="p-2 font-medium">{item.mapName}</td>
                      <td className="p-2">{item.date}</td>
                      <td className="p-2">{item.time}</td>
                      <td className="p-2 text-green-600 font-semibold">{item.luck.toFixed(1)}</td>
                      <td className="p-2 text-blue-600 font-semibold">{item.tokens.toFixed(1)}</td>
                      <td className="p-2 text-blue-600">{item.efficiency.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}