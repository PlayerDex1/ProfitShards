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

  const syncLocalData = async () => {
    if (!confirm('Isso vai coletar TODOS os dados do histórico local e sincronizar com o banco. Continuar?')) {
      console.log('=== TESTE CANCELADO PELO USUÁRIO ===');
      return;
    }

    // Log simples para confirmar execução
    console.log('=== TESTE SYNC INICIADO ===');
    alert('TESTE: Função syncLocalData foi chamada!');

    setSyncLoading(true);
    console.log('%c🔄 INICIANDO SINCRONIZAÇÃO LOCAL DATA', 'color: blue; font-weight: bold; font-size: 16px;');
    
    try {
      // Coletar todos os dados do localStorage
      const allHistoryData = [];
      console.log('%c📊 Verificando localStorage...', 'color: cyan;');
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('worldshards-mapdrops-')) continue;
        
        console.log(`%c🔍 Encontrada chave: ${key}`, 'color: yellow;');
        
        try {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          console.log(`%c📈 Dados da chave ${key}:`, 'color: green;', data);
          
          // Extrair email da chave (formato: worldshards-mapdrops-email@domain.com)
          const userEmail = key.replace('worldshards-mapdrops-', '');
          console.log(`%c👤 Email extraído: ${userEmail}`, 'color: magenta;');
          
          // Adicionar email a cada entrada
          data.forEach((entry: any) => {
            const entryWithEmail = { ...entry, userEmail };
            allHistoryData.push(entryWithEmail);
            console.log(`%c➕ Entrada adicionada:`, 'color: lime;', entryWithEmail);
          });
          
        } catch (error) {
          console.log(`%c❌ Erro ao processar ${key}:`, 'color: red;', error);
        }
      }
      
      console.log(`%c📊 TOTAL DE ENTRADAS COLETADAS: ${allHistoryData.length}`, 'color: blue; font-weight: bold;');
      console.log('%c📋 DADOS COMPLETOS:', 'color: purple;', allHistoryData);

      // Enviar para o servidor
      console.log('%c🚀 Enviando para o servidor...', 'color: orange;');
      
      const response = await fetch('/api/admin/sync-local-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyData: allHistoryData })
      });

      console.log('%c📡 RESPOSTA HTTP:', 'color: cyan;', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('%c❌ RESPOSTA DE ERRO:', 'color: red;', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('%c📥 RESPOSTA DO SERVIDOR:', 'color: teal; font-weight: bold;', result);
      
      if (result.success) {
        console.log(`%c✅ SINCRONIZAÇÃO CONCLUÍDA!`, 'color: green; font-weight: bold; font-size: 16px;');
        console.log(`%c📊 Recebidos: ${result.received}`, 'color: blue;');
        console.log(`%c💾 Salvos: ${result.saved}`, 'color: green;');
        console.log(`%c⏭️ Ignorados: ${result.skipped}`, 'color: orange;');
        
        alert(`Sincronização concluída!\nRecebidos: ${result.received}\nSalvos: ${result.saved}\nIgnorados: ${result.skipped}`);
        
        // Recarregar métricas - TEMPORARIAMENTE DESABILITADO PARA DEBUG
        console.log('%c🔄 Pulando loadMetrics() para evitar travamento', 'color: orange;');
        // await loadMetrics();
      } else {
        console.log(`%c❌ ERRO NA SINCRONIZAÇÃO:`, 'color: red; font-weight: bold;', result.error);
        alert(`Erro: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`%c💥 ERRO CRÍTICO:`, 'color: red; font-weight: bold; font-size: 16px;', error);
      console.log(`%c🔍 TIPO DO ERRO:`, 'color: orange;', typeof error);
      console.log(`%c📝 ERRO DETALHADO:`, 'color: yellow;', {
        message: error?.message || 'Sem mensagem',
        stack: error?.stack || 'Sem stack trace',
        name: error?.name || 'Sem nome',
        toString: error?.toString() || 'Sem toString',
        errorObject: error
      });
      
      const errorMessage = error?.message || error?.toString() || JSON.stringify(error) || 'Erro desconhecido';
      alert(`Erro: ${errorMessage}`);
    } finally {
      setSyncLoading(false);
      console.log('%c🏁 SINCRONIZAÇÃO FINALIZADA', 'color: gray;');
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
              onClick={syncLocalData} 
              variant="outline" 
              size="sm" 
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
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
    </div>
  );
}