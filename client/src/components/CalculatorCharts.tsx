import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CalculatorChartsProps {
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function CalculatorCharts({ calculations, currentData }: CalculatorChartsProps) {
  const chartData = useMemo(() => {
    return calculations.map((calc, index) => ({
      name: `Run ${index + 1}`,
      gems: calc.gemsSpent,
      tokens: calc.tokensEarned,
      profit: calc.profit,
      roi: calc.roi,
    }));
  }, [calculations]);

  const roiData = useMemo(() => {
    const ranges = [
      { name: 'Excelente (50%+)', value: 0, color: '#10b981' },
      { name: 'Bom (20-50%)', value: 0, color: '#3b82f6' },
      { name: 'Regular (0-20%)', value: 0, color: '#f59e0b' },
      { name: 'Ruim (-20-0%)', value: 0, color: '#ef4444' },
    ];

    calculations.forEach(calc => {
      if (calc.roi >= 50) ranges[0].value++;
      else if (calc.roi >= 20) ranges[1].value++;
      else if (calc.roi >= 0) ranges[2].value++;
      else ranges[3].value++;
    });

    return ranges.filter(range => range.value > 0);
  }, [calculations]);

  const profitTrend = useMemo(() => {
    if (calculations.length < 2) return null;
    
    const recent = calculations.slice(-5);
    const trend = recent.reduce((acc, curr, index) => {
      if (index > 0) {
        acc += curr.profit - recent[index - 1].profit;
      }
      return acc;
    }, 0);
    
    return trend / (recent.length - 1);
  }, [calculations]);

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{currentData.roi.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">ROI Atual</div>
        </div>
        <div className="card-premium p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{currentData.profit.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Lucro</div>
        </div>
        <div className="card-premium p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{calculations.length}</div>
          <div className="text-sm text-muted-foreground">Cálculos</div>
        </div>
        <div className="card-premium p-4 text-center">
          <div className={`text-2xl font-bold ${profitTrend && profitTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitTrend ? (profitTrend > 0 ? '↗️' : '↘️') : '➡️'}
          </div>
          <div className="text-sm text-muted-foreground">Tendência</div>
        </div>
      </div>

      {/* Gráfico de linha - Evolução do ROI */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Evolução do ROI</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value}${name === 'roi' ? '%' : ''}`, 
                name === 'roi' ? 'ROI' : name === 'profit' ? 'Lucro' : name === 'gems' ? 'Gemas' : 'Tokens'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="roi" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de barras - Comparação de Lucros */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold mb-4">💰 Comparação de Lucros</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'Lucro']} />
            <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de pizza - Distribuição de ROI */}
      {roiData.length > 0 && (
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold mb-4">🎯 Distribuição de ROI</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roiData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights e recomendações */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold mb-4">💡 Insights</h3>
        <div className="space-y-3">
          {profitTrend && profitTrend > 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <span>✅</span>
              <span>Seu ROI está melhorando! Continue com essa estratégia.</span>
            </div>
          )}
          {profitTrend && profitTrend < 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <span>⚠️</span>
              <span>Seu ROI está diminuindo. Considere ajustar sua estratégia.</span>
            </div>
          )}
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