import { Medication } from '../types';

export const COMMON_SYMPTOMS = [
  'Fotofobia (sensibilidade à luz)',
  'Fonofobia (sensibilidade ao som)',
  'Náusea / Enjoo',
  'Vômito',
  'Aura visual (pontos cegos / luzes)',
  'Tontura / Vertigem',
  'Visão turva',
  'Rigidez no pescoço / Trapézio',
  'Fadiga intensa / Sonolência',
  'Dificuldade de concentração',
  'Sensibilidade a odores (osmofobia)',
  'Palpitações'
];

export const COMMON_TRIGGERS = [
  'Estresse / Ansiedade',
  'Noite mal dormida / Insônia',
  'Dormir mais do que o habitual',
  'Jejum prolongado / Pular refeição',
  'Café / Cafeína em excesso',
  'Falta de café (abstinência)',
  'Chocolate',
  'Queijos curados / Embutidos',
  'Álcool / Vinho tinto',
  'Luz solar direta / Telas em excesso',
  'Mudança brusca de temperatura / Clima',
  'Tensão muscular / Postura',
  'Período menstrual / Hormonal',
  'Cheiro forte / Perfume',
  'Barulho excessivo'
];

export const PAIN_LOCATIONS = [
  'Têmpora Esquerda',
  'Têmpora Direita',
  'Ambas as Têmporas',
  'Frontal / Testa',
  'Atrás do Olho Esquerdo',
  'Atrás do Olho Direito',
  'Nuca / Base do Crânio',
  'Topo da Cabeça (Vértex)',
  'Pescoço / Ombros',
  'Toda a Cabeça (Holocraniana)'
];

export const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: 'default-1',
    name: 'Sumatriptana',
    dosage: '50mg',
    category: 'abortive',
    notes: 'Tomar no início da crise',
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-2',
    name: 'Zolmitriptana',
    dosage: '2.5mg',
    category: 'abortive',
    notes: 'Triptano de ação rápida',
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
    notes: 'Uso diário preventivo',
    isFavorite: false,
    createdAt: new Date().toISOString()
  }
];

export const INTENSITY_COLORS: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Mínima' },
  2: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', label: 'Leve' },
  3: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/40', label: 'Leve-Moderada' },
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
