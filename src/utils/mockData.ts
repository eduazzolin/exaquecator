import { CrisisRecord } from '../types';
import { subDays, format } from 'date-fns';

export const generateMockCrises = (): CrisisRecord[] => {
  const now = new Date();

  return [
    {
      id: 'mock-crisis-1',
      date: format(now, 'yyyy-MM-dd'),
      intensity: 7,
      symptoms: ['Fotofobia', 'Náusea', 'Aura visual'],
      triggers: ['Estresse', 'Noite mal dormida'],
      medicationsTaken: [
        {
          name: 'Sumatriptana',
          dosage: '50mg',
          relief: 'partial'
        }
      ],
      notes: 'Pontos brilhantes na visão periférica durante a tarde.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'mock-crisis-2',
      date: format(subDays(now, 3), 'yyyy-MM-dd'),
      intensity: 8,
      symptoms: ['Fotofobia', 'Fonofobia', 'Náusea'],
      triggers: ['Café em excesso', 'Jejum prolongado'],
      medicationsTaken: [
        {
          name: 'Sumatriptana',
          dosage: '50mg',
          relief: 'total'
        },
        {
          name: 'Dipirona',
          dosage: '1g',
          relief: 'total'
        }
      ],
      notes: 'Manhã sem café da manhã.',
      createdAt: subDays(now, 3).toISOString(),
      updatedAt: subDays(now, 3).toISOString()
    },
    {
      id: 'mock-crisis-3',
      date: format(subDays(now, 7), 'yyyy-MM-dd'),
      intensity: null, // Testando null
      symptoms: ['Rigidez no pescoço', 'Fadiga'],
      triggers: ['Tensão muscular / Postura', 'Telas em excesso'],
      medicationsTaken: [
        {
          name: 'Dipirona',
          dosage: '1g',
          relief: 'total'
        }
      ],
      notes: 'Muitas horas em frente ao computador.',
      createdAt: subDays(now, 7).toISOString(),
      updatedAt: subDays(now, 7).toISOString()
    },
    {
      id: 'mock-crisis-4',
      date: format(subDays(now, 12), 'yyyy-MM-dd'),
      intensity: 9,
      symptoms: ['Fotofobia', 'Fonofobia', 'Náusea'],
      triggers: ['Vinho tinto', 'Pouco sono'],
      medicationsTaken: [
        {
          name: 'Zolmitriptana',
          dosage: '2.5mg',
          relief: 'partial'
        }
      ],
      createdAt: subDays(now, 12).toISOString(),
      updatedAt: subDays(now, 12).toISOString()
    },
    {
      id: 'mock-crisis-5',
      date: format(subDays(now, 18), 'yyyy-MM-dd'),
      intensity: 6,
      symptoms: ['Fotofobia', 'Visão turva'],
      triggers: ['Mudança de clima'],
      medicationsTaken: [
        {
          name: 'Ibuprofeno',
          dosage: '600mg',
          relief: 'partial'
        }
      ],
      createdAt: subDays(now, 18).toISOString(),
      updatedAt: subDays(now, 18).toISOString()
    }
  ];
};
