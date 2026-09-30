import React from 'react';
import { ActivityLog } from '../types';
import { Clock, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface TimelineProps {
  logs: ActivityLog[];
}

export const Timeline: React.FC<TimelineProps> = ({ logs }) => {
  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
      {logs.map((log, idx) => {
        const dotColor = {
          info: 'bg-cyan-400 border-cyan-950',
          warning: 'bg-amber-400 border-amber-950',
          critical: 'bg-rose-400 border-rose-950 animate-ping-slow',
          success: 'bg-emerald-400 border-emerald-950',
        }[log.type];

        return (
          <div key={idx} className="relative group select-none">
            {/* Dot marker on vertical line */}
            <div
              className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border-2 ${dotColor}`}
            />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] font-bold text-cyan-400 tracking-wider">
                {log.time}
              </span>
              <span className="font-sans text-xs text-slate-300 leading-snug">
                {log.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
