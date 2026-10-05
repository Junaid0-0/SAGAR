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
      className={`relative rounded-[8px] border bg-[#FFFFFF] p-3.5 transition-colors ${
        highlight
          ? 'border-[#2A7C7A] ring-1 ring-[#2A7C7A]/20'
          : 'border-[#CBD9DA]'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-sans font-semibold tracking-wide text-[#60868C] uppercase">
          {label}
        </span>
        {icon && <div className="text-[#60868C] flex-shrink-0">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-xl sm:text-2xl font-mono font-semibold tracking-tight text-[#1F4B60]">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-normal text-[#60868C]">{unit}</span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] min-h-[18px]">
        {subtext && (
          <span className="text-[#60868C] font-sans truncate mr-1">{subtext}</span>
        )}
        {status && (
          <span
            className={`ml-auto font-mono text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-[4px] border ${
              statusVariant === 'green'
                ? 'text-[#3F8068] border-[#CBD9DA] bg-[#E5F2EC]'
                : statusVariant === 'amber'
                ? 'text-[#B78332] border-[#CBD9DA] bg-[#F8EFE3]'
                : statusVariant === 'red'
                ? 'text-[#B85C5C] border-[#CBD9DA] bg-[#F9E8E8]'
                : 'text-[#2A7C7A] border-[#CBD9DA] bg-[#E2EFF0]'
            }`}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
};
