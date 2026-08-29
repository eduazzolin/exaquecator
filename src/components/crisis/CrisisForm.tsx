import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MedicationTaken, ReliefLevel, CrisisType } from '../../types';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS, getIntensityColor } from '../../utils/constants';
import { formatDateFull } from '../../utils/dateUtils';
import { TagPicker } from '../common/TagPicker';
import { MiniDatePicker } from '../common/MiniDatePicker';
import { Plus, Minus, Pill, Save, Check, X, Clock, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

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
      if (existingCrisis.notes || (existingCrisis.triggers && existingCrisis.triggers.length > 0) || (existingCrisis.symptoms && existingCrisis.symptoms.length > 0) || existingCrisis.intensity !== null) {
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
    <div className="glass p-5 sm:p-6 space-y-5">
      
      {/* Top Header: Date, Time & Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div>
            <label className="form-label">
              Data Selecionada
            </label>
            <MiniDatePicker
              value={selectedDate}
              onChange={onDateChange}
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
              Hora de Início
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="px-2.5 py-1.5 h-[34px] rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--card-border-hover)] transition-colors"
              />
              {startTime && (
                <button
                  type="button"
                  onClick={() => setStartTime('')}
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  title="Limpar horário"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {existingCrisis ? (
            <>
              <span className="badge bg-emerald-500/10 text-[var(--color-above)] border border-emerald-500/20">
                <Check className="w-3 h-3" /> Dia Registrado
              </span>
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 text-[var(--color-below)] hover:bg-rose-500/20 transition-colors"
                title="Excluir registro deste dia"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleMarkPainFree}
              className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" /> Dia Livre de Dor
            </button>
          )}
        </div>
      </div>

      {/* Main Fast Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 1. TIPO DO EPISÓDIO */}
        <div className="space-y-1.5">
          <label className="form-label mb-0">
            Tipo do Episódio
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'presenca' as CrisisType, label: 'Presença', emoji: '🌫️', desc: 'Sensação / Pródromo' },
              { id: 'dor' as CrisisType, label: 'Dor', emoji: '💥', desc: 'Cefaleia / Enxaqueca' },
              { id: 'aura' as CrisisType, label: 'Aura', emoji: '✨', desc: 'Visual / Sensorial' }
            ].map(opt => {
              const isSelected = type === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleTypeClick(opt.id)}
                  className={`py-2.5 px-3 rounded-md border text-left transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] shadow-sm'
                      : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{opt.emoji}</span>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. MEDICAMENTOS TOMADOS (1-Tap Toggle) */}
        <div className="space-y-1.5">
          <label className="form-label mb-0 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            Remédios Tomados
          </label>

          <div className="flex flex-wrap gap-1.5">
            {medications.map(med => {
              const isSelected = medicationsTaken.some(m => m.name.toLowerCase() === med.name.toLowerCase());
              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => toggleMedication(med.name, med.dosage, med.id)}
                  className={`text-xs px-2.5 py-1.5 rounded-md border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] font-medium shadow-sm'
                      : 'bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>💊 {med.name}</span>
                  {med.dosage && <span className="text-[10px] opacity-75">({med.dosage})</span>}
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}

            {!isAddingCustomMed ? (
              <button
                type="button"
                onClick={() => setIsAddingCustomMed(true)}
                className="text-xs px-2.5 py-1.5 rounded-md border border-dashed border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Outro remédio</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 flex-wrap">
                <input
                  type="text"
                  placeholder="Nome do remédio"
                  value={customMedName}
                  onChange={e => setCustomMedName(e.target.value)}
                  autoFocus
                  className="input-field text-xs py-1 px-2 w-32 h-[30px]"
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
                  className="btn btn-primary text-xs py-1 px-2 h-[30px]"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomMed(false)}
                  className="p-1 text-[var(--text-muted)]"
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
                <div key={idx} className="p-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] flex items-center justify-between gap-2">
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">💊 {m.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{m.dosage || 'Dose padrão'}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--card-border)] px-1 rounded">
                      <button
                        type="button"
                        onClick={() => handleUpdateMedQuantity(idx, -1)}
                        className="w-4 h-4 rounded text-xs flex items-center justify-center hover:bg-[var(--bg-secondary)]"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-semibold w-3 text-center">{m.quantity || 1}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateMedQuantity(idx, 1)}
                        className="w-4 h-4 rounded text-xs flex items-center justify-center hover:bg-[var(--bg-secondary)]"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <select
                      value={m.relief || 'total'}
                      onChange={e => handleUpdateMedRelief(idx, e.target.value as ReliefLevel)}
                      className="text-[11px] py-1 px-1.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                    >
                      <option value="total">🌟 Total</option>
                      <option value="partial">⚖️ Parcial</option>
                      <option value="none">❌ Sem alívio</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveMed(idx)}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--color-below)]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. EXPANSOR: INTENSIDADE, SINTOMAS, GATILHOS E NOTAS */}
        <div className="border-t border-[var(--card-border)] pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 py-1"
          >
            <span>
              {showAdvanced
                ? 'Ocultar Intensidade, Sintomas, Gatilhos e Notas'
                : `+ Adicionar Intensidade${intensity !== null ? ` (${intensity}/10)` : ''}, Sintomas, Gatilhos e Notas`}
            </span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-3 animate-in">
              
              {/* Intensidade da Dor */}
              <div className="space-y-1.5 p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                <div className="flex items-center justify-between">
                  <label className="form-label mb-0">
                    Intensidade da Dor (1 a 10)
                  </label>
                  {intensity !== null ? (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${currentColor?.bg} ${currentColor?.text} ${currentColor?.border}`}>
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
                        className={`h-8 sm:h-9 rounded-md text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border border-[var(--color-primary)] shadow-sm scale-105'
                            : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)]'
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

              <div>
                <label className="form-label">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Notas adicionais sobre o episódio..."
                  className="input-field text-xs resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. BARRA DE SALVAR */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary text-xs py-2.5 px-5 shadow-sm font-semibold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Salvando...' : (existingCrisis ? 'Atualizar Registro' : 'Salvar Registro')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
