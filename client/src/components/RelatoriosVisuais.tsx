import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

interface RelatoriosVisuaisProps {
  history: any[];
}

export function RelatoriosVisuais({ history }: RelatoriosVisuaisProps) {
  console.log('🔍 RelatoriosVisuais - history:', history);
  
  // Dados de teste se não houver histórico
  const testHistory = history?.length > 0 ? history : [
    {
      formData: { investment: 500, gemsPurchased: 25000 },
      results: { roi: 45.2, profit: 226 },
      timestamp: new Date().toISOString()
    },
    {
      formData: { investment: 750, gemsPurchased: 35000 },
      results: { roi: 38.7, profit: 290.25 },
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      formData: { investment: 1000, gemsPurchased: 50000 },
      results: { roi: 52.1, profit: 521 },
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  
  const totalCalculations = testHistory?.length || 0;
  const avgROI = testHistory?.length > 0 
    ? testHistory.reduce((sum, item) => sum + (item.results?.roi || 0), 0) / testHistory.length 
    : 0;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
          📈 Relatórios Visuais
        </h3>
        <p className="text-green-500 dark:text-green-300 text-lg">
          Análise detalhada do seu histórico
        </p>
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-700">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            ✅ COMPONENTE FUNCIONANDO! Dados: {history?.length > 0 ? 'REAIS' : 'TESTE'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total de Cálculos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCalculations}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              ROI Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {avgROI.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Última Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {testHistory?.length > 0 
                ? new Date(testHistory[0].timestamp).toLocaleDateString()
                : 'Nenhuma'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Histórico Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testHistory?.length > 0 ? (
            <div className="space-y-2">
              {testHistory.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span>Investimento: ${item.formData?.investment || 0}</span>
                  <span className="text-green-600 font-medium">
                    ROI: {item.results?.roi ? `${item.results.roi.toFixed(1)}%` : '0%'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center py-4">
                Nenhum histórico disponível ainda
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  💡 Dica: Como gerar relatórios
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Faça alguns cálculos na calculadora</li>
                  <li>• Salve os resultados no histórico</li>
                  <li>• Volte aqui para ver suas análises</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}