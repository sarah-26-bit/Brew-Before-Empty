import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function DemandForecastChart({ data = [], height = 320 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-sage">
        Insufficient historical data to plot demand curve.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-midnight-surface/95 border border-forest-border rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-1">
          <p className="font-serif font-semibold text-ivory border-b border-forest-border/70 pb-1">
            {label}
          </p>
          {payload.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4 font-mono">
              <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-bold text-ivory">
                {item.value !== null && item.value !== undefined ? item.value : '—'} units
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="actualEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#237A57" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#237A57" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="predictedGoldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C5A46D" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#C5A46D" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="confidenceSageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A6B99B" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#A6B99B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#273F32" opacity={0.6} />
          <XAxis
            dataKey="date"
            stroke="#7D9571"
            tick={{ fill: '#A6B99B', fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            stroke="#7D9571"
            tick={{ fill: '#A6B99B', fontSize: 11 }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            formatter={(value) => <span className="text-ivory-muted">{value}</span>}
          />
          {/* Upper confidence bound */}
          <Area
            type="monotone"
            dataKey="confidenceUpper"
            name="Upper Planning Range (+15%)"
            stroke="transparent"
            fill="url(#confidenceSageGradient)"
          />
          {/* Actual demand (past) */}
          <Area
            type="monotone"
            dataKey="actualDemand"
            name="Actual Recorded Sales"
            stroke="#237A57"
            strokeWidth={3}
            fill="url(#actualEmeraldGradient)"
            dot={{ r: 3, fill: '#237A57' }}
            activeDot={{ r: 6, fill: '#237A57', stroke: '#F3F0E6', strokeWidth: 2 }}
          />
          {/* Predicted demand (future) */}
          <Area
            type="monotone"
            dataKey="predictedDemand"
            name="Prophecy AI Forecast"
            stroke="#C5A46D"
            strokeWidth={3}
            strokeDasharray="4 4"
            fill="url(#predictedGoldGradient)"
            dot={{ r: 3, fill: '#C5A46D' }}
            activeDot={{ r: 6, fill: '#C5A46D', stroke: '#F3F0E6', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
