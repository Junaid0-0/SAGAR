import React from 'react';
import { ActivityLog } from '../types';

interface TimelineProps {
  logs: ActivityLog[];
}

export const Timeline: React.FC<TimelineProps> = ({ logs }) => {
  return (
    <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#BDCED3]">
      {logs.map((log, idx) => {
        const dotColor = {
          info: 'bg-[#2A7C7A]',
          warning: 'bg-[#B78332]',
          critical: 'bg-[#B85C5C]',
          success: 'bg-[#3F8068]',
        }[log.type];

        return (
          <div key={idx} className="relative group select-none">
            {/* Dot marker on vertical line */}
            <div
              className={`absolute -left-[23px] top-1.5 w-2 h-2 rounded-full border border-[#FFFFFF] ring-1 ring-[#BDCED3] ${dotColor}`}
            />
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[11px] font-semibold text-[#2A7C7A] tracking-wider flex-shrink-0">
                {log.time}
              </span>
              <span className="font-sans text-xs text-[#1F4B60] leading-snug">
                {log.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
