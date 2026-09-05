import React, { useState, useEffect } from 'react';
import { CrisisRecord } from '../../types';
import { IntensityBadge } from '../common/IntensityBadge';
import { formatDateFull, getDaysSinceLastCrisis } from '../../utils/dateUtils';
import { formatPeriod } from '../../utils/constants';
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
  Clock,
  X,
  Camera
} from 'lucide-react';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
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
  selectedCalendarDay?: string | null;
  onSelectCalendarDay?: (date: string | null) => void;
  onSelectDate: (date: string) => void;
  onEditInForm: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  crises, 
  selectedDate, 
  selectedCalendarDay: controlledSelectedCalendarDay,
  onSelectCalendarDay,
  onSelectDate,
  onEditInForm
}) => {
  const { deleteCrisis } = useData();

  const [internalSelectedDay, setInternalSelectedDay] = useState<string | null>(null);
  const [selectedDayImageIndex, setSelectedDayImageIndex] = useState<number | null>(null);

  const selectedCalendarDay = controlledSelectedCalendarDay !== undefined 
    ? controlledSelectedCalendarDay 
    : internalSelectedDay;

  const setSelectedCalendarDay = (day: string | null) => {
    if (onSelectCalendarDay) {
      onSelectCalendarDay(day);
    } else {
      setInternalSelectedDay(day);
    }
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    try {
      return parseISO(selectedDate);
    } catch {
      return new Date();
    }
  });

  // Sync currentMonth when selectedCalendarDay changes to a different month
  useEffect(() => {
    if (selectedCalendarDay) {
      try {
        const dateObj = parseISO(selectedCalendarDay);
        if (!isSameMonth(dateObj, currentMonth)) {
          setCurrentMonth(dateObj);
        }
      } catch (err) {
        console.error('Error parsing selectedCalendarDay:', err);
      }
    }
  }, [selectedCalendarDay]);

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

  // Selected Day's record in Calendar (only active when clicked by user)
  const activeCrisis = selectedCalendarDay ? crises.find(c => c.date === selectedCalendarDay) : null;

  const handleDelete = async () => {
    if (!activeCrisis || !selectedCalendarDay) return;
    if (window.confirm(`Deseja excluir o registro do dia ${formatDateFull(selectedCalendarDay)}?`)) {
      await deleteCrisis(activeCrisis.id);
    }
  };

  const painFreePercentage = totalDaysInMonth > 0 ? Math.round((painFreeDays / totalDaysInMonth) * 100) : 100;
  const monthCrisesWithIntensity = currentMonthCrises.filter(c => c.intensity !== null && c.intensity !== undefined);
  const monthAvgIntensity = monthCrisesWithIntensity.length > 0
    ? (monthCrisesWithIntensity.reduce((acc, c) => acc + (c.intensity || 0), 0) / monthCrisesWithIntensity.length).toFixed(1)
    : '—';

  // KPI: Dias desde a última crise registrada
  const { days: daysSinceLastCrisis, latestDate: lastCrisisDate } = getDaysSinceLastCrisis(crises);

  return (
    <div id="calendar-card" className="glass p-4 sm:p-6 space-y-6 animate-in scroll-mt-20">
      {/* Calendar Section */}
      <div className="space-y-4">
        
        {/* Month Header & Quick Navigation */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)]" />
            <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] capitalize">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now);
                const todayStr = format(now, 'yyyy-MM-dd');
                setSelectedCalendarDay(todayStr);
                onSelectDate(todayStr);
              }}
              className="px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] hover:bg-[var(--card-border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block border border-[var(--card-border)]"
            >
              Hoje
            </button>
            <div className="flex items-center rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] p-0.5">
              <button
                onClick={prevMonth}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Micro-KPIs Grid (including Dias desde a última crise) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* KPI 1: Dias desde a última crise */}
          <div 
            className="p-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] text-center flex flex-col justify-between"
            title="Dias decorridos desde a última crise registrada"
          >
            <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider truncate">
              Última Crise
            </p>
            <p className={`text-sm sm:text-base font-bold mt-0.5 ${
              daysSinceLastCrisis === null
                ? 'text-[var(--text-muted)]'
                : daysSinceLastCrisis === 0
                ? 'text-amber-500'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {daysSinceLastCrisis !== null 
                ? (daysSinceLastCrisis === 0 ? '0 dias' : `${daysSinceLastCrisis} dia${daysSinceLastCrisis === 1 ? '' : 's'}`)
                : '—'}
            </p>
            <span className="text-[10px] text-[var(--text-muted)] truncate">
              {daysSinceLastCrisis !== null
                ? (daysSinceLastCrisis === 0 ? 'Hoje' : daysSinceLastCrisis === 1 ? 'Ontem' : `desde ${format(parseISO(lastCrisisDate!), 'dd/MM')}`)
                : 'Sem crises'}
            </span>
          </div>

          {/* KPI 2: Dias Livres */}
          <div className="p-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] text-center flex flex-col justify-between">
            <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider truncate">Dias Livres</p>
            <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {painFreeDays}d
            </p>
            <span className="text-[10px] text-[var(--text-muted)] truncate">
              {painFreePercentage}% do mês
            </span>
          </div>

          {/* KPI 3: Com Registro */}
          <div className="p-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] text-center flex flex-col justify-between">
            <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider truncate">Com Registro</p>
            <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-0.5">
              {daysWithCrisis} dia{daysWithCrisis === 1 ? '' : 's'}
            </p>
            <span className="text-[10px] text-[var(--text-muted)] truncate">
              neste mês
            </span>
          </div>

          {/* KPI 4: Média de Dor */}
          <div className="p-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] text-center flex flex-col justify-between">
            <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider truncate">Média de Dor</p>
            <p className="text-sm sm:text-base font-bold text-[var(--color-below)] mt-0.5">
              {monthAvgIntensity !== '—' ? `${monthAvgIntensity}/10` : '—'}
            </p>
            <span className="text-[10px] text-[var(--text-muted)] truncate">
              escala 1 a 10
            </span>
          </div>
        </div>

        {/* Main Calendar Grid */}
        <div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-[11px] font-medium text-[var(--text-muted)] py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map(day => {
              const formattedDayStr = format(day, 'yyyy-MM-dd');
              const isCurrentMonthDay = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const isSelected = formattedDayStr === selectedCalendarDay;
              const dayCrises = getCrisesForDay(day);
              const crisis = dayCrises[0];
              const intensity = crisis?.intensity ?? null;
              const crisisType = crisis?.type ?? (crisis ? 'dor' : null);

              // Background cell fill color based on type
              let cellBgColor = 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)]';
              let typeBadge = null;

              if (crisis) {
                if (crisisType === 'milagre') {
                  cellBgColor = 'bg-emerald-500/20 dark:bg-emerald-500/25 border-emerald-500/40 text-emerald-900 dark:text-emerald-100 font-medium';
                  typeBadge = '🍀';
                } else if (crisisType === 'presenca') {
                  cellBgColor = 'bg-sky-500/20 dark:bg-sky-500/25 border-sky-500/40 text-sky-900 dark:text-sky-100 font-medium';
                  typeBadge = '🌀';
                } else if (crisisType === 'aura') {
                  cellBgColor = 'bg-violet-500/20 dark:bg-violet-500/25 border-violet-500/40 text-violet-900 dark:text-violet-100 font-medium';
                  typeBadge = '✨';
                } else {
                  // Default to dor (color intensity tint)
                  if (intensity !== null && intensity >= 8) {
                    cellBgColor = 'bg-rose-500/25 dark:bg-rose-500/30 border-rose-500/50 text-rose-950 dark:text-rose-100 font-medium';
                  } else if (intensity !== null && intensity >= 5) {
                    cellBgColor = 'bg-orange-500/25 dark:bg-orange-500/30 border-orange-500/50 text-orange-950 dark:text-orange-100 font-medium';
                  } else {
                    cellBgColor = 'bg-amber-500/25 dark:bg-amber-500/30 border-amber-500/50 text-amber-950 dark:text-amber-100 font-medium';
                  }
                  typeBadge = '💥';
                }
              }

              const hasMedications = Boolean(crisis?.medicationsTaken && crisis.medicationsTaken.length > 0);
              const totalMedsCount = crisis?.medicationsTaken ? crisis.medicationsTaken.reduce((acc, m) => acc + (m.quantity || 1), 0) : 0;
              const hasImages = Boolean(crisis?.images && crisis.images.length > 0);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    if (selectedCalendarDay === formattedDayStr) {
                      setSelectedCalendarDay(null);
                    } else {
                      setSelectedCalendarDay(formattedDayStr);
                      onSelectDate(formattedDayStr);
                    }
                  }}
                  className={`min-h-[48px] sm:min-h-[56px] p-1 sm:p-1.5 rounded-md border text-left transition-all relative flex flex-col justify-between ${
                    !isCurrentMonthDay
                      ? 'opacity-20 border-transparent bg-transparent pointer-events-none'
                      : isSelected
                      ? `${cellBgColor} ring-2 ring-[var(--color-primary)] shadow-md z-10 scale-[1.02]`
                      : `${cellBgColor} hover:border-[var(--card-border-hover)] hover:opacity-90`
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs rounded w-5 h-5 flex items-center justify-center font-semibold ${
                        isToday
                          ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] shadow-sm'
                          : isSelected
                          ? 'text-[var(--text-primary)] font-bold'
                          : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    <div className="flex items-center gap-0.5">
                      {hasImages && (
                        <span className="text-[10px]" title={`${crisis?.images?.length} foto(s) anexada(s)`}>
                          📷
                        </span>
                      )}
                      {hasMedications && (
                        <span className="text-[10px]" title={`Remédios tomados: ${totalMedsCount} dose(s)`}>
                          💊
                        </span>
                      )}
                      {typeBadge && (
                        <span className="text-[11px]" title={`Tipo: ${crisisType}`}>
                          {typeBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {crisis ? (
                    <div className="mt-0.5 flex items-center justify-between text-[10px] font-semibold">
                      {intensity !== null ? (
                        <span className="px-1 py-0.2 rounded bg-black/10 dark:bg-white/10">
                          {intensity}/10
                        </span>
                      ) : (
                        <span className="capitalize opacity-80">{crisisType || 'Crise'}</span>
                      )}

                      {hasMedications && totalMedsCount > 1 && (
                        <span className="text-[9px] opacity-75 font-mono">
                          {totalMedsCount}x
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 mt-2 border-t border-[var(--card-border)] text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/25 border border-emerald-500/50" />
              <span>🍀 Milagre</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-500/25 border border-sky-500/50" />
              <span>🌀 Presença</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-500/25 border border-orange-500/50" />
              <span>💥 Dor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-violet-500/25 border border-violet-500/50" />
              <span>✨ Aura</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>💊</span>
              <span>Remédio Tomado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[var(--card-bg)] border border-[var(--card-border)]" />
              <span>⚪ Sem Registro</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION: Details of the Selected Day (Only appears when a calendar day is clicked) */}
      {selectedCalendarDay && (
        <div className="pt-6 border-t border-[var(--card-border)] space-y-3.5 animate-in">
          
          {/* Header of details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--card-border)]">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Detalhes do Dia Selecionado
              </span>
              <h4 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] mt-0.5 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                {formatDateFull(selectedCalendarDay)}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {activeCrisis ? (
                <>
                  <button
                    onClick={() => onEditInForm(selectedCalendarDay)}
                    className="btn btn-secondary text-xs py-1.5 px-3"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar no Formulário</span>
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
                  onClick={() => onEditInForm(selectedCalendarDay)}
                  className="btn btn-primary text-xs py-1.5 px-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar este Dia</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedCalendarDay(null)}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--card-border)] transition-colors ml-1"
                title="Fechar detalhes do dia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content of details */}
          {activeCrisis ? (
            <div className="space-y-3">
              
              {/* Type, Intensity, and Start Time Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {activeCrisis.startTime && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-primary)]">
                    <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                    {formatPeriod(activeCrisis.startTime)}
                  </span>
                )}

                {activeCrisis.type && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-primary)]">
                    {activeCrisis.type === 'milagre' && '🍀 Milagre'}
                    {activeCrisis.type === 'presenca' && '🌀 Presença'}
                    {activeCrisis.type === 'dor' && '💥 Dor'}
                    {activeCrisis.type === 'aura' && '✨ Aura'}
                  </span>
                )}

                {activeCrisis.type !== 'milagre' && (
                  <IntensityBadge level={activeCrisis.intensity} showLabel />
                )}
              </div>

              {/* Medications Taken */}
              {activeCrisis.medicationsTaken && activeCrisis.medicationsTaken.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    Medicamentos Tomados
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCrisis.medicationsTaken.map((m, idx) => {
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
                          className="px-2.5 py-1 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--text-primary)]"
                        >
                          💊 {qty}<strong>{m.name}</strong> {m.dosage ? `(${m.dosage})` : ''}
                          <span className="text-[11px] text-[var(--text-muted)]">{reliefText}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Symptoms and Triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeCrisis.symptoms && activeCrisis.symptoms.length > 0 && (
                  <div className="p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[var(--text-secondary)]" /> Sintomas
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {activeCrisis.symptoms.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--text-secondary)]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeCrisis.triggers && activeCrisis.triggers.length > 0 && (
                  <div className="p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" /> Gatilhos
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {activeCrisis.triggers.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-amber-600 dark:text-amber-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {activeCrisis.notes && (
                <div className="p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[var(--text-muted)]" /> Observações
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
                    {activeCrisis.notes}
                  </p>
                </div>
              )}

              {/* Attached Photos */}
              {activeCrisis.images && activeCrisis.images.length > 0 && (
                <div className="p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    <span>Fotos Anexadas ({activeCrisis.images.length})</span>
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {activeCrisis.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Foto ${idx + 1}`}
                        onClick={() => setSelectedDayImageIndex(idx)}
                        className="w-16 h-16 rounded-lg object-cover cursor-pointer border border-[var(--card-border)] hover:scale-105 transition-transform shrink-0"
                        title="Clique para ampliar"
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-4 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Nenhum registro de crise salvo para este dia
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Clique em &quot;Registrar este Dia&quot; se desejar adicionar sintomas, dor ou remédios tomados.
              </p>
            </div>
          )}

        </div>
      )}

      {/* Modal de Zoom da Imagem (Lightbox) */}
      <ImageLightboxModal
        isOpen={selectedDayImageIndex !== null}
        onClose={() => setSelectedDayImageIndex(null)}
        images={activeCrisis?.images || []}
        initialIndex={selectedDayImageIndex ?? 0}
        title={selectedCalendarDay ? formatDateFull(selectedCalendarDay) : undefined}
      />
    </div>
  );
};
