import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useSimulation();

  React.useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dismissNotification(notifications[notifications.length - 1].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notifications, dismissNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-18 right-6 z-50 flex flex-col gap-1.5 max-w-xs w-full pointer-events-none">
      {notifications.map((n) => {
        const icons = {
          info: <Info className="w-4 h-4 text-[#2A7C7A] flex-shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#B78332] flex-shrink-0" />,
          alert: <AlertCircle className="w-4 h-4 text-[#B85C5C] flex-shrink-0" />,
          critical: <AlertCircle className="w-4 h-4 text-[#B85C5C] flex-shrink-0" />,
          success: <CheckCircle2 className="w-4 h-4 text-[#3F8068] flex-shrink-0" />,
        }[n.type || 'info'];

        const borderStyle = {
          info: 'border-l-4 border-l-[#2A7C7A]',
          warning: 'border-l-4 border-l-[#B78332]',
          alert: 'border-l-4 border-l-[#B85C5C]',
          critical: 'border-l-4 border-l-[#B85C5C]',
          success: 'border-l-4 border-l-[#3F8068]',
        }[n.type || 'info'];

        return (
          <div
            key={n.id}
            className={`pointer-events-auto rounded-[8px] border border-[#BDCED3] bg-[#FFFFFF] p-3.5 shadow-md transition-all duration-200 ${borderStyle}`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">{icons}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-sans font-semibold tracking-wide uppercase text-[#1F4B60] truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] font-mono text-[#60868C]">
                    {n.timestamp}
                  </span>
                </div>
                <p className="text-xs font-sans text-[#60868C] mt-1 leading-snug">
                  {n.message}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(n.id)}
                className="text-[#60868C] hover:text-[#1F4B60] p-0.5 rounded transition-colors"
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
