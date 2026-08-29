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
