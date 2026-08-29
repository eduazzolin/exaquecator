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
import { formatDayMonth } from '../../utils/dateUtils';
import { Activity, Sparkles, TrendingUp, AlertTriangle, Pill, CloudRain, Moon } from 'lucide-react';

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

  // Environmental & Barometric calculations
  const crisesWithWeather = crises.filter(c => c.weather);
  const fallingPressureCrises = crisesWithWeather.filter(c => 
    c.weather?.pressureStatus === 'falling' || (c.weather?.pressureVariation24h !== undefined && c.weather.pressureVariation24h <= -2.5)
  );
  const fallingPressurePct = crisesWithWeather.length > 0
    ? Math.round((fallingPressureCrises.length / crisesWithWeather.length) * 100)
    : null;

  const avgTemp = crisesWithWeather.length > 0
    ? (crisesWithWeather.reduce((acc, c) => acc + (c.weather?.temperature || 0), 0) / crisesWithWeather.length).toFixed(0)
    : null;

  // Weather conditions breakdown
  const weatherMap: Record<string, { count: number; icon: string }> = {};
  crisesWithWeather.forEach(c => {
    const desc = c.weather?.weatherDescription || 'Outro';
    const icon = c.weather?.weatherIcon || '⛅';
    if (!weatherMap[desc]) weatherMap[desc] = { count: 0, icon };
    weatherMap[desc].count += 1;
  });
  const weatherData = Object.entries(weatherMap)
    .map(([name, data]) => ({ name: `${data.icon} ${name}`, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Circadian distribution (Time of Day)
  const timeOfDayMap: Record<string, number> = {
    'Manhã (06-12h)': 0,
    'Tarde (12-18h)': 0,
    'Noite (18-00h)': 0,
    'Madrugada (00-06h)': 0
  };
  crises.forEach(c => {
    const tod = c.timeOfDay || (c.startTime ? (
      parseInt(c.startTime.split(':')[0], 10) < 6 ? 'madrugada' :
      parseInt(c.startTime.split(':')[0], 10) < 12 ? 'manha' :
      parseInt(c.startTime.split(':')[0], 10) < 18 ? 'tarde' : 'noite'
    ) : null);

    if (tod === 'manha') timeOfDayMap['Manhã (06-12h)'] += 1;
    else if (tod === 'tarde') timeOfDayMap['Tarde (12-18h)'] += 1;
    else if (tod === 'noite') timeOfDayMap['Noite (18-00h)'] += 1;
    else if (tod === 'madrugada') timeOfDayMap['Madrugada (00-06h)'] += 1;
  });
  const circadianData = Object.entries(timeOfDayMap)
    .map(([period, count]) => ({ period, count }))
    .filter(item => item.count > 0);

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

      {/* Environmental & Circadian Pattern Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        
        {/* Padrão Circadiano (Horário das Crises) */}
        <div className="glass p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-400" />
              Padrão Circadiano (Período)
            </h3>
            <span className="text-[10px] text-[var(--text-muted)]">Horário de início</span>
          </div>

          <div className="h-44 w-full">
            {circadianData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={circadianData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="period" stroke={textColor} fontSize={10} tickLine={false} />
                  <YAxis stroke={textColor} fontSize={10} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px', fontSize: '11px', color: tooltipText }}
                  />
                  <Bar dataKey="count" fill="#818cf8" radius={[3, 3, 0, 0]} name="Crises" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center pt-16">Sem horários informados</p>
            )}
          </div>
        </div>

        {/* Gatilhos Ambientais & Clima Automático */}
        <div className="glass p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-sky-400" />
              Gatilhos Ambientais & Clima
            </h3>
            <span className="text-[10px] text-[var(--text-muted)]">Coleta automática</span>
          </div>

          {crisesWithWeather.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {/* Quick Environmental Highlights */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Queda de Pressão</p>
                  <p className="text-base font-bold text-rose-500 mt-0.5">
                    {fallingPressurePct !== null ? `${fallingPressurePct}%` : '—'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">das crises registradas</p>
                </div>

                <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Temp. Média</p>
                  <p className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                    {avgTemp !== null ? `${avgTemp}°C` : '—'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">no dia do episódio</p>
                </div>
              </div>

              {/* Weather Conditions List */}
              {weatherData.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-medium text-[var(--text-secondary)]">Condições climáticas mais frequentes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {weatherData.map((item, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)]">
                        {item.name} <strong className="text-[var(--text-muted)] font-normal">({item.count}x)</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] text-center pt-16">
              Os dados climáticos serão consolidados conforme novos registros forem salvos.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
