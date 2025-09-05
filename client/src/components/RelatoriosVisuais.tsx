import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

interface RelatoriosVisuaisProps {
  history: any[];
}

export function RelatoriosVisuais({ history }: RelatoriosVisuaisProps) {
  const totalCalculations = history?.length || 0;
  const avgROI = history?.length > 0 
    ? history.reduce((sum, item) => sum + (item.results?.roi || 0), 0) / history.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          📈 Relatórios Visuais
        </h3>
        <p className="text-muted-foreground">
          Análise detalhada do seu histórico
        </p>
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
              {history?.length > 0 
                ? new Date(history[0].timestamp).toLocaleDateString()
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
          {history?.length > 0 ? (
            <div className="space-y-2">
              {history.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span>Investimento: ${item.formData?.investment || 0}</span>
                  <span className="text-green-600 font-medium">
                    ROI: {item.results?.roi ? `${item.results.roi.toFixed(1)}%` : '0%'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhum histórico disponível
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}