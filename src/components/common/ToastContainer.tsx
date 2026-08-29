import React from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useData();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map(n => {
        let bg = 'bg-slate-900 border-slate-700 text-slate-100';
        let Icon = Info;
        let iconColor = 'text-sky-400';

        if (n.type === 'success') {
          bg = 'bg-emerald-950/90 border-emerald-800/80 text-emerald-100';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (n.type === 'error') {
          bg = 'bg-rose-950/90 border-rose-800/80 text-rose-100';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (n.type === 'warning') {
          bg = 'bg-amber-950/90 border-amber-800/80 text-amber-100';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${bg}`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <span className="text-sm font-medium leading-snug">{n.message}</span>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
