import { 
  format, 
  parseISO, 
  isValid, 
  startOfDay, 
  differenceInCalendarDays,
  addDays,
  subDays
} from 'date-fns';
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

export interface StreakPeriod {
  days: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isCurrent: boolean;
}

export interface CrisisStreakStats {
  longestStreak: StreakPeriod | null;
  currentStreak: StreakPeriod | null;
  averageIntervalDays: number | null;
  totalMonitoredDays: number;
  totalFreeDays: number;
  freeDaysPercentage: number;
  topStreaks: StreakPeriod[];
}

export const formatStreakPeriod = (period: StreakPeriod): string => {
  if (!period.startDate || !period.endDate) return '';
  
  if (period.isCurrent) {
    if (period.days === 0) {
      return 'Crise registrada hoje';
    }
    const startStr = formatDateShort(period.startDate);
    return `Desde ${startStr} (até hoje)`;
  }

  const startStr = formatDateShort(period.startDate);
  const endStr = formatDateShort(period.endDate);

  if (period.startDate === period.endDate) {
    return startStr;
  }
  return `${startStr} a ${endStr}`;
};

export const calculateCrisisStreaks = (crises: { date: string }[]): CrisisStreakStats => {
  const emptyResult: CrisisStreakStats = {
    longestStreak: null,
    currentStreak: null,
    averageIntervalDays: null,
    totalMonitoredDays: 0,
    totalFreeDays: 0,
    freeDaysPercentage: 100,
    topStreaks: []
  };

  if (!crises || crises.length === 0) return emptyResult;

  const today = startOfDay(new Date());
  const todayStr = format(today, 'yyyy-MM-dd');

  // Dias com crise únicos, ordenados cronologicamente e filtrados até hoje
  const pastCrisisDates = Array.from(
    new Set(
      crises
        .map(c => c.date)
        .filter(d => Boolean(d) && d <= todayStr)
    )
  ).sort();

  if (pastCrisisDates.length === 0) return emptyResult;

  const periods: StreakPeriod[] = [];

  // 1. Identificar intervalos livres entre crises consecutivas
  for (let i = 0; i < pastCrisisDates.length - 1; i++) {
    const dCurrent = parseISO(pastCrisisDates[i]);
    const dNext = parseISO(pastCrisisDates[i + 1]);
    const diff = differenceInCalendarDays(dNext, dCurrent);
    const freeDays = diff - 1;

    if (freeDays > 0) {
      const periodStart = addDays(dCurrent, 1);
      const periodEnd = subDays(dNext, 1);
      periods.push({
        days: freeDays,
        startDate: format(periodStart, 'yyyy-MM-dd'),
        endDate: format(periodEnd, 'yyyy-MM-dd'),
        isCurrent: false
      });
    }
  }

  // 2. Identificar a sequência atual desde a última crise até hoje
  const lastCrisisDateStr = pastCrisisDates[pastCrisisDates.length - 1];
  const lastCrisisDate = parseISO(lastCrisisDateStr);
  const diffFromLastCrisis = differenceInCalendarDays(today, lastCrisisDate);

  let currentStreak: StreakPeriod;
  if (diffFromLastCrisis > 0) {
    const currentStart = addDays(lastCrisisDate, 1);
    currentStreak = {
      days: diffFromLastCrisis,
      startDate: format(currentStart, 'yyyy-MM-dd'),
      endDate: todayStr,
      isCurrent: true
    };
    periods.push(currentStreak);
  } else {
    currentStreak = {
      days: 0,
      startDate: todayStr,
      endDate: todayStr,
      isCurrent: true
    };
  }

  // 3. Ordenar períodos por maior número de dias (desempate pela data final mais recente)
  const sortedStreaks = [...periods].sort((a, b) => {
    if (b.days !== a.days) return b.days - a.days;
    return b.endDate.localeCompare(a.endDate);
  });

  const longestStreak = sortedStreaks.length > 0 ? sortedStreaks[0] : currentStreak;

  // 4. Média de intervalo entre episódios de crise
  let averageIntervalDays: number | null = null;
  if (pastCrisisDates.length >= 2) {
    const firstCrisisDate = parseISO(pastCrisisDates[0]);
    const totalSpan = differenceInCalendarDays(lastCrisisDate, firstCrisisDate);
    const intervalsCount = pastCrisisDates.length - 1;
    averageIntervalDays = +(totalSpan / intervalsCount).toFixed(1);
  } else if (diffFromLastCrisis > 0) {
    averageIntervalDays = diffFromLastCrisis;
  }

  // 5. Total de dias monitorados e taxa de dias sem crise
  const firstDate = parseISO(pastCrisisDates[0]);
  const totalMonitoredDays = Math.max(1, differenceInCalendarDays(today, firstDate) + 1);
  const totalFreeDays = Math.max(0, totalMonitoredDays - pastCrisisDates.length);
  const freeDaysPercentage = Math.round((totalFreeDays / totalMonitoredDays) * 100);

  // Top 5 maiores sequências distintas
  const topStreaks = sortedStreaks.slice(0, 5);

  return {
    longestStreak,
    currentStreak,
    averageIntervalDays,
    totalMonitoredDays,
    totalFreeDays,
    freeDaysPercentage,
    topStreaks
  };
};
