import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#237A57', '#C5A46D', '#A6B99B', '#E9A23B', '#36A87A', '#DFCA9F'];

export default function CategoryBreakdownChart({ data = [], height = 280 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-sage">
        No category distribution data available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-midnight-surface/95 border border-forest-border rounded-xl p-3 shadow-xl text-xs space-y-1">
          <p className="font-serif font-semibold text-ivory">{item.name}</p>
          <div className="flex items-center justify-between gap-4 font-mono text-ivory">
            <span className="text-sage">Total Value:</span>
            <span className="font-bold text-gold">{item.value} ⟡</span>
          </div>
          <div className="flex items-center justify-between gap-4 font-mono text-ivory-muted">
            <span>Ingredients:</span>
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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1B2C23" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sage text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
