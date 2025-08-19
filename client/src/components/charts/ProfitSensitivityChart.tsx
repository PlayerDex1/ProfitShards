import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import type { CalculationResults } from '@/types/calculator';

interface ProfitSensitivityChartProps {
  currentTokenPrice: number;
  results: CalculationResults;
  labelY?: string;
}

export function ProfitSensitivityChart({ currentTokenPrice, results, labelY = 'Lucro ($)' }: ProfitSensitivityChartProps) {
  const data = useMemo(() => {
    const points: { price: number; profit: number; label: string }[] = [];
    const totalTokens = results.totalTokens;

    for (let i = 0; i <= 10; i++) {
      const factor = 0.5 + (i * 0.1);
      const price = Number((currentTokenPrice * factor).toFixed(4));
      const delta = price - currentTokenPrice;
      const profit = results.finalProfit + delta * totalTokens;
      points.push({ price, profit, label: `${Math.round(factor * 100)}%` });
    }
    return points;
  }, [currentTokenPrice, results]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="price" stroke="#ffffff" tickFormatter={(v) => `$${Number(v).toFixed(2)}`} />
        <YAxis stroke="#ffffff" tickFormatter={(v) => `$${Number(v).toFixed(0)}`} />
        <Tooltip 
          formatter={(value: number, name: string) => [ `$${Number(value).toFixed(2)}`, name === 'profit' ? 'Lucro' : 'Preço' ]} 
          labelFormatter={(label) => `Preço do Token: $${Number(label).toFixed(4)}`}
          contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
        />
        <ReferenceLine x={currentTokenPrice} stroke="#22d3ee" strokeDasharray="4 2" />
        <Line type="monotone" dataKey="profit" stroke="#ffffff" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

