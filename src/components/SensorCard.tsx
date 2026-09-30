import React from 'react';
import { StatusBadge } from './StatusBadge';

interface SensorCardProps {
  name: string;
  status: 'ONLINE' | 'STANDBY' | 'HEALTHY' | 'LINKED' | 'CALIBRATING';
  icon?: React.ReactNode;
  specs: { label: string; value: string | number; highlight?: boolean }[];
  healthScore?: number;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  name,
  status,
  icon,
  specs,
  healthScore,
}) => {
  return (
    <div className="bg-ocean-850/80 rounded-md border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-cyan-400">{icon}</div>}
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-100">
              {name}
            </h4>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        <div className="mt-3.5 space-y-2">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs font-mono"
            >
              <span className="text-slate-400 text-[11px]">{item.label}</span>
              <span
                className={`font-semibold ${
                  item.highlight ? 'text-cyan-300' : 'text-slate-200'
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {healthScore !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-800/70">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>INTEGRITY INDEX</span>
            <span className="text-emerald-400 font-bold">{healthScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
