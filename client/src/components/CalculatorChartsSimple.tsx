import React from 'react';

interface CalculatorChartsSimpleProps {
  calculations: Array<{
    timestamp: number;
    gemsSpent: number;
    tokensEarned: number;
    profit: number;
    roi: number;
  }>;
  currentData: {
    gemsSpent: number;
    tokensEarned: number;
    profit: number;
    roi: number;
  };
}

export function CalculatorChartsSimple({ calculations, currentData }: CalculatorChartsSimpleProps) {
  // Verificações de segurança
  if (!calculations || !Array.isArray(calculations)) {
    return (
      <div className="card-premium p-6 text-center">
        <p className="text-muted-foreground">Nenhum dado disponível para gráficos</p>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="card-premium p-6 text-center">
        <p className="text-muted-foreground">Dados atuais não disponíveis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{(currentData.roi || 0).toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">ROI Atual</div>
        </div>
        <div className="card-premium p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{(currentData.profit || 0).toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Lucro</div>
        </div>
        <div className="card-premium p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{calculations.length}</div>
          <div className="text-sm text-muted-foreground">Cálculos</div>
        </div>
        <div className="card-premium p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">📊</div>
          <div className="text-sm text-muted-foreground">Gráficos</div>
        </div>
      </div>

      {/* Lista de cálculos */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Histórico de Cálculos</h3>
        {calculations.length === 0 ? (
          <p className="text-muted-foreground text-center">Nenhum cálculo salvo ainda</p>
        ) : (
          <div className="space-y-2">
            {calculations.slice(-10).map((calc, index) => (
              <div key={calc.timestamp} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <span className="font-medium">Cálculo {calculations.length - index}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {new Date(calc.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{calc.roi.toFixed(1)}% ROI</div>
                  <div className="text-sm text-muted-foreground">{calc.profit.toFixed(2)} tokens</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold mb-4">💡 Insights</h3>
        <div className="space-y-2">
          {currentData.roi > 50 && (
            <div className="flex items-center gap-2 text-green-600">
              <span>🚀</span>
              <span>Excelente ROI! Você está no topo dos players.</span>
            </div>
          )}
          {currentData.roi < 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <span>🛑</span>
              <span>ROI negativo. Revise seus custos e estratégia.</span>
            </div>
          )}
          {calculations.length >= 10 && (
            <div className="flex items-center gap-2 text-blue-600">
              <span>📊</span>
              <span>Você tem dados suficientes para análises avançadas!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}