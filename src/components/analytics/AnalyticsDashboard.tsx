import React from 'react';
import { CrisisRecord } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';
import { 
  formatDayMonth, 
  calculateCrisisStreaks, 
  formatStreakPeriod 
} from '../../utils/dateUtils';
import { 
  Activity, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Pill, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Award
} from 'lucide-react';

interface AnalyticsDashboardProps {
  crises: CrisisRecord[];
  theme?: 'light' | 'dark';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ crises, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#a1a1aa' : '#71717a';
  const tooltipBg = isDark ? '#121215' : '#ffffff';
  const tooltipBorder = isDark ? '#27272a' : '#e4e4e7';
  const tooltipText = isDark ? '#fafafa' : '#09090b';

  if (crises.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[var(--card-border)] rounded-lg">
        <Activity className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Sem dados suficientes</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Adicione registros de dias com enxaqueca para visualizar as estatísticas.</p>
      </div>
    );
  }

  const totalCrises = crises.length;
  
  // Calculate avg intensity ignoring nulls
  const crisesWithIntensity = crises.filter(c => c.intensity !== null && c.intensity !== undefined);
  const avgIntensity = crisesWithIntensity.length > 0
    ? (crisesWithIntensity.reduce((acc, c) => acc + (c.intensity || 0), 0) / crisesWithIntensity.length).toFixed(1)
    : '-';

  // Triggers count
  const triggersMap: Record<string, number> = {};
  crises.forEach(c => {
    c.triggers?.forEach(t => { triggersMap[t] = (triggersMap[t] || 0) + 1; });
  });
  const triggersData = Object.entries(triggersMap)
    .map(([name, count]) => ({ name: name.split('/')[0].trim(), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Symptoms count
  const symptomsMap: Record<string, number> = {};
  crises.forEach(c => {
    c.symptoms?.forEach(s => { symptomsMap[s] = (symptomsMap[s] || 0) + 1; });
  });
  const symptomsData = Object.entries(symptomsMap)
    .map(([name, count]) => ({ name: name.split('(')[0].trim(), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Medication Efficacy
  const efficacyMap: Record<string, { total: number; partial: number; none: number }> = {};
  crises.forEach(c => {
    c.medicationsTaken?.forEach(m => {
      if (!efficacyMap[m.name]) {
        efficacyMap[m.name] = { total: 0, partial: 0, none: 0 };
      }
      if (m.relief === 'total') efficacyMap[m.name].total += 1;
      else if (m.relief === 'partial') efficacyMap[m.name].partial += 1;
      else if (m.relief === 'none') efficacyMap[m.name].none += 1;
    });
  });

  const medicationData = Object.entries(efficacyMap)
    .map(([name, stats]) => ({
      name,
      'Alívio Total': stats.total,
      'Alívio Parcial': stats.partial,
      'Sem Alívio': stats.none,
      totalCount: stats.total + stats.partial + stats.none
    }))
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 5);

  // Streak & Records Stats
  const streakStats = calculateCrisisStreaks(crises);
  const { 
    longestStreak, 
    currentStreak, 
    averageIntervalDays, 
    totalMonitoredDays, 
    totalFreeDays, 
    freeDaysPercentage, 
    topStreaks 
  } = streakStats;

  // Timeline evolution data (chronological) with fallback for null
  const timelineData = [...crises]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12)
    .map(c => ({
      date: formatDayMonth(c.date),
      intensidade: c.intensity !== null ? c.intensity : 0
    }));

  return (
    <div className="space-y-5">
      
      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass p-4 rounded-md">
          <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Total Registros</p>
          <p className="text-xl font-bold text-[var(--text-primary)] mt-1.5">{totalCrises} dias</p>
        </div>

        <div className="glass p-4 rounded-md">
          <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Média de Dor</p>
          <p className="text-xl font-bold text-[var(--color-below)] mt-1.5">
            {avgIntensity !== '-' ? `${avgIntensity} / 10` : '—'}
          </p>
        </div>

        <div className="glass p-4 rounded-md">
          <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Top Gatilho</p>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-2 truncate">
            {triggersData[0] ? `${triggersData[0].name} (${triggersData[0].count}x)` : '—'}
          </p>
        </div>

        <div className="glass p-4 rounded-md">
          <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Top Sintoma</p>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-2 truncate">
            {symptomsData[0] ? `${symptomsData[0].name} (${symptomsData[0].count}x)` : '—'}
          </p>
        </div>
      </div>

      {/* Recordes de Dias Sem Crises */}
      <div className="glass p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
              Recordes de Dias Sem Crises
            </h3>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Intervalos consecutivos sem episódios
          </span>
        </div>

        {/* 4 Cards de Destaque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Maior Recorde */}
          <div className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Maior Recorde
                </span>
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                {longestStreak ? `${longestStreak.days} dia${longestStreak.days === 1 ? '' : 's'}` : '—'}
              </p>
            </div>
            
            <div className="mt-3 pt-2.5 border-t border-[var(--card-border)]/60">
              <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate" title={longestStreak ? formatStreakPeriod(longestStreak) : ''}>
                {longestStreak ? formatStreakPeriod(longestStreak) : 'Sem intervalos'}
              </p>
              {longestStreak?.isCurrent && longestStreak.days > 0 && (
                <span className="inline-block mt-1 text-[10px] font-semibold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  🔥 Em andamento!
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Sequência Atual */}
          <div className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Sequência Atual
                </span>
                <Flame className={`w-4 h-4 shrink-0 ${currentStreak && currentStreak.days > 0 ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
              </div>
              <p className={`text-2xl font-bold mt-2 ${
                !currentStreak || currentStreak.days === 0
                  ? 'text-[var(--text-muted)]'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {currentStreak ? `${currentStreak.days} dia${currentStreak.days === 1 ? '' : 's'}` : '0 dias'}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--card-border)]/60">
              <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate" title={currentStreak ? formatStreakPeriod(currentStreak) : ''}>
                {currentStreak ? formatStreakPeriod(currentStreak) : 'Hoje'}
              </p>
              {currentStreak && longestStreak && currentStreak.days > 0 && currentStreak.days >= longestStreak.days ? (
                <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  🎉 Novo recorde pessoal!
                </span>
              ) : currentStreak && longestStreak && longestStreak.days > 0 && currentStreak.days > 0 ? (
                <span className="inline-block mt-1 text-[10px] text-[var(--text-muted)]">
                  {Math.round((currentStreak.days / longestStreak.days) * 100)}% do seu recorde
                </span>
              ) : null}
            </div>
          </div>

          {/* Card 3: Intervalo Médio */}
          <div className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Intervalo Médio
                </span>
                <Clock className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                {averageIntervalDays !== null ? `~${averageIntervalDays}d` : '—'}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--card-border)]/60">
              <p className="text-[11px] text-[var(--text-muted)]">
                Espaço médio entre crises
              </p>
            </div>
          </div>

          {/* Card 4: Taxa de Dias Livres */}
          <div className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Tempo sem Dor
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {freeDaysPercentage}%
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--card-border)]/60">
              <p className="text-[11px] text-[var(--text-muted)]">
                {totalFreeDays} de {totalMonitoredDays} dias monitorados
              </p>
            </div>
          </div>
        </div>

        {/* Ranking dos Maiores Períodos Sem Crises */}
        {topStreaks.length > 0 ? (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Ranking dos Maiores Períodos Livres
            </h4>
            <div className="space-y-1.5">
              {topStreaks.map((streak, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                return (
                  <div
                    key={`${streak.startDate}-${streak.endDate}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-md bg-[var(--bg-secondary)] hover:bg-[var(--card-border)]/40 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm font-semibold shrink-0 w-6 text-center">{medal}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">
                          {formatStreakPeriod(streak)}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {streak.isCurrent ? 'Sequência em andamento' : 'Intervalo histórico'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {streak.isCurrent && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Atual 🔥
                        </span>
                      )}
                      <span className="font-bold text-[var(--text-primary)] bg-[var(--card-bg)] border border-[var(--card-border)] px-2 py-0.5 rounded">
                        {streak.days} dia{streak.days === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Continue registrando suas crises para desbloquear o ranking de maiores intervalos sem dor.
            </p>
          </div>
        )}
      </div>

      {/* Pain Evolution Chart */}
      <div className="glass p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--text-secondary)]" />
            Evolução da Dor nos Últimos Episódios
          </h3>
          <span className="text-[11px] text-[var(--text-muted)]">Escala de 1 a 10</span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? '#fafafa' : '#18181b'} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={isDark ? '#fafafa' : '#18181b'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke={textColor} fontSize={11} tickLine={false} />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke={textColor} fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px', fontSize: '11px', color: tooltipText }}
                labelStyle={{ color: tooltipText, fontWeight: 'bold' }}
                itemStyle={{ color: tooltipText }}
              />
              <Area
                type="monotone"
                dataKey="intensidade"
                stroke={isDark ? '#fafafa' : '#18181b'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#painGradient)"
                name="Intensidade"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Triggers and Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="glass p-4 sm:p-5 space-y-3">
          <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Gatilhos Mais Frequentes
          </h3>
          <div className="h-44 w-full">
            {triggersData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={triggersData} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                  <XAxis type="number" stroke={textColor} fontSize={10} allowDecimals={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke={textColor} fontSize={10} width={90} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px', fontSize: '11px', color: tooltipText }}
                  />
                  <Bar dataKey="count" fill="#d97706" radius={[0, 3, 3, 0]} name="Dias" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center pt-16">Sem dados</p>
            )}
          </div>
        </div>

        <div className="glass p-4 sm:p-5 space-y-3">
          <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[var(--text-secondary)]" />
            Sintomas Mais Comuns
          </h3>
          <div className="h-44 w-full">
            {symptomsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomsData} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                  <XAxis type="number" stroke={textColor} fontSize={10} allowDecimals={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke={textColor} fontSize={10} width={90} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px', fontSize: '11px', color: tooltipText }}
                  />
                  <Bar dataKey="count" fill={isDark ? '#e4e4e7' : '#27272a'} radius={[0, 3, 3, 0]} name="Ocorrências" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center pt-16">Sem dados</p>
            )}
          </div>
        </div>
      </div>

      {/* Medication Efficacy */}
      {medicationData.length > 0 && (
        <div className="glass p-4 sm:p-5 space-y-3">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-[var(--text-secondary)]" />
            Eficácia dos Medicamentos
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={medicationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} />
                <YAxis stroke={textColor} fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px', fontSize: '11px', color: tooltipText }}
                />
                <Bar dataKey="Alívio Total" stackId="a" fill="#10b981" />
                <Bar dataKey="Alívio Parcial" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Sem Alívio" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};
