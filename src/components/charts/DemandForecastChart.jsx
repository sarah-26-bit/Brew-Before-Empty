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
      <div className="h-64 flex items-center justify-center text-xs text-moonlight-muted">
        Insufficient astral readings to plot curve.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-midnight-surface/95 border border-midnight-border rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-1">
          <p className="font-display font-semibold text-moonlight border-b border-midnight-border/50 pb-1">
            {label}
          </p>
          {payload.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4 font-mono">
              <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-bold text-moonlight">
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
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF8A32" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#FF8A32" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#78D66B" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#78D66B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2E2246" opacity={0.6} />
          <XAxis
            dataKey="date"
            stroke="#938774"
            tick={{ fill: '#C4B8A5', fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            stroke="#938774"
            tick={{ fill: '#C4B8A5', fontSize: 11 }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            formatter={(value) => <span className="text-moonlight-muted">{value}</span>}
          />
          {/* Upper confidence bound */}
          <Area
            type="monotone"
            dataKey="confidenceUpper"
            name="Upper Horizon (+15%)"
            stroke="transparent"
            fill="url(#confidenceGradient)"
          />
          {/* Actual demand (past) */}
          <Area
            type="monotone"
            dataKey="actualDemand"
            name="Recorded Demand"
            stroke="#8B5CF6"
            strokeWidth={3}
            fill="url(#actualGradient)"
            dot={{ r: 3, fill: '#8B5CF6' }}
            activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#F3EBDD', strokeWidth: 2 }}
          />
          {/* Predicted demand (future) */}
          <Area
            type="monotone"
            dataKey="predictedDemand"
            name="Prophecy Forecast"
            stroke="#FF8A32"
            strokeWidth={3}
            strokeDasharray="4 4"
            fill="url(#predictedGradient)"
            dot={{ r: 3, fill: '#FF8A32' }}
            activeDot={{ r: 6, fill: '#FF8A32', stroke: '#F3EBDD', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

