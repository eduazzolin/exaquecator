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
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--card-border-hover)] text-[var(--text-primary)] transition-all text-xs sm:text-sm font-medium shadow-sm"
      >
        <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span>{formatDateFull(value)}</span>
        {isToday && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--card-border)]">
            Hoje
          </span>
        )}
      </button>

      {/* Mini Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 p-3.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl animate-in">
          
          {/* Quick Buttons */}
          <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-[var(--card-border)]">
            <button
              type="button"
              onClick={() => handleSelectDay(new Date())}
              className="flex-1 py-1 px-2 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-primary)] text-xs font-medium hover:border-[var(--card-border-hover)] transition-colors text-center"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => handleSelectDay(subDays(new Date(), 1))}
              className="flex-1 py-1 px-2 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-secondary)] text-xs font-medium hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)] transition-colors text-center"
            >
              Ontem
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--text-primary)] capitalize">
              {format(viewDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] font-semibold text-[var(--text-muted)]">
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
                  className={`h-7 rounded-md text-xs font-medium flex items-center justify-center transition-all ${
                    !isCurrMonth
                      ? 'opacity-25 text-[var(--text-muted)]'
                      : isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] font-semibold shadow-sm'
                      : isTodayDay
                      ? 'border border-[var(--card-border-hover)] text-[var(--text-primary)] font-semibold bg-[var(--bg-secondary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
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
