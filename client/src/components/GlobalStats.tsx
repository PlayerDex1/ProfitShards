import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Calculator, TrendingUp, DollarSign, 
  Map, Target, Zap, Star, Activity, BarChart3 
} from 'lucide-react';

interface GlobalStatsData {
  totalUsers: number;
  calculationsToday: number;
  totalProfit: number;
  activeUsers: number;
  popularMaps: string[];
  avgROI: number;
  totalRuns: number;
  communityScore: number;
}

export function GlobalStats() {
  const [stats, setStats] = useState<GlobalStatsData>({
    totalUsers: 0,
    calculationsToday: 0,
    totalProfit: 0,
    activeUsers: 0,
    popularMaps: [],
    avgROI: 0,
    totalRuns: 0,
    communityScore: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento de dados
  useEffect(() => {
    const loadStats = async () => {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 1247,
        calculationsToday: 89,
        totalProfit: 156420,
        activeUsers: 23,
        popularMaps: ['Forest', 'Mountain', 'Desert'],
        avgROI: 42.3,
        totalRuns: 15420,
        communityScore: 94
      });
      
      setIsLoading(false);
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            📊 Estatísticas Globais
          </h2>
          <p className="text-xl text-muted-foreground">
            Carregando dados da comunidade...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-6 border-2 border-blue-500/30">
          <BarChart3 className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-4xl font-bold text-foreground mb-4">
          📊 <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Estatísticas Globais
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Acompanhe o crescimento e atividade da comunidade ProfitShards em tempo real
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total de Usuários */}
        <Card className="hover:shadow-lg transition-all duration-200 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Usuários</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              +12 esta semana
            </Badge>
          </CardContent>
        </Card>

        {/* Cálculos Hoje */}
        <Card className="hover:shadow-lg transition-all duration-200 border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Cálculos Hoje</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {stats.calculationsToday}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
            <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              +{Math.floor(stats.calculationsToday * 0.15)} vs ontem
            </Badge>
          </CardContent>
        </Card>

        {/* Lucro Total */}
        <Card className="hover:shadow-lg transition-all duration-200 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Lucro Total</p>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                  ${stats.totalProfit.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <Badge className="mt-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
              +8.2% este mês
            </Badge>
          </CardContent>
        </Card>

        {/* Usuários Ativos */}
        <Card className="hover:shadow-lg transition-all duration-200 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Usuários Ativos</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {stats.activeUsers}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <Badge className="mt-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              Online agora
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ROI Médio */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROI Médio</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.avgROI}%
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total de Runs */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Runs</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalRuns.toLocaleString()}
                </p>
              </div>
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Score da Comunidade */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Comunidade</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.communityScore}/100
                </p>
              </div>
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {/* Mapas Populares */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mapas Populares</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {stats.popularMaps.map((map, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {map}
                    </Badge>
                  ))}
                </div>
              </div>
              <Map className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Message */}
      <div className="mt-12 text-center">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                Comunidade em Crescimento!
              </h3>
            </div>
            <p className="text-lg text-blue-600 dark:text-blue-400 mb-4">
              Junte-se a mais de {stats.totalUsers.toLocaleString()} jogadores que já descobriram o poder da calculadora ProfitShards
            </p>
            <div className="flex justify-center space-x-4">
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-4 py-2">
                ✅ {stats.calculationsToday} cálculos hoje
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-4 py-2">
                💰 ${stats.totalProfit.toLocaleString()} em lucros
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-4 py-2">
                🎯 {stats.avgROI}% ROI médio
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}