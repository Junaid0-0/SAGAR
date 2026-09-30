import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'cyan' | 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  pulse = false
}) => {
  // Auto-detect variant from status text if not explicitly provided
  let determinedVariant = variant;
  const upper = status.toUpperCase();

  if (!determinedVariant) {
    if (upper.includes('CRITICAL') || upper.includes('EXCEEDED') || upper.includes('PRIORITY') || upper.includes('FAIL')) {
      determinedVariant = 'red';
    } else if (upper.includes('HIGH') || upper.includes('ELEVATED') || upper.includes('WARNING') || upper.includes('MODERATE')) {
      determinedVariant = 'amber';
    } else if (upper.includes('ONLINE') || upper.includes('ACTIVE') || upper.includes('HEALTHY') || upper.includes('NORMAL') || upper.includes('LINKED') || upper.includes('VALID')) {
      determinedVariant = 'green';
    } else if (upper.includes('SIMULATION') || upper.includes('REVIEW')) {
      determinedVariant = 'cyan';
    } else {
      determinedVariant = 'blue';
    }
  }

  const styles = {
    green: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50',
    amber: 'bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-amber-950/50',
    red: 'bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-rose-950/50',
    cyan: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-cyan-950/50',
    blue: 'bg-blue-950/70 text-blue-300 border-blue-500/40 shadow-blue-950/50',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-500/40 shadow-purple-950/50',
    slate: 'bg-slate-900 text-slate-300 border-slate-700 shadow-slate-950/50',
  }[determinedVariant || 'blue'];

  const dotColors = {
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-rose-400',
    cyan: 'bg-cyan-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    slate: 'bg-slate-400',
  }[determinedVariant || 'blue'];

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-medium tracking-wide',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border uppercase font-mono font-semibold transition-all shadow-sm ${styles} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors}`} />
      </span>
      {status}
    </span>
  );
};
