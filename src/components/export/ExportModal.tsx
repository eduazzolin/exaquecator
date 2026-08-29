import React, { useState } from 'react';
import { CrisisRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { generateMedicalReportPDF } from '../../services/pdfExportService';
import { exportToCSV, exportToJSON } from '../../services/exportService';
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  X, 
  Download, 
  Calendar
} from 'lucide-react';
import { subMonths, format, parseISO } from 'date-fns';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  crises: CrisisRecord[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  crises
}) => {
  const { user } = useAuth();
  const [patientName, setPatientName] = useState(user?.displayName || 'Eduardo');
  const [dateRangeOption, setDateRangeOption] = useState<'all' | '30days' | '90days' | 'year'>('all');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  if (!isOpen) return null;

  // Filter crises by selected date range
  const getFilteredCrises = () => {
    if (dateRangeOption === 'all') return crises;
    
    const now = new Date();
    let minDate: Date;
    if (dateRangeOption === '30days') minDate = subMonths(now, 1);
    else if (dateRangeOption === '90days') minDate = subMonths(now, 3);
    else minDate = subMonths(now, 12);

    return crises.filter(c => {
      try {
        const d = parseISO(c.date);
        return d >= minDate;
      } catch {
        return true;
      }
    });
  };

  const filtered = getFilteredCrises();

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      generateMedicalReportPDF({
        patientName: patientName.trim() || 'Paciente',
        startDate: dateRangeOption !== 'all' ? format(subMonths(new Date(), dateRangeOption === '30days' ? 1 : dateRangeOption === '90days' ? 3 : 12), 'dd/MM/yyyy') : undefined,
        endDate: format(new Date(), 'dd/MM/yyyy'),
        crises: filtered
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filtered);
  };

  const handleExportJSON = () => {
    exportToJSON(filtered);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-violet-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Exportar & Relatórios
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Patient name & Date filters */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nome do Paciente no Laudo
              </label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Ex: Seu Nome"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:border-violet-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                Período
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'all', label: 'Todo Histórico' },
                  { id: '30days', label: '30 dias' },
                  { id: '90days', label: '3 meses' },
                  { id: 'year', label: '1 ano' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDateRangeOption(opt.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      dateRangeOption === opt.id
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-2.5">
            
            {/* Option 1: PDF Medical Report */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-violet-800/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Relatório Médico (PDF)</h4>
                  <p className="text-[11px] text-slate-400">Pronto para consultas com neurologista</p>
                </div>
              </div>

              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF || filtered.length === 0}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isExportingPDF ? 'Gerando...' : 'Baixar PDF'}
              </button>
            </div>

            {/* Option 2: CSV */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Planilha (CSV)</h4>
                  <p className="text-[11px] text-slate-400">Compatível com Excel e Google Planilhas</p>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                disabled={filtered.length === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50"
              >
                Baixar CSV
              </button>
            </div>

            {/* Option 3: JSON */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-sky-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Backup (JSON)</h4>
                  <p className="text-[11px] text-slate-400">Arquivo bruto de segurança</p>
                </div>
              </div>

              <button
                onClick={handleExportJSON}
                disabled={filtered.length === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50"
              >
                Baixar JSON
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
