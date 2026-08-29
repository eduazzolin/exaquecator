import React from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useData();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map(n => {
        let bg = 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-primary)]';
        let Icon = Info;
        let iconColor = 'text-sky-500';

        if (n.type === 'success') {
          bg = 'bg-[var(--card-bg)] border-emerald-500/30 text-[var(--text-primary)]';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-500';
        } else if (n.type === 'error') {
          bg = 'bg-[var(--card-bg)] border-rose-500/30 text-[var(--text-primary)]';
          Icon = AlertCircle;
          iconColor = 'text-rose-500';
        } else if (n.type === 'warning') {
          bg = 'bg-[var(--card-bg)] border-amber-500/30 text-[var(--text-primary)]';
          Icon = AlertTriangle;
          iconColor = 'text-amber-500';
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-lg backdrop-blur-md transition-all duration-200 animate-in ${bg}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
              <span className="text-xs font-medium leading-snug">{n.message}</span>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
