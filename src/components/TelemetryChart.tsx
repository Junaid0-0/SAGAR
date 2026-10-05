import React from 'react';
import {
  AreaChart,
  Area,
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
  dataKey?: 'response' | 'depth' | 'temperature' | 'pressure';
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
  color = '#2A7C7A',
}) => {
  return (
    <div className="w-full bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-3.5 select-none flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-sans font-semibold tracking-wider text-[#1F4B60] uppercase">
          {title}
        </span>
        <span className="text-[10px] font-mono text-[#60868C]">
          UNIT: {unit}
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid stroke="#E7E5E2" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#60868C"
              tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#60868C' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#60868C"
              tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#60868C' }}
              domain={dataKey === 'response' ? [0.2, 0.9] : ['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#BDCED3',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#1F4B60',
                boxShadow: '0 2px 6px rgba(31, 75, 96, 0.08)',
              }}
            />
            {showThreshold && dataKey === 'response' && (
              <>
                <ReferenceLine
                  y={thresholdValue}
                  stroke="#B85C5C"
                  strokeDasharray="3 3"
                  label={{ value: `THRESHOLD ${thresholdValue}`, fill: '#B85C5C', fontSize: 9, position: 'right' }}
                />
                <ReferenceLine
                  y={baselineValue}
                  stroke="#BDCED3"
                  strokeDasharray="2 2"
                  label={{ value: `BASELINE ${baselineValue}`, fill: '#60868C', fontSize: 9, position: 'right' }}
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.75}
              fillOpacity={0.08}
              fill={color}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
