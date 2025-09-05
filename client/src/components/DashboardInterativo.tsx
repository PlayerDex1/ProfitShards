import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Target } from 'lucide-react';

interface DashboardInterativoProps {
  formData: any;
  results: any;
}

export function DashboardInterativo({ formData, results }: DashboardInterativoProps) {
  console.log('🔍 DashboardInterativo - formData:', formData);
  console.log('🔍 DashboardInterativo - results:', results);
  
  return (
    <div className="space-y-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          📊 Dashboard Interativo
        </h3>
        <p className="text-blue-500 dark:text-blue-300 text-lg">
          Análise visual dos seus resultados
        </p>
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-700">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            ✅ COMPONENTE FUNCIONANDO! Dados recebidos: {formData ? 'SIM' : 'NÃO'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${formData?.investment?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Gems Compradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formData?.gemsPurchased?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {results?.roi ? `${results.roi.toFixed(1)}%` : '0%'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${results?.profit ? results.profit.toLocaleString() : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Estratégia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Investimento:</strong> ${formData?.investment || 0}</p>
            <p><strong>Gems:</strong> {formData?.gemsPurchased || 0}</p>
            <p><strong>ROI:</strong> {results?.roi ? `${results.roi.toFixed(1)}%` : '0%'}</p>
            <p><strong>Lucro:</strong> ${results?.profit || 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}