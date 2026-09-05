import { CrisisRecord } from '../types';
import { formatDateShort } from '../utils/dateUtils';
import { getPeriodLabel } from '../utils/constants';

export const exportToCSV = (crises: CrisisRecord[]) => {
  const headers = [
    'ID',
    'Data',
    'Período',
    'Tipo',
    'Intensidade (1-10)',
    'Local da Dor',
    'Medicamentos',
    'Sintomas',
    'Gatilhos',
    'Anotações'
  ];

  const rows = crises.map(c => {
    const meds = (c.medicationsTaken || []).map(m => {
      const qty = (m.quantity && m.quantity > 1) ? `${m.quantity}x ` : '';
      return `${qty}${m.name} ${m.dosage || ''} (${m.relief || 'sem info'})`;
    }).join('; ');
    
    return [
      c.id,
      `"${formatDateShort(c.date)}"`,
      `"${getPeriodLabel(c.startTime)}"`,
      `"${c.type || 'N/I'}"`,
      c.intensity !== null && c.intensity !== undefined ? c.intensity : '""',
      `"${c.painLocation || ''}"`,
      `"${meds}"`,
      `"${(c.symptoms || []).join(', ')}"`,
      `"${(c.triggers || []).join(', ')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `enxaquecator-dados-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (crises: CrisisRecord[]) => {
  const dataStr = JSON.stringify(crises, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `enxaquecator-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
