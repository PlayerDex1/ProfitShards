import { memo } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalculationResults, CalculationBreakdown } from "@/types/calculator";
import { useI18n } from "@/i18n";

interface ResultsProps {
  results: CalculationResults | null;
  breakdown: CalculationBreakdown[];
  formData?: any;
  totalLuck?: number;
}

export const Results = memo(function Results({ results, breakdown }: ResultsProps) {
  const { t } = useI18n();

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

  const getStatusColor = (status: string) => {
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
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'positive': return 'Positivo';
      case 'negative': return 'Negativo';
      default: return 'Neutro';
    }
  };

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
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                <strong>PIX:</strong> profitshards@gmail.com
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>PayPal:</strong> @profitshards
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
