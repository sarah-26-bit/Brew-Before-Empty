import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';

export default function StockLevelBarChart({ data = [], height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-moonlight-muted">
        No stock levels available.
      </div>
    );
  }

  // Format data for chart
  const chartData = data.slice(0, 8).map((ing) => ({
    name: ing.name.length > 14 ? `${ing.name.substring(0, 12)}...` : ing.name,
    fullName: ing.name,
    stock: ing.currentStock,
    minThreshold: ing.minThreshold,
    unit: ing.unit,
    isLow: ing.currentStock <= ing.minThreshold,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-midnight-surface/95 border border-midnight-border rounded-xl p-3 shadow-xl text-xs space-y-1">
          <p className="font-display font-semibold text-moonlight border-b border-midnight-border/50 pb-1">
            {d.fullName}
          </p>
          <div className="flex items-center justify-between gap-4 font-mono text-moonlight">
            <span>Current Stock:</span>
            <span className={`font-bold ${d.isLow ? 'text-curse' : 'text-enchanted'}`}>
              {d.stock} {d.unit}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 font-mono text-moonlight-muted">
            <span>Safety Threshold:</span>
            <span>{d.minThreshold} {d.unit}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2E2246" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="#938774"
            tick={{ fill: '#C4B8A5', fontSize: 10 }}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis
            stroke="#938774"
            tick={{ fill: '#C4B8A5', fontSize: 11 }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '5px', fontSize: '12px' }}
            formatter={(val) => <span className="text-moonlight-muted">{val}</span>}
          />
          <Bar dataKey="stock" name="Current Stock" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isLow ? '#FF5268' : '#8B5CF6'}
              />
            ))}
          </Bar>
          <Bar dataKey="minThreshold" name="Min Threshold" fill="#FF8A32" opacity={0.6} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

