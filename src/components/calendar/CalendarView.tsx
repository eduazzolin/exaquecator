import React, { useState } from 'react';
import { CrisisRecord } from '../../types';
import { getIntensityColor } from '../../utils/constants';
import { IntensityBadge } from '../common/IntensityBadge';
import { formatDateFull } from '../../utils/dateUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Edit3,
  Trash2,
  Plus,
  Pill,
  Sparkles,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  format, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../../context/DataContext';

interface CalendarViewProps {
  crises: CrisisRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onEditInForm: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  crises, 
  selectedDate, 
  onSelectDate,
  onEditInForm
}) => {
  const { deleteCrisis } = useData();

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    try {
      return parseISO(selectedDate);
    } catch {
      return new Date();
    }
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getCrisesForDay = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return crises.filter(c => c.date === formattedDay);
  };

  const currentMonthPrefix = format(currentMonth, 'yyyy-MM');
  const currentMonthCrises = crises.filter(c => c.date.startsWith(currentMonthPrefix));

  const totalDaysInMonth = parseInt(format(monthEnd, 'd'), 10);
  const daysWithCrisis = new Set(currentMonthCrises.map(c => c.date)).size;
  const painFreeDays = Math.max(0, totalDaysInMonth - daysWithCrisis);

  // Selected Day's record
  const selectedCrisis = crises.find(c => c.date === selectedDate);

  const handleDelete = async () => {
    if (!selectedCrisis) return;
    if (window.confirm(`Deseja excluir o registro do dia ${formatDateFull(selectedDate)}?`)) {
      await deleteCrisis(selectedCrisis.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        
        {/* Month Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-violet-400" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white capitalize">
                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              <p className="text-[11px] text-slate-400">
                {daysWithCrisis} {daysWithCrisis === 1 ? 'dia com registro' : 'dias com registros'} • {painFreeDays} dias livres
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now);
                onSelectDate(format(now, 'yyyy-MM-dd'));
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors hidden sm:block"
            >
              Hoje
            </button>
            <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 p-0.5">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg text-slate-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg text-slate-300 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Calendar Grid */}
        <div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-[11px] font-bold text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map(day => {
              const formattedDayStr = format(day, 'yyyy-MM-dd');
              const isCurrentMonthDay = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const isSelected = formattedDayStr === selectedDate;
              const dayCrises = getCrisesForDay(day);
              const crisis = dayCrises[0];
              const intensity = crisis?.intensity ?? null;
              const crisisType = crisis?.type ?? null;
              const color = intensity !== null ? getIntensityColor(intensity) : null;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    onSelectDate(formattedDayStr);
                  }}
                  className={`min-h-[48px] sm:min-h-[58px] p-1 sm:p-1.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    !isCurrentMonthDay
                      ? 'opacity-25 border-transparent bg-slate-950/20'
                      : isSelected
                      ? 'border-violet-500 bg-violet-950/40 ring-2 ring-violet-500/50'
                      : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs rounded-md w-5 h-5 flex items-center justify-center font-medium ${
                        isToday
                          ? 'bg-violet-600 text-white font-bold'
                          : isSelected
                          ? 'text-violet-300 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    {crisisType && (
                      <span className="text-[10px]" title={`Tipo: ${crisisType}`}>
                        {crisisType === 'presenca' && '🌫️'}
                        {crisisType === 'dor' && '💥'}
                        {crisisType === 'aura' && '✨'}
                      </span>
                    )}
                  </div>

                  {crisis ? (
                    intensity !== null ? (
                      <div className={`mt-0.5 p-0.5 rounded-md border text-[10px] font-bold truncate flex items-center gap-1 ${color?.bg} ${color?.text} ${color?.border}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{intensity}/10</span>
                      </div>
                    ) : (
                      <div className="mt-0.5 p-0.5 rounded-md border border-slate-700 bg-slate-800 text-[10px] text-slate-300 font-medium truncate">
                        {crisisType === 'presenca' ? 'Presença' : crisisType === 'aura' ? 'Aura' : '• Crise'}
                      </div>
                    )
                  ) : (
                    <div className="h-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECTION BELOW CALENDAR: Details of the Selected Day */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3.5 animate-in fade-in">
        
        {/* Header of details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Detalhes do Dia Selecionado
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white mt-0.5 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-violet-400" />
              {formatDateFull(selectedDate)}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {selectedCrisis ? (
              <>
                <button
                  onClick={() => onEditInForm(selectedDate)}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar no Formulário</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Excluir este registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onEditInForm(selectedDate)}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar este Dia</span>
              </button>
            )}
          </div>
        </div>

        {/* Content of details */}
        {selectedCrisis ? (
          <div className="space-y-3">
            
            {/* Type, Intensity, and Start Time Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedCrisis.startTime && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  Início às {selectedCrisis.startTime}
                </span>
              )}

              {selectedCrisis.type && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-950/80 border border-violet-800/60 text-violet-200">
                  {selectedCrisis.type === 'presenca' && '🌫️ Presença'}
                  {selectedCrisis.type === 'dor' && '💥 Dor'}
                  {selectedCrisis.type === 'aura' && '✨ Aura'}
                </span>
              )}

              <IntensityBadge level={selectedCrisis.intensity} showLabel />
            </div>

            {/* Medications Taken */}
            {selectedCrisis.medicationsTaken && selectedCrisis.medicationsTaken.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-violet-400" />
                  Medicamentos Tomados
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCrisis.medicationsTaken.map((m, idx) => {
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
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                      >
                        💊 {qty}<strong>{m.name}</strong> {m.dosage ? `(${m.dosage})` : ''}
                        <span className="text-[11px] text-slate-400">{reliefText}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Symptoms and Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedCrisis.symptoms && selectedCrisis.symptoms.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-violet-400" /> Sintomas
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCrisis.symptoms.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-xs text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCrisis.triggers && selectedCrisis.triggers.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" /> Gatilhos
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCrisis.triggers.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-xs text-amber-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedCrisis.notes && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" /> Observações
                </p>
                <p className="text-xs text-slate-300 whitespace-pre-wrap">
                  {selectedCrisis.notes}
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="py-4 text-center space-y-1">
            <CheckCircle2 className="w-7 h-7 text-emerald-500/70 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">
              Nenhum registro de crise salvo para este dia
            </p>
            <p className="text-[11px] text-slate-500">
              Clique em &quot;Registrar este Dia&quot; se desejar adicionar sintomas, dor ou remédios tomados.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
