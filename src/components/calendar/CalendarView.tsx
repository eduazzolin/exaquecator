import React, { useState } from 'react';
import { CrisisRecord } from '../../types';
import { getIntensityColor } from '../../utils/constants';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon
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

interface CalendarViewProps {
  crises: CrisisRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  crises, 
  selectedDate, 
  onSelectDate 
}) => {
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

  return (
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
              {daysWithCrisis} {daysWithCrisis === 1 ? 'dia com crise' : 'dias com crise'} • {painFreeDays} dias sem dor
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
            const color = intensity !== null ? getIntensityColor(intensity) : null;

            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  onSelectDate(formattedDayStr);
                  // Scroll gently to top form if needed
                  window.scrollTo({ top: 0, behavior: 'smooth' });
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
                </div>

                {crisis ? (
                  intensity !== null ? (
                    <div className={`mt-0.5 p-0.5 rounded-md border text-[10px] font-bold truncate flex items-center gap-1 ${color?.bg} ${color?.text} ${color?.border}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{intensity}/10</span>
                    </div>
                  ) : (
                    <div className="mt-0.5 p-0.5 rounded-md border border-slate-700 bg-slate-800 text-[10px] text-slate-400 font-medium truncate">
                      • Crise
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
  );
};
