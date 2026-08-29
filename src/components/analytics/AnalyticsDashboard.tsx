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
import { Activity, Sparkles, TrendingUp, AlertTriangle, Pill } from 'lucide-react';

interface AnalyticsDashboardProps {
  crises: CrisisRecord[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ crises }) => {
  if (crises.length === 0) {
    return (
      <div className="p-10 text-center border border-dashed border-slate-800 rounded-2xl">
        <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-300">Sem dados suficientes</h3>
        <p className="text-xs text-slate-500 mt-0.5">Adicione registros de dias com enxaqueca para visualizar as estatísticas.</p>
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
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Total de Dias com Dor</p>
          <p className="text-xl font-bold text-white mt-1">{totalCrises} dias</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Média de Intensidade</p>
          <p className="text-xl font-bold text-rose-400 mt-1">
            {avgIntensity !== '-' ? `${avgIntensity} / 10` : 'Não informada'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Principal Gatilho</p>
          <p className="text-sm font-bold text-amber-400 mt-1 truncate">
            {triggersData[0] ? `${triggersData[0].name} (${triggersData[0].count}x)` : '-'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Sintoma Mais Comum</p>
          <p className="text-sm font-bold text-violet-400 mt-1 truncate">
            {symptomsData[0] ? `${symptomsData[0].name} (${symptomsData[0].count}x)` : '-'}
          </p>
        </div>
      </div>

      {/* Pain Evolution */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          Evolução da Dor nos Últimos Episódios
        </h3>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1f2333', borderRadius: '10px', fontSize: '11px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                itemStyle={{ color: '#a78bfa' }}
              />
              <Area
                type="monotone"
                dataKey="intensidade"
                stroke="#8b5cf6"
                strokeWidth={2.5}
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
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Gatilhos Mais Frequentes
          </h3>
          <div className="h-44 w-full">
            {triggersData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={triggersData} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={10} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1f2333', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Dias" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500 text-center pt-16">Sem dados</p>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-400" />
            Sintomas Mais Comuns
          </h3>
          <div className="h-44 w-full">
            {symptomsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomsData} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={10} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1f2333', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Ocorrências" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500 text-center pt-16">Sem dados</p>
            )}
          </div>
        </div>
      </div>

      {/* Medication Efficacy */}
      {medicationData.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-violet-400" />
            Eficácia dos Medicamentos
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={medicationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1f2333', borderRadius: '10px', fontSize: '11px' }}
                />
                <Bar dataKey="Alívio Total" stackId="a" fill="#10b981" />
                <Bar dataKey="Alívio Parcial" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Sem Alívio" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};
