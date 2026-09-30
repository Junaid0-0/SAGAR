import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { SignalHistoryPoint } from '../types';

interface TelemetryChartProps {
  data: SignalHistoryPoint[];
  dataKey?: 'response' | 'depth' | 'temperature' | 'pressure' | 'battery';
  title?: string;
  unit?: string;
  height?: number;
  showThreshold?: boolean;
  thresholdValue?: number;
  baselineValue?: number;
  color?: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  dataKey = 'response',
  title = 'REAL-TIME SIGNAL RESPONSE',
  unit = 'mV/V',
  height = 140,
  showThreshold = true,
  thresholdValue = 0.65,
  baselineValue = 0.31,
  color = '#00F2FE',
}) => {
  return (
    <div className="w-full bg-ocean-850/80 rounded-md border border-slate-800/90 p-3 select-none flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-300 uppercase">
          {title}
        </span>
        <span className="text-[10px] font-mono text-cyan-400">
          UNIT: {unit}
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fontSize: 9, fontFamily: 'monospace' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 9, fontFamily: 'monospace' }}
              domain={dataKey === 'response' ? [0.2, 0.9] : ['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#081324',
                borderColor: '#0284c7',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#e2e8f0',
              }}
            />
            {showThreshold && dataKey === 'response' && (
              <>
                <ReferenceLine
                  y={thresholdValue}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{ value: `THRESHOLD ${thresholdValue}`, fill: '#f87171', fontSize: 9, position: 'right' }}
                />
                <ReferenceLine
                  y={baselineValue}
                  stroke="#0284c7"
                  strokeDasharray="2 2"
                  label={{ value: `BASELINE ${baselineValue}`, fill: '#38bdf8', fontSize: 9, position: 'right' }}
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${dataKey})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
