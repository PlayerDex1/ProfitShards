import { memo, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Gem, Zap, Clock, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { CalculationResults, CalculationBreakdown, HistoryItem } from "@/types/calculator";
import { getCurrentUsername } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";

interface ResultsProps {
  results: CalculationResults | null;
  breakdown: CalculationBreakdown[];
  includeHistory?: boolean;
}

export const Results = memo(function Results({ results, breakdown, includeHistory = false }: ResultsProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const load = () => {
      const username = getCurrentUsername() ?? 'guest';
      const key = `worldshards-history-${username}`;
      const savedHistory = localStorage.getItem(key);
      setHistory(savedHistory ? JSON.parse(savedHistory) : []);
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('worldshards-history-updated', onUpdate);
    window.addEventListener('worldshards-auth-updated', onUpdate);
    return () => {
      window.removeEventListener('worldshards-history-updated', onUpdate);
      window.removeEventListener('worldshards-auth-updated', onUpdate);
    };
  }, [results]);

  const clearHistory = () => {
    const username = getCurrentUsername() ?? 'guest';
    const key = `worldshards-history-${username}`;
    localStorage.removeItem(key);
    setHistory([]);
  };

  if (!results) {
    return (
      <div className="space-y-4">
        <Card className="bg-black border-gray-800">
          <CardContent className="p-4">
            <div className="text-center text-white/80">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-50 text-white" />
              <p className="text-white text-sm">{t('header.subtitle')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-white/10 text-white';
      case 'positive':
        return 'bg-white/10 text-white';
      case 'negative':
        return 'bg-white/10 text-white';
      default:
        return 'bg-white/10 text-white';
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

  const performanceData = history.slice(-6).map((item, index) => ({
    name: new Date(item.timestamp).toLocaleDateString('pt-BR', { month: 'short' }),
    profit: item.results.finalProfit
  }));

  const tokenDistribution = [
    { name: t('results.farmedTokens'), value: Math.max(0, results.tokensFarmed - results.tokensEquipment), color: '#22d3ee' },
    { name: t('results.equipTokens'), value: results.tokensEquipment, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-4">
      {/* Final Profit Card */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-base font-semibold text-white">{t('results.finalProfit')}</h3>
          </div>
          <div className="text-3xl font-bold text-white font-mono" data-testid="text-final-profit">
            ${results.finalProfit.toFixed(2)}
          </div>
          <p className="text-white/80 text-sm mt-1">
            {results.finalProfit > 0 ? t('results.profitable') : t('results.loss')}
          </p>
        </CardContent>
      </Card>

      {/* Calculation Summary */}
      <Card className="bg-black border-gray-800">
        <CardHeader className="py-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-white" />
            <CardTitle className="text-base font-semibold text-white">{t('results.summaryTitle')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-white/80 text-sm">{item.key ? t(item.key) : item.metric}:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-semibold text-white text-sm">
                  {item.value}
                </span>
                <Badge className={`${getStatusColor(item.status)} text-[10px] py-0.5 px-2`}>
                  {getStatusLabel(item.status)}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Token Distribution */}
      <Card className="bg-black border-gray-800">
        <CardHeader className="py-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-white" />
            <CardTitle className="text-base font-semibold text-white">{t('results.tokenDistribution')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={tokenDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {tokenDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), t('results.tokenLabel')]} contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f43f5e' }}></div>
                <span className="text-white/80 text-sm">{t('results.equipTokens')}</span>
                <span className="ml-auto font-mono font-semibold text-white text-sm" data-testid="text-tokens-equipment">
                  {results.tokensEquipment.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22d3ee' }}></div>
                <span className="text-white/80 text-sm">{t('results.farmedTokens')}</span>
                <span className="ml-auto font-mono font-semibold text-white text-sm" data-testid="text-tokens-farmed">
                  {Math.max(0, results.tokensFarmed - results.tokensEquipment).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-white font-medium text-sm">Total de Tokens</span>
                <span className="ml-auto font-mono font-bold text-white text-base" data-testid="text-total-tokens">
                  {results.totalTokens.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <Card className="bg-black border-gray-800">
        <CardHeader className="py-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-white" />
            <CardTitle className="text-base font-semibold text-white">{t('results.efficiencyMetrics')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <div className="text-xs text-white/70 mb-1">{t('results.totalTokensLabel')}</div>
              <div className="text-xl font-bold text-white font-mono" data-testid="text-efficiency-total">
                {results.totalTokens.toLocaleString()}
              </div>
            </div>
            
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <div className="text-xs text-white/70 mb-1">{t('results.farmEfficiency')}</div>
              <div className="text-xl font-bold text-white font-mono" data-testid="text-efficiency-farm">
                {results.efficiency.toFixed(1)} {t('results.tokenLabel')}/carga
              </div>
            </div>

            <div className="text-center p-3 bg-white/10 border border-white/20 rounded-xl">
              <div className="text-xs text-white/70 mb-1">{t('results.roi')}</div>
              <div className="text-xl font-bold text-white font-mono" data-testid="text-roi">
                {results.roi > 0 ? '+' : ''}{results.roi.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      {history.length > 1 && (
        <Card className="bg-black border-gray-800">
          <CardHeader className="py-3">
            <CardTitle className="text-base font-semibold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-white" />
              <span>Performance ao Longo do Tempo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="#ffffff"/>
                  <YAxis stroke="#ffffff"/>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Lucro']} contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }} />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#ffffff" 
                    strokeWidth={2}
                    fill="rgba(255, 255, 255, 0.1)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {includeHistory && (
        <Card className="bg-black border-gray-800">
          <CardHeader className="py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-white" />
                <span>{t('results.history.title')}</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  data-testid="button-toggle-history"
                  className="text-white"
                >
                  {showHistory ? t('results.history.hide') : t('results.history.show')}
                </Button>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-white"
                    data-testid="button-clear-history"
                  >
                    {t('results.history.clear')}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {showHistory && history.length > 0 ? (
              <div className="space-y-2">
                {history.slice(-5).reverse().map((item, index) => (
                  <div key={index} className="border border-gray-800 rounded-lg p-3 bg-white/5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-1.5">
                          <span className={`text-xl font-bold font-mono text-white`}>
                            ${item.results.finalProfit.toFixed(2)}
                          </span>
                          <span className="text-xs text-white/70">
                            {new Date(item.timestamp).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(item.timestamp).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-white/80">
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
              <div className="text-center text-white/70 py-6">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50 text-white" />
                <p className="text-sm">{t('results.no_history')}</p>
                <p className="text-xs">{t('results.history_will_appear')}</p>
              </div>
            ) : (
              <p className="text-white/70 text-center py-3 text-sm">
                {t('results.history.clickToShow')}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
});
