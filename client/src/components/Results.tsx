import { memo, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Gem, Zap, Clock, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { CalculationResults, CalculationBreakdown, HistoryItem } from "@/types/calculator";

interface ResultsProps {
  results: CalculationResults | null;
  breakdown: CalculationBreakdown[];
}

export const Results = memo(function Results({ results, breakdown }: ResultsProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('worldshards-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [results]);

  const clearHistory = () => {
    localStorage.removeItem('worldshards-history');
    setHistory([]);
  };

  if (!results) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="text-center text-green-700 dark:text-green-300">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Configure os valores e os resultados aparecerão automaticamente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'positive':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'negative':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'positive': return 'Positivo';
      case 'negative': return 'Negativo';
      default: return 'Neutro';
    }
  };

  // Chart data for performance over time
  const performanceData = history.slice(-6).map((item, index) => ({
    name: new Date(item.timestamp).toLocaleDateString('pt-BR', { month: 'short' }),
    profit: item.results.finalProfit
  }));

  // Pie chart data for token distribution
  const tokenDistribution = [
    { name: 'Tokens Equipamentos', value: results.tokensEquipment, color: '#3B82F6' },
    { name: 'Tokens Farmados', value: results.tokensFarmed, color: '#10B981' }
  ];

  return (
    <div className="space-y-6">
      {/* Final Profit Card */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-profit rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Lucro Líquido Final</h3>
          </div>
          <div className="text-4xl font-bold text-green-900 dark:text-green-100 font-mono" data-testid="text-final-profit">
            ${results.finalProfit.toFixed(2)}
          </div>
          <p className="text-green-700 dark:text-green-300 mt-2">
            {results.finalProfit > 0 ? 'Investimento Lucrativo' : 'Prejuízo'}
          </p>
        </CardContent>
      </Card>

      {/* Calculation Summary */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-info" />
            <CardTitle className="text-lg font-semibold text-card-foreground">Resumo dos Cálculos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
              <span className="text-muted-foreground">{item.metric}:</span>
              <div className="flex items-center space-x-2">
                <span className={`font-mono font-semibold ${
                  item.status === 'negative' ? 'text-loss' : 'text-card-foreground'
                }`}>
                  {item.value}
                </span>
                <Badge className={getStatusColor(item.status)}>
                  {getStatusLabel(item.status)}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Token Distribution */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-lg font-semibold text-card-foreground">Distribuição de Tokens</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={tokenDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {tokenDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'Tokens']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">Tokens dos Equipamentos</span>
                <span className="ml-auto font-mono font-semibold text-card-foreground" data-testid="text-tokens-equipment">
                  {results.tokensEquipment.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-4 h-4 bg-profit rounded-full"></div>
                <span className="text-muted-foreground">Tokens Farmados</span>
                <span className="ml-auto font-mono font-semibold text-card-foreground" data-testid="text-tokens-farmed">
                  {results.tokensFarmed.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-profit/10 border border-profit/20 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-r from-profit to-blue-500 rounded-full"></div>
                <span className="text-card-foreground font-medium">Total de Tokens</span>
                <span className="ml-auto font-mono font-bold text-profit text-lg" data-testid="text-total-tokens">
                  {results.totalTokens.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg font-semibold text-card-foreground">Métricas de Eficiência</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">Total de Tokens</div>
              <div className="text-2xl font-bold text-purple-600 font-mono" data-testid="text-efficiency-total">
                {results.totalTokens.toLocaleString()}
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">Eficiência Farm</div>
              <div className="text-2xl font-bold text-blue-600 font-mono" data-testid="text-efficiency-farm">
                {results.efficiency.toFixed(1)} tokens/carga
              </div>
            </div>

            <div className="text-center p-4 bg-profit/10 border border-profit/20 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">ROI</div>
              <div className="text-2xl font-bold text-profit font-mono" data-testid="text-roi">
                {results.roi > 0 ? '+' : ''}{results.roi.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      {history.length > 1 && (
        <Card className="bg-card shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-info" />
              <span>Performance ao Longo do Tempo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Lucro']} />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fill="rgba(16, 185, 129, 0.1)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Section */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>Histórico de Cálculos</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                data-testid="button-toggle-history"
              >
                {showHistory ? 'Ocultar' : 'Mostrar'}
              </Button>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-loss hover:text-red-700"
                  data-testid="button-clear-history"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showHistory && history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(-5).reverse().map((item, index) => (
                <div key={index} className="border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className={`text-2xl font-bold font-mono ${
                          item.results.finalProfit > 0 ? 'text-profit' : 'text-loss'
                        }`}>
                          ${item.results.finalProfit.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(item.timestamp).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <span>Investimento: ${item.formData.investment}</span>
                        <span>Tokens: {item.results.totalTokens.toLocaleString()}</span>
                        <span>Eficiência: {item.results.efficiency.toFixed(1)}/carga</span>
                        <span>ROI: {item.results.roi.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : showHistory && history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cálculo salvo ainda</p>
              <p className="text-sm">Seus cálculos aparecerão aqui automaticamente</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Clique em "Mostrar" para ver o histórico
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
