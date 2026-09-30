import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useSimulation();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        const icons = {
          info: <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
          alert: <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-pulse" />,
          critical: <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-pulse" />,
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
        }[n.type || 'info'];

        const borderBg = {
          info: 'bg-ocean-900/95 border-cyan-500/40 text-slate-100 shadow-cyan-950/60',
          warning: 'bg-ocean-900/95 border-amber-500/50 text-slate-100 shadow-amber-950/60',
          alert: 'bg-ocean-900/95 border-rose-500/60 text-slate-100 shadow-rose-950/80 animate-pulse-subtle',
          critical: 'bg-ocean-900/95 border-rose-500/80 text-slate-100 shadow-rose-950/80 animate-pulse-subtle',
          success: 'bg-ocean-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/60',
        }[n.type || 'info'];

        return (
          <div
            key={n.id}
            className={`pointer-events-auto rounded-md border p-3 shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borderBg}`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">{icons}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-100 truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {n.timestamp}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-slate-300 mt-1 leading-snug">
                  {n.message}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(n.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
