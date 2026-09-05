import { Medication } from '../types';

export const APP_VERSION = '1.0.7';

export const COMMON_SYMPTOMS = [
  '☀️ Fotofobia (luz)',
  '🔊 Fonofobia (som)',
  '🤢 Náusea / Enjoo',
  '🤮 Vômito',
  '✨ Aura visual (luzes/pontos)',
  '💫 Tontura / Vertigem',
  '👁️ Visão turva',
  '💥 Dor latejante / Pulsátil',
  '🫨 Rigidez no pescoço',
  '🥱 Fadiga / Sonolência',
  '🧠 Dificuldade de concentração',
  '👃 Sensibilidade a odores'
];

export const COMMON_TRIGGERS = [
  '😰 Estresse / Ansiedade',
  '🥱 Pouco sono / Insônia',
  '😴 Dormir demais',
  '🍽️ Jejum / Pular refeição',
  '☕ Excesso de café',
  '🚫 Falta de café',
  '🍫 Chocolate',
  '🧀 Queijo / Embutidos',
  '🍷 Vinho / Álcool',
  '💻 Telas em excesso',
  '☀️ Sol forte / Calor',
  '🌦️ Mudança de tempo',
  '🧘 Má postura / Tensão',
  '🩸 Hormonal / Menstruação',
  '🌸 Perfume / Cheiro forte',
  '📢 Barulho excessivo'
];

export const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: 'default-1',
    name: 'Sumatriptana',
    dosage: '50mg',
    category: 'abortive',
    notes: 'Tomar no início da dor',
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-2',
    name: 'Zolmitriptana',
    dosage: '2.5mg',
    category: 'abortive',
    notes: 'Ação rápida',
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-3',
    name: 'Dipirona',
    dosage: '1g',
    category: 'painkiller',
    notes: 'Analgésico',
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-4',
    name: 'Ibuprofeno',
    dosage: '600mg',
    category: 'painkiller',
    notes: 'Anti-inflamatório',
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-5',
    name: 'Naproxeno',
    dosage: '500mg',
    category: 'painkiller',
    notes: 'Anti-inflamatório potente',
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-6',
    name: 'Topiramato',
    dosage: '25mg',
    category: 'preventive',
    notes: 'Uso contínuo',
    isFavorite: false,
    createdAt: new Date().toISOString()
  }
];

export const INTENSITY_COLORS: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Mínima' },
  2: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', label: 'Leve' },
  3: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/40', label: 'Leve' },
  4: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40', label: 'Moderada' },
  5: { bg: 'bg-yellow-500/25', text: 'text-yellow-400', border: 'border-yellow-500/50', label: 'Moderada' },
  6: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50', label: 'Moderada-Intensa' },
  7: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', label: 'Intensa' },
  8: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50', label: 'Muito Intensa' },
  9: { bg: 'bg-rose-500/30', text: 'text-rose-400', border: 'border-rose-500/60', label: 'Severa' },
  10: { bg: 'bg-red-600/30', text: 'text-red-400', border: 'border-red-600/70', label: 'Insuportável' }
};

export const getIntensityColor = (level: number) => {
  const rounded = Math.max(1, Math.min(10, Math.round(level)));
  return INTENSITY_COLORS[rounded] || INTENSITY_COLORS[5];
};

export const PERIOD_OPTIONS = [
  { id: 'manha', label: 'Manhã', icon: '🌅' },
  { id: 'tarde', label: 'Tarde', icon: '☀️' },
  { id: 'noite', label: 'Noite', icon: '🌙' },
] as const;

export const formatPeriod = (period?: string | null): string => {
  if (!period) return '';
  const match = PERIOD_OPTIONS.find(p => p.id === period.toLowerCase());
  if (match) return `${match.icon} ${match.label}`;
  return period;
};

export const getPeriodLabel = (period?: string | null): string => {
  if (!period) return '';
  const match = PERIOD_OPTIONS.find(p => p.id === period.toLowerCase());
  if (match) return match.label;
  return period;
};
