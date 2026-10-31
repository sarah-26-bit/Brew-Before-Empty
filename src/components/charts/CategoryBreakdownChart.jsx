import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#8B5CF6', '#FF8A32', '#78D66B', '#FF5268', '#C4B8A5', '#A78BFA'];

export default function CategoryBreakdownChart({ data = [], height = 280 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-moonlight-muted">
        No category distribution data available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-midnight-surface/95 border border-midnight-border rounded-xl p-3 shadow-xl text-xs space-y-1">
          <p className="font-display font-semibold text-moonlight">{item.name}</p>
          <div className="flex items-center justify-between gap-4 font-mono text-moonlight">
            <span className="text-moonlight-muted">Total Valuation:</span>
            <span className="font-bold text-potion-light">{item.value} ⟡</span>
          </div>
          <div className="flex items-center justify-between gap-4 font-mono text-moonlight-muted">
            <span>Reagent Count:</span>
            <span>{item.payload.count} types</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartData = data.map((d) => ({
    name: d.category,
    value: d.totalValue,
    count: d.count,
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1F1731" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-moonlight-muted text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
