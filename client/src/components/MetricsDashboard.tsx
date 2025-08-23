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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/metrics?days=${selectedPeriod}`, {
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
  }, [selectedPeriod]);

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
          <p className="text-muted-foreground">Análise simples das runs de mapa - {selectedPeriod} dias</p>
        </div>
        
        <div className="flex space-x-2">
          {[7, 30, 90].map(days => (
            <Button
              key={days}
              variant={selectedPeriod === days ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(days)}
            >
              {days}d
            </Button>
          ))}
          <Button onClick={loadMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
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
    </div>
  );
}