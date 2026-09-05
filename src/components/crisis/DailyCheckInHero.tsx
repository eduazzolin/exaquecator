import React from 'react';
import { useData } from '../../context/DataContext';
import { Medication } from '../../types';
import { formatDateFull, getTodayDateString } from '../../utils/dateUtils';
import { getIntensityColor, formatPeriod } from '../../utils/constants';
import { 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Edit3, 
  Pill, 
  Trash2
} from 'lucide-react';

interface DailyCheckInHeroProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenLogModal: (date: string) => void;
}

export const DailyCheckInHero: React.FC<DailyCheckInHeroProps> = ({
  selectedDate,
  onSelectDate,
  onOpenLogModal
}) => {
  const { crises, addCrisis, deleteCrisis, medications } = useData();
  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Record for the selected date
  const selectedRecord = crises.find(c => c.date === selectedDate);
  const favoriteMeds = medications.filter(m => m.isFavorite);

  // Quick 1-tap log favorite medication for selected day
  const handleQuickTakeMed = async (med: Medication) => {
    if (selectedRecord) {
      onOpenLogModal(selectedDate);
    } else {
      // Create new episode with this med
      await addCrisis({
        date: selectedDate,
        type: 'dor',
        intensity: 5,
        medicationsTaken: [
          {
            medicationId: med.id,
            name: med.name,
            dosage: med.dosage,
            quantity: 1,
            relief: 'total'
          }
        ],
        symptoms: [],
        triggers: []
      });
      onOpenLogModal(selectedDate);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    if (window.confirm(`Deseja excluir o registro do dia ${formatDateFull(selectedDate)}?`)) {
      await deleteCrisis(selectedRecord.id);
    }
  };

  const colorInfo = selectedRecord?.intensity !== null && selectedRecord?.intensity !== undefined
    ? getIntensityColor(selectedRecord.intensity)
    : null;

  return (
    <div className="glass p-5 sm:p-6 space-y-4 relative overflow-hidden">
      
      {/* Top Bar: Date & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[var(--card-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {isToday ? 'Hoje' : 'Dia Selecionado'}
            </span>
            {isToday ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <button
                type="button"
                onClick={() => onSelectDate(today)}
                className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline font-medium"
              >
                Voltar para Hoje
              </button>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] capitalize mt-0.5">
            {formatDateFull(selectedDate)}
          </h2>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {selectedRecord ? (
            <>
              <button
                onClick={() => onOpenLogModal(selectedDate)}
                className="btn btn-secondary text-xs py-1.5 px-3"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Episódio</span>
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 text-[var(--color-below)] hover:bg-rose-500/20 transition-colors"
                title="Excluir este registro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onOpenLogModal(selectedDate)}
              className="btn btn-primary text-xs py-1.5 px-3.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Episódio</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Status Display */}
      {selectedRecord ? (
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {selectedRecord.type && (
                <span className="badge bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] font-semibold">
                  {selectedRecord.type === 'milagre' && '🍀 Milagre'}
                  {selectedRecord.type === 'presenca' && '🌀 Presença'}
                  {selectedRecord.type === 'dor' && '💥 Crise de Dor'}
                  {selectedRecord.type === 'aura' && '✨ Aura Visual/Sensorial'}
                </span>
              )}

              {selectedRecord.intensity !== null && selectedRecord.intensity !== undefined ? (
                <span className={`badge border ${colorInfo?.bg} ${colorInfo?.text} ${colorInfo?.border}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                  Dor {selectedRecord.intensity}/10 • {colorInfo?.label}
                </span>
              ) : (
                <span className="badge bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)]">
                  Intensidade não informada
                </span>
              )}

              {selectedRecord.startTime && (
                <span className="badge bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] font-medium">
                  {formatPeriod(selectedRecord.startTime)}
                </span>
              )}
            </div>

            <span className="text-[11px] text-[var(--text-muted)]">
              {selectedRecord.medicationsTaken?.length || 0} remédio(s) • {selectedRecord.symptoms?.length || 0} sintoma(s)
            </span>
          </div>

          {/* Medications Pills */}
          {selectedRecord.medicationsTaken && selectedRecord.medicationsTaken.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedRecord.medicationsTaken.map((m, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--text-primary)] flex items-center gap-1"
                >
                  <Pill className="w-3 h-3 text-[var(--text-secondary)]" />
                  <span>{m.quantity && m.quantity > 1 ? `${m.quantity}x ` : ''}{m.name} {m.dosage ? `(${m.dosage})` : ''}</span>
                </span>
              ))}
            </div>
          )}

          {/* Symptoms and Triggers snippet */}
          {(selectedRecord.symptoms?.length || selectedRecord.triggers?.length) ? (
            <div className="flex flex-wrap gap-1 pt-1 text-[11px] text-[var(--text-secondary)]">
              {selectedRecord.symptoms?.slice(0, 3).map((s, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)]">
                  {s}
                </span>
              ))}
              {selectedRecord.triggers?.slice(0, 2).map((t, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-amber-600 dark:text-amber-400">
                  ⚡ {t}
                </span>
              ))}
            </div>
          ) : null}

        </div>
      ) : (
        <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">
                Nenhuma crise registrada para este dia
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Você pode registrar um episódio com dor, aura ou remédio tomado a qualquer momento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenLogModal(selectedDate)}
              className="btn btn-secondary text-xs py-2 px-3.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Dor / Crise</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Access SOS Medication Row */}
      {favoriteMeds.length > 0 && (
        <div className="pt-2 border-t border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Acesso Rápido SOS:
          </span>

          <div className="flex flex-wrap gap-1.5">
            {favoriteMeds.map(med => (
              <button
                key={med.id}
                onClick={() => handleQuickTakeMed(med)}
                className="px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] hover:border-[var(--card-border-hover)] text-xs text-[var(--text-primary)] transition-all flex items-center gap-1 font-medium hover:bg-[var(--card-bg)]"
                title={`Registrar dose de ${med.name}`}
              >
                <span>💊 {med.name}</span>
                {med.dosage && <span className="text-[10px] text-[var(--text-muted)]">({med.dosage})</span>}
                <Plus className="w-3 h-3 ml-0.5 text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
