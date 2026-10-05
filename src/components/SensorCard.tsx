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
    <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-4 flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E5E2]">
          <div className="flex items-center gap-2">
            {icon && <div className="text-[#2A7C7A]">{icon}</div>}
            <h4 className="font-sans text-xs font-semibold tracking-wide text-[#1F4B60] uppercase">
              {name}
            </h4>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        <div className="mt-3 space-y-2">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-[#60868C] text-[11px] font-sans">{item.label}</span>
              <span
                className={`font-mono text-xs ${
                  item.highlight ? 'text-[#2A7C7A] font-semibold' : 'text-[#1F4B60] font-medium'
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {healthScore !== undefined && (
        <div className="mt-4 pt-3 border-t border-[#E7E5E2]">
          <div className="flex items-center justify-between text-[11px] font-sans text-[#60868C] mb-1.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider">INTEGRITY INDEX</span>
            <span className="text-[#3F8068] font-mono font-semibold">{healthScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#E7E5E2] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3F8068] rounded-full transition-all duration-300"
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
