import { memo, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Gem, Zap, Clock, PieChart, EyeOff, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TokenDistributionChart } from '@/components/charts/TokenDistributionChart';
import { ProfitSensitivityChart } from '@/components/charts/ProfitSensitivityChart';
import { CalculationResults, CalculationBreakdown, HistoryItem } from "@/types/calculator";
import { getHistoryCached } from "@/lib/historyApi";
import { useI18n } from "@/i18n";

interface ResultsProps {
  results: CalculationResults | null;
  breakdown: CalculationBreakdown[];
  formData?: any;
  totalLuck?: number;
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

export const Results = memo(function Results({ 
  results, 
  breakdown, 
  formData, 
  totalLuck, 
  visible, 
  onChangeVisibility 
}: ResultsProps) {
  const { t } = useI18n();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history for performance chart
  useEffect(() => {
    if (visible) { // Only load history for profile version
      const loadHistory = () => {
        setHistory(getHistoryCached());
      };
      loadHistory();
      
      const handleHistoryUpdate = () => {
        setHistory(getHistoryCached());
      };
      
      window.addEventListener('worldshards-history-updated', handleHistoryUpdate);
      return () => window.removeEventListener('worldshards-history-updated', handleHistoryUpdate);
    }
  }, [visible]);

  // Determine if this is the simple version (main page) or full version (profile)
  const isSimpleVersion = !visible && !onChangeVisibility;

  if (!results) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t('header.subtitle')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simple version for main page
  if (isSimpleVersion) {
    return (
      <div className="space-y-4">
        {/* Final Profit Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                {results.finalProfit >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <h3 className="text-base font-semibold text-foreground">{t('results.finalProfit')}</h3>
            </div>
            <div className="text-3xl font-bold text-foreground font-mono" data-testid="text-final-profit">
              ${results.finalProfit.toFixed(2)}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {results.finalProfit > 0 ? t('results.profitable') : t('results.loss')}
            </p>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-semibold text-foreground">Métricas Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {breakdown.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground text-sm">{item.key ? t(item.key) : item.metric}:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-semibold text-foreground text-sm">
                    {item.value}
                  </span>
                  <Badge className={`${getStatusColor(item.status)} text-[10px] py-0.5 px-2 border`}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Donation Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-foreground mb-2">💖 Apoie o Projeto</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Ajude a manter esta ferramenta gratuita e atualizada
              </p>
              <div className="space-y-3">
                {/* OpenLoot Ambassador */}
                <div className="flex items-center justify-between gap-2 p-2 bg-white/5 rounded">
                  <span className="text-xs text-muted-foreground">OpenLoot Ambassador</span>
                  <a 
                    href="https://openloot.com/ambassador/link?code=HOLDBOY" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/80 transition-colors"
                  >
                    My Link
                  </a>
                </div>
                
                {/* Wallet EVM */}
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Wallet EVM:</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-mono text-foreground break-all select-all bg-black/20 p-1 rounded flex-1">
                      0x05b6D4956C8317FF143120Ec5C100c6FE0eCD0B5
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('0x05b6D4956C8317FF143120Ec5C100c6FE0eCD0B5');
                        // Feedback visual opcional
                      }}
                      className="text-xs bg-white/10 text-foreground px-2 py-1 rounded hover:bg-white/20 transition-colors"
                      title="Copiar endereço"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full version for profile
  const show = {
    summary: visible?.summary ?? true,
    distribution: visible?.distribution ?? true,
    efficiency: visible?.efficiency ?? true,
    sensitivity: visible?.sensitivity ?? true,
    performance: visible?.performance ?? true,
  };

  const tokenDistribution = [
    { name: t('results.netTokens'), value: Math.max(0, results.tokensFarmed - results.tokensEquipment), color: '#22d3ee' },
    { name: t('results.equipTokens'), value: results.tokensEquipment, color: '#f43f5e' }
  ];

  const performanceData = history.slice(-6).map((item, index) => ({
    name: new Date(item.timestamp).toLocaleDateString('pt-BR', { month: 'short' }),
    profit: item.results.finalProfit
  }));

  return (
    <div className="space-y-4">
      {/* Final Profit Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
              {results.finalProfit >= 0 ? (
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              ) : (
                <TrendingDown className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <h3 className="text-base font-semibold text-foreground">{t('results.finalProfit')}</h3>
          </div>
          <div className="text-3xl font-bold text-foreground font-mono" data-testid="text-final-profit">
            ${results.finalProfit.toFixed(2)}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {results.finalProfit > 0 ? t('results.profitable') : t('results.loss')}
          </p>
        </CardContent>
      </Card>

      {/* Summary */}
      {show.summary ? (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <CardTitle className="text-base font-semibold">{t('results.summaryTitle')}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("summary", false)} aria-label="Ocultar seção">
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {breakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground text-sm">{item.key ? t(item.key) : item.metric}:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-semibold text-foreground text-sm">
                    {item.value}
                  </span>
                  <Badge className={`${getStatusColor(item.status)} text-[10px] py-0.5 px-2 border`}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/30">
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resumo (oculto)</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("summary", true)} aria-label="Mostrar seção">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Token Distribution */}
      {show.distribution ? (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4" />
                <CardTitle className="text-base font-semibold">{t('results.tokenDistribution')}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("distribution", false)} aria-label="Ocultar seção">
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
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f43f5e' }}></div>
                  <span className="text-muted-foreground text-sm">{t('results.equipTokens')}</span>
                  <span className="ml-auto font-mono font-semibold text-foreground text-sm">
                    {results.tokensEquipment.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22d3ee' }}></div>
                  <span className="text-muted-foreground text-sm">{t('results.netTokens')}</span>
                  <span className="ml-auto font-mono font-semibold text-foreground text-sm">
                    {Math.max(0, results.tokensFarmed - results.tokensEquipment).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/30">
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Distribuição de Tokens (oculto)</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("distribution", true)} aria-label="Mostrar seção">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Efficiency Metrics */}
      {show.efficiency ? (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <CardTitle className="text-base font-semibold">{t('results.efficiencyMetrics')}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("efficiency", false)} aria-label="Ocultar seção">
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 rounded-lg hover:shadow-md transition-shadow">
                <Zap className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <div className="text-xs text-muted-foreground mb-1">{t('results.totalTokensLabel')}</div>
                <div className="text-xl font-bold text-blue-600 font-mono">
                  {results.totalTokens.toLocaleString()}
                </div>
              </div>
              
              <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-lg hover:shadow-md transition-shadow">
                <BarChart3 className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <div className="text-xs text-muted-foreground mb-1">{t('results.farmEfficiency')}</div>
                <div className="text-xl font-bold text-green-600 font-mono">
                  {results.efficiency.toFixed(1)} {t('results.tokenLabel')}/carga
                </div>
              </div>

              <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 rounded-lg hover:shadow-md transition-shadow">
                <TrendingUp className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <div className="text-xs text-muted-foreground mb-1">{t('results.roi')}</div>
                <div className="text-xl font-bold text-purple-600 font-mono">
                  {results.roi > 0 ? '+' : ''}{results.roi.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/30">
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Eficiência (oculto)</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("efficiency", true)} aria-label="Mostrar seção">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Sensitivity Analysis */}
      {show.sensitivity ? (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <CardTitle className="text-base font-semibold">Análise de Sensibilidade (Preço do Token)</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("sensitivity", false)} aria-label="Ocultar seção">
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-56">
              <ProfitSensitivityChart currentTokenPrice={formData?.tokenPrice || 0} results={results} />
            </div>
            <p className="text-muted-foreground text-xs mt-2">Variação do lucro entre 50% e 150% do preço atual.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/30">
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sensibilidade (oculto)</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("sensitivity", true)} aria-label="Mostrar seção">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Performance Chart */}
      {history.length > 1 && show.performance ? (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Performance ao Longo do Tempo</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("performance", false)} aria-label="Ocultar seção">
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Lucro']} 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))', 
                      color: 'hsl(var(--foreground))' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="hsl(var(--primary))"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (!show.performance ? (
        <Card className="bg-muted/30">
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Performance (oculto)</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onChangeVisibility?.("performance", true)} aria-label="Mostrar seção">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : null)}
    </div>
  );

  function getStatusColor(status: string) {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'positive':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'positive': return 'Positivo';
      case 'negative': return 'Negativo';
      default: return 'Neutro';
    }
  }
});
