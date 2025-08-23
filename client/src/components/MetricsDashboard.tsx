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

      {/* Placeholder para dados futuros */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Dados de Map Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Sistema em Desenvolvimento</p>
            <p className="text-sm">
              As métricas do Map Planner serão coletadas automaticamente quando os usuários salvarem suas runs.
            </p>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left">
              <h4 className="font-semibold mb-2">📋 Métricas que serão coletadas:</h4>
              <ul className="text-sm space-y-1">
                <li>• Quantidade de tokens dropados por mapa</li>
                <li>• Luck utilizado em cada run</li>
                <li>• Eficiência (tokens/load)</li>
                <li>• Mapas mais populares</li>
                <li>• Correlação luck vs drops</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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