import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calculator, Target, RefreshCw } from 'lucide-react';

interface MetricsData {
  farmingByLuck: any[];
  mapDropsByLuck: any[];
  topPerformers: any[];
  generalStats: any;
  period: string;
  generated_at: string;
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
          <h2 className="text-2xl font-bold">📊 Métricas de Farming</h2>
          <p className="text-muted-foreground">Análise anônima dos usuários - {metrics.period}</p>
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
              <Calculator className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Cálculos</p>
                <p className="text-2xl font-bold">{metrics.generalStats?.total_calculations || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Usuários Ativos</p>
                <p className="text-2xl font-bold">{metrics.generalStats?.active_users || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Lucro Médio</p>
                <p className="text-2xl font-bold">${(metrics.generalStats?.global_avg_profit || 0).toFixed(2)}</p>
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
                <p className="text-2xl font-bold">{(metrics.generalStats?.global_avg_luck || 0).toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico: Lucro por Luck */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Lucro Médio por Faixa de Luck</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.farmingByLuck}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="luck_range" label={{ value: 'Luck', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Lucro ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'avg_profit' ? `$${value.toFixed(2)}` : value.toFixed(1),
                  name === 'avg_profit' ? 'Lucro Médio' : 'ROI Médio (%)'
                ]}
                labelFormatter={(label) => `Luck: ${label}`}
              />
              <Bar dataKey="avg_profit" fill="#8884d8" name="avg_profit" />
              <Bar dataKey="avg_roi" fill="#82ca9d" name="avg_roi" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico: Eficiência por Luck */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Eficiência por Faixa de Luck</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.farmingByLuck}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="luck_range" label={{ value: 'Luck', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Tokens/Load', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(2), 'Tokens por Load']}
                labelFormatter={(label) => `Luck: ${label}`}
              />
              <Line type="monotone" dataKey="avg_tokens_per_load" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela: Top Performers Anônimos */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Top Performers (Anônimos)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Hash Usuário</th>
                  <th className="text-left p-2">Cálculos</th>
                  <th className="text-left p-2">Lucro Médio</th>
                  <th className="text-left p-2">Melhor Lucro</th>
                  <th className="text-left p-2">Luck Médio</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topPerformers.map((performer: any, index: number) => (
                  <tr key={performer.user_hash} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-bold">#{index + 1}</td>
                    <td className="p-2 font-mono text-xs">{performer.user_hash}</td>
                    <td className="p-2">{performer.total_calculations}</td>
                    <td className="p-2 text-green-600 font-semibold">${performer.avg_profit.toFixed(2)}</td>
                    <td className="p-2 text-blue-600 font-semibold">${performer.best_profit.toFixed(2)}</td>
                    <td className="p-2">{performer.avg_luck.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico: Map Drops por Luck */}
      {metrics.mapDropsByLuck.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🗺️ Map Drops por Faixa de Luck</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.mapDropsByLuck}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="luck_range" label={{ value: 'Luck', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Tokens Médios', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(2), 'Tokens Médios por Run']}
                  labelFormatter={(label) => `Luck: ${label}`}
                />
                <Bar dataKey="avg_tokens_dropped" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
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
                <li>✅ Hash único não-reversível por usuário</li>
                <li>✅ Apenas métricas agregadas de farming</li>
                <li>✅ Acesso restrito apenas ao administrador</li>
                <li>✅ Dados usados apenas para otimização do jogo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}