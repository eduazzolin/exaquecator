import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MedicationTaken, ReliefLevel, CrisisType } from '../../types';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS, getIntensityColor, PERIOD_OPTIONS } from '../../utils/constants';
import { formatDateFull } from '../../utils/dateUtils';
import { TagPicker } from '../common/TagPicker';
import { MiniDatePicker } from '../common/MiniDatePicker';
import { Plus, Minus, Pill, Save, Check, X, Trash2, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Pencil } from 'lucide-react';

interface CrisisFormProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const CrisisForm: React.FC<CrisisFormProps> = ({
  selectedDate,
  onDateChange
}) => {
  const { crises, addCrisis, updateCrisis, deleteCrisis, medications } = useData();

  // Find if there is an existing record for the selected date
  const existingCrisis = crises.find(c => c.date === selectedDate);

  const [startTime, setStartTime] = useState<string>('');
  const [type, setType] = useState<CrisisType | null>('presenca');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [medicationsTaken, setMedicationsTaken] = useState<MedicationTaken[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Custom med input state
  const [isAddingCustomMed, setIsAddingCustomMed] = useState(false);
  const [customMedName, setCustomMedName] = useState('');
  const [customMedDosage, setCustomMedDosage] = useState('');

  // Sync form whenever selectedDate or crises list changes
  useEffect(() => {
    if (existingCrisis) {
      setStartTime(existingCrisis.startTime || '');
      setType(existingCrisis.type ?? 'presenca');
      setIntensity(existingCrisis.intensity ?? null);
      setSymptoms(existingCrisis.symptoms || []);
      setTriggers(existingCrisis.triggers || []);
      setMedicationsTaken(existingCrisis.medicationsTaken || []);
      setNotes(existingCrisis.notes || '');
      if ((existingCrisis.triggers && existingCrisis.triggers.length > 0) || (existingCrisis.symptoms && existingCrisis.symptoms.length > 0) || existingCrisis.intensity !== null) {
        setShowAdvanced(true);
      }
    } else {
      setStartTime('');
      setType('presenca');
      setIntensity(null);
      setSymptoms([]);
      setTriggers([]);
      setMedicationsTaken([]);
      setNotes('');
      setShowAdvanced(false);
    }
  }, [selectedDate, existingCrisis]);

  const handleTypeClick = (selectedType: CrisisType) => {
    setType(type === selectedType ? null : selectedType);
  };

  const handleIntensityClick = (num: number) => {
    setIntensity(intensity === num ? null : num);
  };

  // Toggle medication from catalog buttons
  const toggleMedication = (name: string, defaultDosage: string, medId?: string) => {
    const existingIndex = medicationsTaken.findIndex(m => m.name.toLowerCase() === name.toLowerCase());
    if (existingIndex >= 0) {
      setMedicationsTaken(medicationsTaken.filter((_, i) => i !== existingIndex));
    } else {
      setMedicationsTaken([
        ...medicationsTaken,
        {
          medicationId: medId,
          name,
          dosage: defaultDosage,
          quantity: 1,
          relief: 'total'
        }
      ]);
    }
  };

  const handleUpdateMedRelief = (index: number, relief: ReliefLevel) => {
    const updated = [...medicationsTaken];
    updated[index] = { ...updated[index], relief };
    setMedicationsTaken(updated);
  };

  const handleUpdateMedQuantity = (index: number, delta: number) => {
    const updated = [...medicationsTaken];
    const currentQty = updated[index].quantity || 1;
    const newQty = Math.max(1, currentQty + delta);
    updated[index] = { ...updated[index], quantity: newQty };
    setMedicationsTaken(updated);
  };

  const handleRemoveMed = (index: number) => {
    setMedicationsTaken(medicationsTaken.filter((_, i) => i !== index));
  };

  const handleAddCustomMed = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (customMedName.trim()) {
      setMedicationsTaken([
        ...medicationsTaken,
        {
          name: customMedName.trim(),
          dosage: customMedDosage.trim(),
          quantity: 1,
          relief: 'total'
        }
      ]);
      setCustomMedName('');
      setCustomMedDosage('');
      setIsAddingCustomMed(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recordData = {
        date: selectedDate,
        startTime: startTime.trim() || undefined,
        type,
        intensity,
        symptoms,
        triggers,
        medicationsTaken,
        notes: notes.trim()
      };

      if (existingCrisis) {
        await updateCrisis({
          ...recordData,
          id: existingCrisis.id,
          userId: existingCrisis.userId,
          createdAt: existingCrisis.createdAt,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addCrisis(recordData);
      }
    } catch (err) {
      console.error('Error saving crisis:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingCrisis) return;
    if (window.confirm(`Deseja excluir o registro do dia ${formatDateFull(selectedDate)}?`)) {
      await deleteCrisis(existingCrisis.id);
    }
  };

  const handleMarkPainFree = async () => {
    if (existingCrisis) {
      if (window.confirm('Marcar este dia como "Sem Dor" (remover registro)?')) {
        await deleteCrisis(existingCrisis.id);
      }
    }
  };

  const currentColor = intensity !== null ? getIntensityColor(intensity) : null;

  return (
    <div
      className={`p-4 sm:p-6 space-y-5 rounded-2xl shadow-sm transition-all duration-200 border ${
        existingCrisis
          ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.07] border-amber-500/40 ring-1 ring-amber-500/25 shadow-md shadow-amber-500/5'
          : 'glass border-[var(--card-border)]'
      }`}
    >
      {/* Banner Exclusivo do Modo de Edição */}
      {existingCrisis && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium animate-in">
          <div className="flex items-center gap-2">
            <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span><strong>Modo de Edição:</strong> Você está alterando o registro existente deste dia.</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 shrink-0">
            Editando
          </span>
        </div>
      )}
      
      {/* 1. Barra Superior: Data, Período e Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Data */}
          <div>
            <MiniDatePicker
              value={selectedDate}
              onChange={onDateChange}
            />
          </div>

          {/* Segmented Control de Período */}
          <div className="flex items-center p-1 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-xs">
            {PERIOD_OPTIONS.map(opt => {
              const isSelected = startTime === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStartTime(isSelected ? '' : opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm font-semibold border border-[var(--card-border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status / Ação Rápida */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {existingCrisis ? (
            <span className="badge bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1">
              <Pencil className="w-3.5 h-3.5" /> Registro Existente
            </span>
          ) : (
            <button
              type="button"
              onClick={handleMarkPainFree}
              className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-xs px-2.5 py-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Dia Livre de Dor
            </button>
          )}
        </div>
      </div>

      {/* Formulário Principal Direto na Tela */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 2. TIPO DO EPISÓDIO COM IDENTIDADE CLÍNICA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">
              Tipo do Episódio
            </label>
            <span className="text-[11px] text-[var(--text-muted)]">Toque para selecionar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'presenca' as CrisisType,
                label: 'Presença',
                emoji: '🌀',
                desc: 'Sensação ou pródromo',
                selectedClasses: 'border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30',
                badgeClasses: 'bg-sky-500 text-white dark:text-slate-900',
                descClasses: 'text-sky-600/80 dark:text-sky-300/80'
              },
              {
                id: 'dor' as CrisisType,
                label: 'Dor',
                emoji: '💥',
                desc: 'Cefaleia ou enxaqueca',
                selectedClasses: 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30',
                badgeClasses: 'bg-rose-500 text-white dark:text-slate-900',
                descClasses: 'text-rose-600/80 dark:text-rose-300/80'
              },
              {
                id: 'aura' as CrisisType,
                label: 'Aura',
                emoji: '✨',
                desc: 'Visual ou sensorial',
                selectedClasses: 'border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/30',
                badgeClasses: 'bg-violet-500 text-white dark:text-slate-900',
                descClasses: 'text-violet-600/80 dark:text-violet-300/80'
              }
            ].map(opt => {
              const isSelected = type === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleTypeClick(opt.id)}
                  className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `${opt.selectedClasses} shadow-sm`
                      : 'bg-[var(--bg-secondary)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">{opt.emoji}</span>
                      <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">{opt.label}</span>
                    </div>
                    {isSelected ? (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${opt.badgeClasses}`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[var(--card-border)]" />
                    )}
                  </div>
                  <p className={`text-[11px] pl-6 sm:pl-7 ${isSelected ? opt.descClasses : 'text-[var(--text-muted)]'}`}>
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. MEDICAMENTOS TOMADOS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold tracking-wider text-[var(--text-secondary)] uppercase flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              Remédios Tomados
            </label>
            {medicationsTaken.length > 0 && (
              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                {medicationsTaken.length} {medicationsTaken.length === 1 ? 'medicamento' : 'medicamentos'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {medications.map(med => {
              const isSelected = medicationsTaken.some(m => m.name.toLowerCase() === med.name.toLowerCase());
              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => toggleMedication(med.name, med.dosage, med.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm'
                      : 'bg-[var(--bg-secondary)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)]'
                  }`}
                >
                  <span>💊 {med.name}</span>
                  {med.dosage && (
                    <span className={`text-[10px] ${isSelected ? 'text-indigo-600/80 dark:text-indigo-300/80' : 'text-[var(--text-muted)]'}`}>
                      ({med.dosage})
                    </span>
                  )}
                  {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}

            {!isAddingCustomMed ? (
              <button
                type="button"
                onClick={() => setIsAddingCustomMed(true)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)] transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Outro remédio</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--card-border)] flex-wrap">
                <input
                  type="text"
                  placeholder="Nome do remédio"
                  value={customMedName}
                  onChange={e => setCustomMedName(e.target.value)}
                  autoFocus
                  className="input-field text-xs py-1 px-2.5 w-32 h-[30px]"
                />
                <input
                  type="text"
                  placeholder="Dose"
                  value={customMedDosage}
                  onChange={e => setCustomMedDosage(e.target.value)}
                  className="input-field text-xs py-1 px-2 w-20 h-[30px]"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomMed()}
                  className="btn btn-primary text-xs py-1 px-2.5 h-[30px]"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomMed(false)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Doses & Alívio dos selecionados */}
          {medicationsTaken.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {medicationsTaken.map((m, idx) => (
                <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] flex items-center justify-between gap-2.5 shadow-sm">
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate flex items-center gap-1">
                      <span>💊</span> {m.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">{m.dosage || 'Dose padrão'}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--card-border)] px-1 py-0.5 rounded-lg shadow-inner">
                      <button
                        type="button"
                        onClick={() => handleUpdateMedQuantity(idx, -1)}
                        className="w-5 h-5 rounded text-xs flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        title="Diminuir"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-[var(--text-primary)]">{m.quantity || 1}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateMedQuantity(idx, 1)}
                        className="w-5 h-5 rounded text-xs flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        title="Aumentar"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <select
                      value={m.relief || 'total'}
                      onChange={e => handleUpdateMedRelief(idx, e.target.value as ReliefLevel)}
                      className="text-xs py-1 px-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none shadow-sm cursor-pointer"
                    >
                      <option value="total">🌟 Total</option>
                      <option value="partial">⚖️ Parcial</option>
                      <option value="none">❌ Sem alívio</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveMed(idx)}
                      className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--color-below)] hover:bg-rose-500/10 transition-colors"
                      title="Remover"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. DESCRIÇÃO / OBSERVAÇÕES (Visível na frente do formulário) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">
            Descrição / Observações
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notas adicionais, contexto ou observações sobre o episódio..."
            className="input-field text-xs resize-none rounded-xl"
          />
        </div>

        {/* 5. SEÇÃO RETRÁTIL: INTENSIDADE, SINTOMAS E GATILHOS */}
        <div className="border border-[var(--card-border)] rounded-xl bg-[var(--bg-secondary)]/40 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Intensidade, Sintomas e Gatilhos
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
                • Opcional
              </span>
              {intensity !== null && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                  Dor {intensity}/10
                </span>
              )}
              {symptoms.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  {symptoms.length} {symptoms.length === 1 ? 'sintoma' : 'sintomas'}
                </span>
              )}
              {triggers.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  {triggers.length} {triggers.length === 1 ? 'gatilho' : 'gatilhos'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span>{showAdvanced ? 'Recolher' : 'Expandir'}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showAdvanced && (
            <div className="p-4 pt-3 border-t border-[var(--card-border)] space-y-4 animate-in">
              {/* Intensidade da Dor */}
              <div className="space-y-2 p-3 sm:p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">
                    Intensidade da Dor (1 a 10)
                  </label>
                  {intensity !== null ? (
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentColor?.bg} ${currentColor?.text} ${currentColor?.border}`}>
                      {intensity}/10 • {currentColor?.label}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">Não informada</span>
                  )}
                </div>

                <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                    const isSelected = intensity === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleIntensityClick(num)}
                        className={`h-9 sm:h-10 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border border-[var(--color-primary)] shadow-md scale-105'
                            : 'bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)]'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              <TagPicker
                label="Sintomas"
                options={COMMON_SYMPTOMS}
                selected={symptoms}
                onChange={setSymptoms}
                placeholderCustom="Outro sintoma..."
              />

              <TagPicker
                label="Gatilhos"
                options={COMMON_TRIGGERS}
                selected={triggers}
                onChange={setTriggers}
                placeholderCustom="Outro gatilho..."
              />
            </div>
          )}
        </div>

        {/* 5. BARRA DE SALVAR */}
        <div className="pt-3 border-t border-[var(--card-border)] flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            {existingCrisis && (
              <span className="text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Alterando registro do dia <strong>{formatDateFull(selectedDate)}</strong></span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {existingCrisis && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/20 bg-rose-500/10 text-[var(--color-below)] hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`text-xs py-2 px-5 rounded-xl shadow-md font-semibold transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                existingCrisis
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/20'
                  : 'btn btn-primary'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Salvando...' : (existingCrisis ? 'Atualizar Registro' : 'Salvar Registro')}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
