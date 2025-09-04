import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target,
  BarChart3
} from "lucide-react";

interface StrategyScore {
  overall: number;
  profitability: number;
  efficiency: number;
  risk: number;
  sustainability: number;
}

interface StrategyScorerProps {
  formData: any;
  results: any;
}

export function StrategyScorer({ formData, results }: StrategyScorerProps) {
  
  const calculateScores = (): StrategyScore => {
    // Score de Rentabilidade (0-100)
    const roiPercentage = results?.finalProfit ? (results.finalProfit / formData.investment) * 100 : 0;
    const profitability = Math.min(Math.max(roiPercentage * 2, 0), 100);

    // Score de Eficiência (0-100)
    const gemsPerToken = formData.gemsConsumed / (results?.tokensEarned || 1);
    const efficiency = Math.max(0, 100 - (gemsPerToken * 2));

    // Score de Risco (0-100, onde 100 = baixo risco)
    const investmentRisk = formData.investment > 1000 ? 60 : 80;
    const levelRisk = formData.level < 5 ? 40 : 80;
    const risk = (investmentRisk + levelRisk) / 2;

    // Score de Sustentabilidade (0-100)
    const timeToROI = results?.finalProfit ? formData.investment / results.finalProfit : 0;
    const sustainability = Math.max(0, 100 - (timeToROI * 10));

    // Score Geral (média ponderada)
    const overall = (profitability * 0.4 + efficiency * 0.3 + risk * 0.2 + sustainability * 0.1);

    return {
      overall: Math.round(overall),
      profitability: Math.round(profitability),
      efficiency: Math.round(efficiency),
      risk: Math.round(risk),
      sustainability: Math.round(sustainability)
    };
  };

  const scores = calculateScores();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Ruim';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 text-green-700 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    if (score >= 40) return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    return 'bg-red-500/10 text-red-700 border-red-500/20';
  };

  const getOverallStars = (score: number) => {
    const stars = Math.floor(score / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Análise da Estratégia</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {getOverallStars(scores.overall)}
            </div>
            <Badge className={getScoreBadgeColor(scores.overall)}>
              {getScoreLabel(scores.overall)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Geral */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(scores.overall)} mb-2`}>
            {scores.overall}/100
          </div>
          <Progress value={scores.overall} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            Score Geral da Estratégia
          </p>
        </div>

        {/* Scores Detalhados */}
        <div className="grid grid-cols-2 gap-4">
          {/* Rentabilidade */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Rentabilidade</span>
              </div>
              <span className={`text-sm font-bold ${getScoreColor(scores.profitability)}`}>
                {scores.profitability}
              </span>
            </div>
            <Progress value={scores.profitability} className="h-2" />
          </div>

          {/* Eficiência */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Eficiência</span>
              </div>
              <span className={`text-sm font-bold ${getScoreColor(scores.efficiency)}`}>
                {scores.efficiency}
              </span>
            </div>
            <Progress value={scores.efficiency} className="h-2" />
          </div>

          {/* Risco */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Segurança</span>
              </div>
              <span className={`text-sm font-bold ${getScoreColor(scores.risk)}`}>
                {scores.risk}
              </span>
            </div>
            <Progress value={scores.risk} className="h-2" />
          </div>

          {/* Sustentabilidade */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Sustentabilidade</span>
              </div>
              <span className={`text-sm font-bold ${getScoreColor(scores.sustainability)}`}>
                {scores.sustainability}
              </span>
            </div>
            <Progress value={scores.sustainability} className="h-2" />
          </div>
        </div>

        {/* Insights */}
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold mb-3">Insights da Análise:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {scores.profitability >= 80 && (
              <p>✅ <strong>Excelente rentabilidade!</strong> Esta estratégia tem grande potencial de lucro.</p>
            )}
            {scores.efficiency >= 80 && (
              <p>⚡ <strong>Muito eficiente!</strong> Você está otimizando bem o uso de gems.</p>
            )}
            {scores.risk >= 80 && (
              <p>🛡️ <strong>Baixo risco!</strong> Esta é uma estratégia segura para investir.</p>
            )}
            {scores.overall < 40 && (
              <p>⚠️ <strong>Atenção:</strong> Considere ajustar os parâmetros para melhorar a estratégia.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}