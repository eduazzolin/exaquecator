import React from 'react';
import { CrisisRecord } from '../../types';
import { formatDateFull } from '../../utils/dateUtils';
import { IntensityBadge } from '../common/IntensityBadge';
import { formatPeriod } from '../../utils/constants';
import { Calendar, Pill, ChevronRight } from 'lucide-react';

interface RecentEpisodesFeedProps {
  crises: CrisisRecord[];
  onSelectDate: (date: string) => void;
  onEditEpisode?: (date: string) => void;
}

export const RecentEpisodesFeed: React.FC<RecentEpisodesFeedProps> = ({
  crises,
  onSelectDate
}) => {
  // Sort descending by date
  const sortedCrises = [...crises]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (sortedCrises.length === 0) return null;

  return (
    <div className="glass p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
          Últimos Episódios Registrados
        </h3>
        <span className="text-[11px] text-[var(--text-muted)]">
          {crises.length} {crises.length === 1 ? 'registro' : 'registros'} no total
        </span>
      </div>

      <div className="space-y-2.5">
        {sortedCrises.map(crisis => {
          return (
            <div
              key={crisis.id}
              onClick={() => onSelectDate(crisis.date)}
              className="p-3.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] hover:border-[var(--card-border-hover)] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              title="Ver detalhes no calendário"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[var(--text-primary)] capitalize">
                    {formatDateFull(crisis.date)}
                  </span>
                  {crisis.startTime && (
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-0.5">
                      {formatPeriod(crisis.startTime)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {crisis.type && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] font-medium">
                      {crisis.type === 'presenca' && '🌫️ Presença'}
                      {crisis.type === 'dor' && '💥 Dor'}
                      {crisis.type === 'aura' && '✨ Aura'}
                    </span>
                  )}

                  <IntensityBadge level={crisis.intensity} size="sm" />

                  {crisis.medicationsTaken && crisis.medicationsTaken.length > 0 && (
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <Pill className="w-3 h-3 text-[var(--text-secondary)]" />
                      {crisis.medicationsTaken.map(m => m.name).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                <span className="text-xs hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Ver no calendário
                </span>
                <div className="p-1.5 rounded-md group-hover:bg-[var(--card-bg)] transition-colors">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
