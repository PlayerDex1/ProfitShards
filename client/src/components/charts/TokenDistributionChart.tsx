import React from 'react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';

type TokenSlice = { name: string; value: number; color: string };

interface TokenDistributionChartProps {
	data: TokenSlice[];
	totalTokens: number;
	totalLabel: string;
}

export function TokenDistributionChart({ data, totalTokens, totalLabel }: TokenDistributionChartProps) {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<RechartsPieChart>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					innerRadius={45}
					outerRadius={70}
					dataKey="value"
					labelLine={false}
					label={({ name, percent }) => (percent && percent >= 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : '')}
				>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.color} stroke="#0a0a0a" strokeWidth={2} />
					))}
				</Pie>
				<Tooltip 
					formatter={(value: number, name: string, props: any) => [
						`${Number(value).toLocaleString()} (${(((props?.payload?.percent) ?? 0) * 100).toFixed(1)}%)`,
						name
					]}
					contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
				/>
				<text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="14" fontWeight="bold">
					{totalTokens.toLocaleString()}
				</text>
				<text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.7)" fontSize="10">
					{totalLabel}
				</text>
			</RechartsPieChart>
		</ResponsiveContainer>
	);
}

