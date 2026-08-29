import { format, parseISO, isValid } from 'date-fns';
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

export const getCurrentTimeString = (): string => {
  return format(new Date(), 'HH:mm');
};

export const getTimeOfDayFromTime = (timeStr?: string): 'madrugada' | 'manha' | 'tarde' | 'noite' => {
  if (!timeStr) {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 6) return 'madrugada';
    if (currentHour >= 6 && currentHour < 12) return 'manha';
    if (currentHour >= 12 && currentHour < 18) return 'tarde';
    return 'noite';
  }
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (isNaN(hour)) return 'manha';
  if (hour >= 0 && hour < 6) return 'madrugada';
  if (hour >= 6 && hour < 12) return 'manha';
  if (hour >= 12 && hour < 18) return 'tarde';
  return 'noite';
};

