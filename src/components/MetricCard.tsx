import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  status?: string;
  statusVariant?: 'green' | 'amber' | 'red' | 'cyan' | 'blue';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  highlight?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  status,
  statusVariant = 'cyan',
  icon,
  highlight = false,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-md border p-3.5 transition-all duration-200 ${
        highlight
          ? 'bg-gradient-to-br from-cyan-950/40 via-ocean-850 to-ocean-900 border-cyan-500/50 shadow-lg shadow-cyan-950/40'
          : 'bg-ocean-850/90 border-slate-800/80 hover:border-slate-700/90'
      } ${className}`}
    >
      {/* Subtle top indicator bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          highlight
            ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-transparent'
            : 'bg-gradient-to-r from-slate-700 to-transparent'
        }`}
      />

      <div className="flex items-start justify-between">
        <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
          {label}
        </span>
        {icon && <div className="text-slate-400 text-sm opacity-80">{icon}</div>}
      </div>

      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-mono font-bold tracking-tight text-slate-100">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-slate-400">{unit}</span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px]">
        {subtext && <span className="text-slate-400 font-mono truncate">{subtext}</span>}
        {status && (
          <span
            className={`ml-auto font-mono text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${
              statusVariant === 'green'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40'
                : statusVariant === 'amber'
                ? 'text-amber-400 border-amber-500/30 bg-amber-950/40'
                : statusVariant === 'red'
                ? 'text-rose-400 border-rose-500/30 bg-rose-950/40'
                : 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40'
            }`}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
};
