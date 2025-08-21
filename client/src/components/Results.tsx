import { memo, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Gem, Zap, Clock, PieChart, EyeOff, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TokenDistributionChart } from '@/components/charts/TokenDistributionChart';
import { ProfitSensitivityChart } from '@/components/charts/ProfitSensitivityChart';
import { CalculationResults, CalculationBreakdown, HistoryItem } from "@/types/calculator";
import { getCurrentUsername } from "@/hooks/use-auth";
import { clearHistoryRemote, deleteHistoryItem, getHistoryCached, refreshHistory } from "@/lib/historyApi";
import { useI18n } from "@/i18n";

interface ResultsProps {
  results: CalculationResults | null;
  breakdown: CalculationBreakdown[];
  includeHistory?: boolean;
  visible?: {
    summary?: boolean;
    distribution?: boolean;
    efficiency?: boolean;
    sensitivity?: boolean;
    performance?: boolean;
    history?: boolean;
  };
  onChangeVisibility?: (section: "summary" | "distribution" | "efficiency" | "sensitivity" | "performance", value: boolean) => void;
}

export const Results = memo(function Results({ results, breakdown, includeHistory = false, visible, onChangeVisibility }: ResultsProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const load = () => {
      setHistory(getHistoryCached());
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('worldshards-history-updated', onUpdate);
    window.addEventListener('worldshards-auth-updated', () => {
      refreshHistory().then(load).catch(load);
    });
    return () => {
      window.removeEventListener('worldshards-history-updated', onUpdate);
      window.removeEventListener('worldshards-auth-updated', () => {});
    };
  }, [results]);

  const clearHistory = () => {
    clearHistoryRemote().catch(() => {});
  };

  const show = {
    summary: visible?.summary ?? true,
    distribution: visible?.distribution ?? true,
    efficiency: visible?.efficiency ?? true,
    sensitivity: visible?.sensitivity ?? true,
    performance: visible?.performance ?? true,
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
    { name: t('results.netTokens'), value: Math.max(0, results.tokensFarmed - results.tokensEquipment), color: '#22d3ee' },
    { name: t('results.equipTokens'), value: results.tokensEquipment, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-4">
      {/* Final Profit Card */}
      {show.summary && (
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
      )}

      {/* Calculation Summary */}
      {show.summary ? (
      <Card className="bg-black border-gray-800">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-white" />
              <CardTitle className="text-base font-semibold text-white">{t('results.summaryTitle')}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("summary", false)} aria-label="Ocultar seção">
              <EyeOff className="w-4 h-4" />
            </Button>
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
      ) : (
      <Card className="bg-black/40 border-gray-800">
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white/80">Resumo (oculto)</CardTitle>
            <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("summary", true)} aria-label="Mostrar seção">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
      )}

      {/* Token Distribution */}
      {show.distribution ? (
      <Card className="bg-black border-gray-800">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-white" />
              <CardTitle className="text-base font-semibold text-white">{t('results.tokenDistribution')}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("distribution", false)} aria-label="Ocultar seção">
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-52">
              <TokenDistributionChart data={tokenDistribution} totalTokens={results.totalTokens} totalLabel={t('results.netTokens')} />
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
                <span className="text-white/80 text-sm">{t('results.netTokens')}</span>
                <span className="ml-auto font-mono font-semibold text-white text-sm" data-testid="text-tokens-farmed">
                  {Math.max(0, results.tokensFarmed - results.tokensEquipment).toLocaleString()}
                </span>
              </div>
              
            </div>
          </div>
        </CardContent>
      </Card>
      ) : (
      <Card className="bg-black/40 border-gray-800">
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white/80">Distribuição de Tokens (oculto)</CardTitle>
            <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("distribution", true)} aria-label="Mostrar seção">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
      )}

      {/* Efficiency Metrics */}
      {show.efficiency ? (
      <Card className="bg-black border-gray-800">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-white" />
              <CardTitle className="text-base font-semibold text-white">{t('results.efficiencyMetrics')}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("efficiency", false)} aria-label="Ocultar seção">
              <EyeOff className="w-4 h-4" />
            </Button>
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
      ) : (
      <Card className="bg-black/40 border-gray-800">
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white/80">Eficiência (oculto)</CardTitle>
            <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("efficiency", true)} aria-label="Mostrar seção">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
      )}

      {/* Profit Sensitivity (Token Price) */}
      {show.sensitivity ? (
      <Card className="bg-black border-gray-800">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-white" />
              <CardTitle className="text-base font-semibold text-white">Análise de Sensibilidade (Preço do Token)</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("sensitivity", false)} aria-label="Ocultar seção">
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-56">
            <ProfitSensitivityChart currentTokenPrice={(history[history.length - 1]?.formData.tokenPrice) ?? 0} results={results} />
          </div>
          <p className="text-white/70 text-xs mt-2">Variação do lucro entre 50% e 150% do preço atual.</p>
        </CardContent>
      </Card>
      ) : (
      <Card className="bg-black/40 border-gray-800">
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white/80">Sensibilidade (oculto)</CardTitle>
            <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("sensitivity", true)} aria-label="Mostrar seção">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
      )}

      {/* Performance Chart */}
      {history.length > 1 && show.performance ? (
        <Card className="bg-black border-gray-800">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-white" />
                <span>Performance ao Longo do Tempo</span>
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("performance", false)} aria-label="Ocultar seção">
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
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
      ) : (!show.performance ? (
        <Card className="bg-black/40 border-gray-800">
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/80">Performance (oculto)</CardTitle>
              <Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.("performance", true)} aria-label="Mostrar seção">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : null)}

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
