import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      className={`shimmer-pulse rounded-md ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export const TimelineSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in">
      {/* 1. Bloco Formulário de Registro Rápido */}
      <div className="glass p-5 sm:p-6 space-y-5">
        {/* Top bar: Mini Date Picker & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-5 w-36 sm:w-44" />
          </div>
          <Skeleton className="h-6 w-24 sm:w-28 rounded-full" />
        </div>

        {/* Tipo de Episódio */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-32 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="h-[74px] p-3 rounded-lg border border-[var(--card-border)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <div className="h-[74px] p-3 rounded-lg border border-[var(--card-border)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-3.5 w-12" />
            </div>
            <div className="h-[74px] p-3 rounded-lg border border-[var(--card-border)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-3.5 w-12" />
            </div>
            <div className="h-[74px] p-3 rounded-lg border border-[var(--card-border)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-3.5 w-14" />
            </div>
          </div>
        </div>

        {/* Remédios Rápidos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-36 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>

        {/* Observações / Descrição */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>

        {/* Detalhes Opcionais (Seção retrátil) */}
        <div className="pt-1">
          <Skeleton className="h-8 w-44 rounded-md" />
        </div>

        {/* Botão Salvar Registro */}
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>

      {/* 2. Bloco Calendário com Micro-KPIs */}
      <div className="glass p-5 sm:p-6 space-y-4">
        {/* Top bar: Mês, Setas de Navegação e Micro-KPIs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-36" />
            <div className="flex items-center gap-1 ml-2">
              <Skeleton className="w-7 h-7 rounded-md" />
              <Skeleton className="w-7 h-7 rounded-md" />
            </div>
          </div>

          {/* Micro-KPIs */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-28 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex justify-center py-1">
              <Skeleton className="h-3.5 w-7 rounded" />
            </div>
          ))}
        </div>

        {/* Grade de 35 células do calendário */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg border border-[var(--card-border)] bg-[var(--bg-secondary)] p-1.5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="h-3 w-4 rounded" />
                {i % 4 === 0 && <Skeleton className="h-2 w-2 rounded-full" />}
              </div>
              {i % 5 === 1 && (
                <div className="flex justify-center">
                  <Skeleton className="h-2.5 w-5 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legenda do Calendário */}
        <div className="flex items-center justify-center flex-wrap gap-4 pt-2 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* 3. Bloco Feed de Últimos Episódios */}
      <div className="glass p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-44 rounded" />
          </div>
          <Skeleton className="h-3 w-16 rounded" />
        </div>

        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-md border border-[var(--card-border)] bg-[var(--bg-secondary)] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32 sm:w-48 rounded" />
                  <Skeleton className="h-3 w-24 sm:w-36 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in">
      {/* 4 Cards de Métricas Principais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="w-4 h-4 rounded" />
            </div>
            <Skeleton className="h-7 w-16 rounded" />
            <Skeleton className="h-2.5 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Card Gráfico de Frequência */}
      <div className="glass p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <div className="h-56 w-full flex items-end justify-between gap-3 pt-4 px-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton
                className="w-full rounded-t-md"
                style={{ height: `${25 + (i * 15) % 65}%` }}
              />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid de 2 Cards: Sintomas e Gatilhos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass p-5 space-y-3">
          <Skeleton className="h-4 w-36 rounded" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-8 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-5 space-y-3">
          <Skeleton className="h-4 w-36 rounded" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-8 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MedicationSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in">
      <div className="glass p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg-secondary)] space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
                <Skeleton className="w-5 h-5 rounded-full" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <div className="flex gap-1.5">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
