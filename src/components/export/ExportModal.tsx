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
  Calendar,
  Camera
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
  const [includeImages, setIncludeImages] = useState(true);
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
  const totalImagesCount = filtered.reduce((acc, c) => acc + (c.images?.length || 0), 0);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await generateMedicalReportPDF({
        patientName: patientName.trim() || 'Paciente',
        startDate: dateRangeOption !== 'all' ? format(subMonths(new Date(), dateRangeOption === '30days' ? 1 : dateRangeOption === '90days' ? 3 : 12), 'dd/MM/yyyy') : undefined,
        endDate: format(new Date(), 'dd/MM/yyyy'),
        crises: filtered,
        includeImages: includeImages && totalImagesCount > 0
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-[var(--text-primary)] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-[var(--text-secondary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Exportar & Relatórios
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Patient name & Date filters */}
          <div className="space-y-3 p-3.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)]">
            <div>
              <label className="form-label">
                Nome do Paciente no Laudo
              </label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Ex: Seu Nome"
                className="input-field text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label mb-0 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-[var(--text-secondary)]" />
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
                    className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-all ${
                      dateRangeOption === opt.id
                        ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] shadow-sm'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)]'
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
            <div className="p-3.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Relatório Médico (PDF)</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">Pronto para consultas e laudos médicos</p>
                  </div>
                </div>

                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPDF || filtered.length === 0}
                  className="btn btn-primary text-xs py-1.5 px-3 disabled:opacity-40"
                >
                  {isExportingPDF ? 'Gerando...' : 'Baixar PDF'}
                </button>
              </div>

              {/* Pergunta de Inclusão de Imagens */}
              <div className="pt-2 border-t border-[var(--card-border)]">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={e => setIncludeImages(e.target.checked)}
                    disabled={totalImagesCount === 0}
                    className="rounded border-[var(--card-border)] text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Incluir fotos anexadas no relatório</span>
                    {totalImagesCount > 0 ? (
                      <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.2 rounded border border-violet-500/20">
                        {totalImagesCount} foto{totalImagesCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--text-muted)]">(nenhuma foto no período)</span>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Option 2: CSV */}
            <div className="p-3.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Planilha (CSV)</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Compatível com Excel e Planilhas</p>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                disabled={filtered.length === 0}
                className="btn btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                Baixar CSV
              </button>
            </div>

            {/* Option 3: JSON */}
            <div className="p-3.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-sky-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Backup (JSON)</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Arquivo de dados estruturados</p>
                </div>
              </div>

              <button
                onClick={handleExportJSON}
                disabled={filtered.length === 0}
                className="btn btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
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
