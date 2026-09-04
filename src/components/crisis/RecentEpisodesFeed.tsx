import React, { useState } from 'react';
import { CrisisRecord } from '../../types';
import { formatDateFull } from '../../utils/dateUtils';
import { IntensityBadge } from '../common/IntensityBadge';
import { formatPeriod } from '../../utils/constants';
import { 
  Calendar, 
  Pill, 
  ChevronDown, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface RecentEpisodesFeedProps {
  crises: CrisisRecord[];
  onEditEpisode?: (date: string) => void;
}

export const RecentEpisodesFeed: React.FC<RecentEpisodesFeedProps> = ({
  crises,
  onEditEpisode
}) => {
  const { deleteCrisis } = useData();
  const [expandedCrisisId, setExpandedCrisisId] = useState<string | null>(null);

  // Sort descending by date
  const sortedCrises = [...crises]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (sortedCrises.length === 0) return null;

  const toggleExpand = (crisisId: string) => {
    setExpandedCrisisId(prev => (prev === crisisId ? null : crisisId));
  };

  const handleDelete = async (e: React.MouseEvent, crisis: CrisisRecord) => {
    e.stopPropagation();
    if (window.confirm(`Deseja excluir o registro do dia ${formatDateFull(crisis.date)}?`)) {
      await deleteCrisis(crisis.id);
      if (expandedCrisisId === crisis.id) {
        setExpandedCrisisId(null);
      }
    }
  };

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
          const isExpanded = expandedCrisisId === crisis.id;

          return (
            <div
              key={crisis.id}
              className={`rounded-md bg-[var(--bg-secondary)] border transition-all overflow-hidden ${
                isExpanded
                  ? 'border-[var(--card-border-hover)] ring-1 ring-[var(--card-border-hover)] shadow-sm'
                  : 'border-[var(--card-border)] hover:border-[var(--card-border-hover)]'
              }`}
            >
              {/* Clickable Card Header / Summary */}
              <div
                onClick={() => toggleExpand(crisis.id)}
                className="p-3.5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group select-none"
                title={isExpanded ? 'Recolher detalhes' : 'Clique para ver detalhes abaixo'}
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
                  <span className="text-[11px] hidden sm:inline">
                    {isExpanded ? 'Recolher' : 'Ver detalhes'}
                  </span>
                  <div className="p-1 rounded-md group-hover:bg-[var(--card-bg)] transition-colors">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[var(--text-primary)]' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Details displayed directly below the clicked card */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-2 border-t border-[var(--card-border)] space-y-3 animate-in">
                  
                  {/* Medications Taken */}
                  {crisis.medicationsTaken && crisis.medicationsTaken.length > 0 && (
                    <div className="space-y-1.5 p-2.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)]">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        Medicamentos Tomados
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {crisis.medicationsTaken.map((m, idx) => {
                          const reliefMap = {
                            total: '🌟 Alívio Total',
                            partial: '⚖️ Alívio Parcial',
                            none: '❌ Sem Alívio',
                            unknown: ''
                          };
                          const reliefText = m.relief && reliefMap[m.relief] ? ` • ${reliefMap[m.relief]}` : '';
                          const qty = m.quantity && m.quantity > 1 ? `${m.quantity}x ` : '';
                          return (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--card-border)] text-xs text-[var(--text-primary)]"
                            >
                              💊 {qty}<strong>{m.name}</strong> {m.dosage ? `(${m.dosage})` : ''}
                              <span className="text-[10px] text-[var(--text-muted)]">{reliefText}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Symptoms & Triggers */}
                  {((crisis.symptoms && crisis.symptoms.length > 0) || (crisis.triggers && crisis.triggers.length > 0)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {crisis.symptoms && crisis.symptoms.length > 0 && (
                        <div className="p-2.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[var(--text-secondary)]" /> Sintomas
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {crisis.symptoms.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--card-border)] text-xs text-[var(--text-secondary)]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {crisis.triggers && crisis.triggers.length > 0 && (
                        <div className="p-2.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Gatilhos
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {crisis.triggers.map((t, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--card-border)] text-xs text-amber-600 dark:text-amber-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {crisis.notes && (
                    <div className="p-2.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Observações
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
                        {crisis.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions inside details */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--card-border)]">
                    {onEditEpisode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEpisode(crisis.date);
                        }}
                        className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar no Formulário</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, crisis)}
                      className="p-1 rounded-md border border-rose-500/20 bg-rose-500/10 text-[var(--color-below)] hover:bg-rose-500/20 transition-colors"
                      title="Excluir este registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
