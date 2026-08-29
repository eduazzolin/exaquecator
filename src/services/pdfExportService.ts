import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CrisisRecord } from '../types';
import { formatDateShort } from '../utils/dateUtils';

interface GeneratePDFOptions {
  patientName?: string;
  startDate?: string;
  endDate?: string;
  crises: CrisisRecord[];
}

export const generateMedicalReportPDF = ({
  patientName = 'Paciente',
  startDate,
  endDate,
  crises
}: GeneratePDFOptions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const primaryColor: [number, number, number] = [109, 40, 217]; // violet-700
  const darkTextColor: [number, number, number] = [30, 41, 59]; // slate-800
  const lightTextColor: [number, number, number] = [100, 116, 139]; // slate-500

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ENXAQUECATOR - RELATÓRIO CLÍNICO DE ENXAQUECA', 14, 16);

  // 2. Patient & Date Info
  doc.setTextColor(...darkTextColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const generatedAt = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  let currentY = 34;
  doc.setFont('helvetica', 'bold');
  doc.text(`Paciente:`, 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${patientName}`, 35, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text(`Data de Emissão:`, pageWidth - 80, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${generatedAt}`, pageWidth - 45, currentY);

  currentY += 7;
  if (startDate || endDate) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Período analisado:`, 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${startDate || 'Início'} até ${endDate || 'Hoje'}`, 50, currentY);
    currentY += 7;
  }

  // 3. Clinical Summary KPI Box
  const totalDays = crises.length;
  const withIntensity = crises.filter(c => c.intensity !== null && c.intensity !== undefined);
  const avgIntensity = withIntensity.length > 0 
    ? (withIntensity.reduce((acc, c) => acc + (c.intensity || 0), 0) / withIntensity.length).toFixed(1)
    : '-';

  const totalMedsTaken = crises.reduce((acc, c) => {
    return acc + (c.medicationsTaken?.reduce((mAcc, m) => mAcc + (m.quantity || 1), 0) || 0);
  }, 0);

  currentY += 3;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 20, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(...lightTextColor);
  doc.text('DIAS REGISTRADOS', 25, currentY + 6);
  doc.text('INTENSIDADE MÉDIA (1-10)', 85, currentY + 6);
  doc.text('TOTAL DE DOSES / COMPRIMIDOS', 145, currentY + 6);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`${totalDays} dias`, 25, currentY + 15);
  doc.text(avgIntensity !== '-' ? `${avgIntensity} / 10` : 'N/I', 85, currentY + 15);
  doc.text(`${totalMedsTaken} doses`, 145, currentY + 15);

  currentY += 28;

  // 4. Detailed Table
  const typeMap: Record<string, string> = {
    presenca: 'Presença',
    dor: 'Dor',
    aura: 'Aura'
  };

  const tableData = crises.map(c => {
    const formattedDate = formatDateShort(c.date);
    const typeLabel = c.type ? typeMap[c.type] || c.type : '-';
    
    const meds = (c.medicationsTaken || []).map(m => {
      const reliefMap = { total: 'Alívio Total', partial: 'Alívio Parcial', none: 'Sem Alívio', unknown: '' };
      const reliefText = m.relief && reliefMap[m.relief] ? ` [${reliefMap[m.relief]}]` : '';
      const qtyText = (m.quantity && m.quantity > 1) ? `${m.quantity}x ` : '';
      return `${qtyText}${m.name} ${m.dosage || ''}${reliefText}`;
    }).join('\n') || '-';

    const info = [
      c.symptoms?.length ? `Sintomas: ${c.symptoms.join(', ')}` : '',
      c.triggers?.length ? `Gatilhos: ${c.triggers.join(', ')}` : '',
      c.notes ? `Obs: ${c.notes}` : ''
    ].filter(Boolean).join('\n') || '-';

    return [
      formattedDate,
      typeLabel,
      c.intensity !== null ? `${c.intensity}/10` : 'N/I',
      meds,
      info
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Data', 'Tipo', 'Intensidade', 'Medicamentos & Eficácia', 'Sintomas, Gatilhos e Observações']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkTextColor,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 45 },
      4: { cellWidth: 'auto' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  const filename = `relatorio-enxaqueca-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
