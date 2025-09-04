import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  DollarSign,
  Clock,
  BarChart3
} from "lucide-react";

interface Recommendation {
  id: string;
  type: 'optimization' | 'warning' | 'tip' | 'success';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  icon: React.ComponentType<any>;
  action?: string;
  value?: number;
}

interface CalculatorData {
  investment: number;
  gemsConsumed: number;
  tokenPrice: number;
  mapType: string;
  luck: number;
  level: number;
}

interface RecommendationsEngineProps {
  formData: CalculatorData;
  results: any;
  onApplyRecommendation?: (recommendation: Recommendation) => void;
}

export function RecommendationsEngine({ formData, results, onApplyRecommendation }: RecommendationsEngineProps) {
  
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // Análise de ROI
    if (results?.finalProfit && results?.finalProfit < 0) {
      recommendations.push({
        id: 'negative-roi',
        type: 'warning',
        title: 'ROI Negativo Detectado',
        description: 'Esta estratégia está gerando prejuízo. Considere ajustar os parâmetros.',
        impact: 'high',
        icon: AlertTriangle,
        action: 'Ajustar parâmetros'
      });
    }

    // Análise de eficiência de gems
    const gemsPerToken = formData.gemsConsumed / (results?.tokensEarned || 1);
    if (gemsPerToken > 50) {
      recommendations.push({
        id: 'high-gem-cost',
        type: 'optimization',
        title: 'Custo de Gems Elevado',
        description: `Você está gastando ${gemsPerToken.toFixed(1)} gems por token. Considere mapas mais eficientes.`,
        impact: 'medium',
        icon: Target,
        action: 'Otimizar gems'
      });
    }

    // Análise de investimento vs retorno
    const roiPercentage = results?.finalProfit ? (results.finalProfit / formData.investment) * 100 : 0;
    if (roiPercentage > 50) {
      recommendations.push({
        id: 'excellent-roi',
        type: 'success',
        title: 'Excelente ROI!',
        description: `ROI de ${roiPercentage.toFixed(1)}% é muito bom! Esta estratégia está funcionando bem.`,
        impact: 'high',
        icon: CheckCircle,
        value: roiPercentage
      });
    }

    // Análise de nível vs eficiência
    if (formData.level < 10 && formData.luck > 0) {
      recommendations.push({
        id: 'level-luck-balance',
        type: 'tip',
        title: 'Balanceamento Nível/Luck',
        description: 'Para níveis baixos, considere focar mais em leveling do que em luck.',
        impact: 'medium',
        icon: Lightbulb,
        action: 'Reequilibrar stats'
      });
    }

    // Análise de preço do token
    if (formData.tokenPrice < 0.01) {
      recommendations.push({
        id: 'low-token-price',
        type: 'optimization',
        title: 'Preço do Token Baixo',
        description: 'Com preços baixos, foque em volume de tokens ao invés de eficiência.',
        impact: 'medium',
        icon: TrendingUp,
        action: 'Ajustar estratégia'
      });
    }

    // Análise de tempo de retorno
    const timeToROI = results?.finalProfit ? formData.investment / results.finalProfit : 0;
    if (timeToROI > 7) {
      recommendations.push({
        id: 'long-payback',
        type: 'warning',
        title: 'Tempo de Retorno Longo',
        description: `Estimativa de ${timeToROI.toFixed(1)} dias para recuperar investimento.`,
        impact: 'medium',
        icon: Clock,
        action: 'Otimizar estratégia'
      });
    }

    // Recomendação de diversificação
    if (formData.investment > 1000) {
      recommendations.push({
        id: 'diversification',
        type: 'tip',
        title: 'Considere Diversificar',
        description: 'Com investimentos altos, diversifique entre diferentes estratégias.',
        impact: 'low',
        icon: BarChart3,
        action: 'Ver estratégias'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'optimization': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'tip': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-700 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-500/5 to-blue-500/5 border border-green-500/20">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Estratégia Otimizada!
          </h3>
          <p className="text-green-600">
            Sua configuração atual está bem balanceada. Continue assim!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <span>Recomendações Inteligentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <div
              key={rec.id}
              className={`p-4 rounded-lg border ${getTypeColor(rec.type)} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getImpactColor(rec.impact)}`}
                    >
                      {rec.impact === 'high' ? 'Alto' : rec.impact === 'medium' ? 'Médio' : 'Baixo'} Impacto
                    </Badge>
                    {rec.value && (
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/20">
                        {rec.value.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm mb-3">{rec.description}</p>
                  {rec.action && onApplyRecommendation && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyRecommendation(rec)}
                      className="text-xs"
                    >
                      {rec.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}