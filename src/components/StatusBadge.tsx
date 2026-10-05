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
    if (upper.includes('CRITICAL') || upper.includes('EXCEEDED') || upper.includes('PRIORITY') || upper.includes('FAIL') || upper.includes('ERROR')) {
      determinedVariant = 'red';
    } else if (upper.includes('HIGH') || upper.includes('ELEVATED') || upper.includes('WARNING') || upper.includes('MODERATE') || upper.includes('REQUIRES')) {
      determinedVariant = 'amber';
    } else if (upper.includes('ONLINE') || upper.includes('ACTIVE') || upper.includes('HEALTHY') || upper.includes('NORMAL') || upper.includes('LINKED') || upper.includes('VALID')) {
      determinedVariant = 'green';
    } else if (upper.includes('SIMULATION') || upper.includes('REVIEW') || upper.includes('STANDBY')) {
      determinedVariant = 'cyan';
    } else {
      determinedVariant = 'slate';
    }
  }

  // Marine scientific instrumentation color mapping (locked palette)
  const styles = {
    green: 'bg-[#E5F2EC] text-[#3F8068] border-[#CBD9DA]',
    amber: 'bg-[#F8EFE3] text-[#B78332] border-[#CBD9DA]',
    red: 'bg-[#F9E8E8] text-[#B85C5C] border-[#CBD9DA]',
    cyan: 'bg-[#E2EFF0] text-[#2A7C7A] border-[#CBD9DA]',
    blue: 'bg-[#E2EFF0] text-[#2A7C7A] border-[#CBD9DA]',
    purple: 'bg-[#E2EFF0] text-[#1F4B60] border-[#CBD9DA]',
    slate: 'bg-[#F8F6F2] text-[#60868C] border-[#CBD9DA]',
  }[determinedVariant || 'slate'];

  const dotColors = {
    green: 'bg-[#3F8068]',
    amber: 'bg-[#B78332]',
    red: 'bg-[#B85C5C]',
    cyan: 'bg-[#2A7C7A]',
    blue: 'bg-[#2A7C7A]',
    purple: 'bg-[#1F4B60]',
    slate: 'bg-[#60868C]',
  }[determinedVariant || 'slate'];

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider',
    md: 'text-[11px] px-2 py-0.5 tracking-wider',
    lg: 'text-xs px-2.5 py-1 tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] border uppercase font-mono font-medium transition-colors ${styles} ${sizeClasses}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors}`} />
      </span>
      {status}
    </span>
  );
};
