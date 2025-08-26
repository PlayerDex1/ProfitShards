import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Database, Activity, Users, TrendingUp, AlertCircle, CheckCircle, 
  Trash2, RefreshCw, BarChart3, Table, Clock, Zap
} from 'lucide-react';

interface DataAnalysis {
  homePageDataSources: {
    activityStream: {
      table: string;
      currentCount: number;
      sampleData: any[];
      description: string;
    };
    communityStats: {
      tables: string[];
      metrics: {
        totalRuns: number;
        totalProfit: number;
        activeUsers: number;
        successRate: number;
      };
      description: string;
    };
  };
  databaseTables: {
    tableName: string;
    totalRecords: number;
    recentRecords: number;
    sampleData: any[];
    description: string;
  }[];
  cacheStatus: {
    kvKeys: string[];
    description: string;
  };
  recommendations: string[];
}

export function DataAnalysis() {
  const [analysis, setAnalysis] = useState<DataAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/data-analysis', {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Erro ao carregar análise');
      }
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('pt-BR');
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mr-3" />
            <span>Analisando dados da home page...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Erro: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📊 Análise de Dados da Home Page</h2>
          <p className="text-muted-foreground">
            Antes de resetar, veja exatamente quais dados serão afetados
          </p>
        </div>
        <Button onClick={loadAnalysis} disabled={loading} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Activity Stream Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-orange-600" />
            <span>🔥 Feed da Comunidade (Activity Stream)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(analysis.homePageDataSources.activityStream.currentCount)}
              </div>
              <div className="text-sm text-muted-foreground">Total de runs no feed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-foreground">
                {analysis.homePageDataSources.activityStream.table}
              </div>
              <div className="text-sm text-muted-foreground">Tabela fonte</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-foreground">
                {analysis.homePageDataSources.activityStream.sampleData.length}
              </div>
              <div className="text-sm text-muted-foreground">Samples recentes</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {analysis.homePageDataSources.activityStream.description}
          </p>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>📈 Estatísticas da Comunidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {formatNumber(analysis.homePageDataSources.communityStats.metrics.totalRuns)}
              </div>
              <div className="text-sm text-muted-foreground">Total Runs</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(analysis.homePageDataSources.communityStats.metrics.totalProfit)}
              </div>
              <div className="text-sm text-muted-foreground">Lucro Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {formatNumber(analysis.homePageDataSources.communityStats.metrics.activeUsers)}
              </div>
              <div className="text-sm text-muted-foreground">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {(analysis.homePageDataSources.communityStats.metrics.successRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa Sucesso</div>
            </div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              {analysis.homePageDataSources.communityStats.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.homePageDataSources.communityStats.tables.map((table) => (
                <Badge key={table} variant="outline">{table}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-slate-600" />
            <span>🗄️ Estado das Tabelas do Banco</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {analysis.databaseTables.map((table) => (
              <div key={table.tableName} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{table.tableName}</div>
                  <div className="text-sm text-muted-foreground">{table.description}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={table.totalRecords > 0 ? "default" : "secondary"}>
                      {formatNumber(table.totalRecords)} total
                    </Badge>
                    <Badge variant={table.recentRecords > 0 ? "default" : "outline"}>
                      <Clock className="h-3 w-3 mr-1" />
                      {formatNumber(table.recentRecords)} 24h
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cache Status */}
      {analysis.cacheStatus.kvKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>⚡ Cache Ativo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {analysis.cacheStatus.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.cacheStatus.kvKeys.map((key) => (
                <Badge key={key} variant="outline" className="bg-yellow-50 dark:bg-yellow-950">
                  {key}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span>💡 Recomendações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-muted/50 rounded">
                <div className="text-sm">{rec}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Warning */}
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>⚠️ Antes de Resetar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-red-600 font-medium">
              O reset irá afetar principalmente:
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-600">
              <li>Feed da Comunidade: {formatNumber(analysis.homePageDataSources.activityStream.currentCount)} runs serão removidas</li>
              <li>Estatísticas: Zeros nas métricas da comunidade</li>
              <li>Cache: {analysis.cacheStatus.kvKeys.length} chaves serão limpas</li>
              <li>Usuários: Histórico de atividade será perdido</li>
            </ul>
            <p className="text-red-600 text-xs mt-3">
              💡 Considere fazer backup dos dados importantes antes de prosseguir
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}