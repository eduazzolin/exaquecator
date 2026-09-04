import { format, parseISO, isValid, startOfDay, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDateFull = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const date = parseISO(dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
};

export const formatDateShort = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const date = parseISO(dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatDayMonth = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const date = parseISO(dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, 'dd MMM', { locale: ptBR });
};

export const getTodayDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getDaysSinceLastCrisis = (crises: { date: string }[]): {
  days: number | null;
  latestDate: string | null;
} => {
  if (!crises || crises.length === 0) return { days: null, latestDate: null };
  const today = startOfDay(new Date());
  const todayStr = format(today, 'yyyy-MM-dd');
  const pastOrTodayCrises = crises
    .filter(c => c.date <= todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latest = pastOrTodayCrises[0];
  if (!latest) return { days: null, latestDate: null };
  const days = differenceInCalendarDays(today, startOfDay(parseISO(latest.date)));
  return { days, latestDate: latest.date };
};
