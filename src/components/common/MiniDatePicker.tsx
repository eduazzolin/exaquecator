import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  subDays,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDateFull, getTodayDateString } from '../../utils/dateUtils';

interface MiniDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

export const MiniDatePicker: React.FC<MiniDatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    try {
      return parseISO(value);
    } catch {
      return new Date();
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDateObj = parseISO(value);

  const handleSelectDay = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const isToday = value === getTodayDateString();

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setViewDate(parseISO(value));
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500 text-slate-200 transition-all text-xs sm:text-sm font-bold shadow-sm"
      >
        <Calendar className="w-4 h-4 text-violet-400" />
        <span>{formatDateFull(value)}</span>
        {isToday && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/50">
            Hoje
          </span>
        )}
      </button>

      {/* Mini Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
          
          {/* Quick Buttons */}
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800/80">
            <button
              type="button"
              onClick={() => handleSelectDay(new Date())}
              className="flex-1 py-1 px-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-300 text-xs font-semibold hover:bg-violet-900/60 transition-colors text-center"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => handleSelectDay(subDays(new Date(), 1))}
              className="flex-1 py-1 px-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-850 transition-colors text-center"
            >
              Ontem
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white capitalize">
              {format(viewDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-500">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const isCurrMonth = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, selectedDateObj);
              const isTodayDay = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    !isCurrMonth
                      ? 'opacity-20 text-slate-500'
                      : isSelected
                      ? 'bg-violet-600 text-white font-bold shadow-sm'
                      : isTodayDay
                      ? 'border border-violet-500 text-violet-300 font-bold bg-violet-950/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
