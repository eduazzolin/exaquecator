import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MedicationTaken, ReliefLevel, CrisisType } from '../../types';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS, getIntensityColor } from '../../utils/constants';
import { formatDateFull } from '../../utils/dateUtils';
import { TagPicker } from '../common/TagPicker';
import { MiniDatePicker } from '../common/MiniDatePicker';
import { Plus, Minus, Pill, Save, Check, X, Clock } from 'lucide-react';

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
  const [type, setType] = useState<CrisisType | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [medicationsTaken, setMedicationsTaken] = useState<MedicationTaken[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom med input state
  const [isAddingCustomMed, setIsAddingCustomMed] = useState(false);
  const [customMedName, setCustomMedName] = useState('');
  const [customMedDosage, setCustomMedDosage] = useState('');

  // Sync form whenever selectedDate or crises list changes
  useEffect(() => {
    if (existingCrisis) {
      setStartTime(existingCrisis.startTime || '');
      setType(existingCrisis.type ?? null);
      setIntensity(existingCrisis.intensity ?? null);
      setSymptoms(existingCrisis.symptoms || []);
      setTriggers(existingCrisis.triggers || []);
      setMedicationsTaken(existingCrisis.medicationsTaken || []);
      setNotes(existingCrisis.notes || '');
    } else {
      setStartTime('');
      setType(null);
      setIntensity(null);
      setSymptoms([]);
      setTriggers([]);
      setMedicationsTaken([]);
      setNotes('');
    }
  }, [selectedDate, existingCrisis]);

  const handleTypeClick = (selectedType: CrisisType) => {
    if (type === selectedType) {
      setType(null);
    } else {
      setType(selectedType);
    }
  };

  const handleIntensityClick = (num: number) => {
    if (intensity === num) {
      setIntensity(null);
    } else {
      setIntensity(num);
    }
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

  const currentColor = intensity !== null ? getIntensityColor(intensity) : null;

  return (
    <div className="glass p-4 sm:p-6 space-y-5">
      
      {/* Top Header: Mini Calendar Picker, Start Time & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div>
            <label className="form-label">
              Data do Registro
            </label>
            <MiniDatePicker
              value={selectedDate}
              onChange={onDateChange}
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
              Hora de Início <span className="text-[var(--text-muted)] font-normal lowercase">(opcional)</span>
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

        <div>
          {existingCrisis ? (
            <span className="badge bg-[rgba(16,185,129,0.1)] text-[var(--color-above)] border border-[rgba(16,185,129,0.2)]">
              <Check className="w-3 h-3" /> Dia Registrado (Edição)
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">
              Nenhum registro salvo neste dia
            </span>
          )}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 1. TIPO (Presença, Dor, Aura) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="form-label mb-0">
              Tipo do Episódio
            </label>
            {type && (
              <button
                type="button"
                onClick={() => setType(null)}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                (Limpar)
              </button>
            )}
          </div>

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
                  className={`p-3 rounded-md border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] shadow-sm'
                      : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{opt.emoji}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="mt-1.5">
                    <p className="text-xs font-semibold">
                      {opt.label}
                    </p>
                    <p className={`text-[10px] truncate hidden sm:block ${isSelected ? 'opacity-80' : 'text-[var(--text-muted)]'}`}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. INTENSIDADE (1 to 10 or Null) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="form-label mb-0">
              Intensidade da Dor
            </label>
            {intensity !== null ? (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${currentColor?.bg} ${currentColor?.text} ${currentColor?.border}`}>
                  {intensity}/10 • {currentColor?.label}
                </span>
                <button
                  type="button"
                  onClick={() => setIntensity(null)}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  (Limpar)
                </button>
              </div>
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
                      ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border border-[var(--color-primary)] shadow-sm'
                      : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. MEDICAMENTOS (Com Seletor de Quantidade) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="form-label mb-0 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              Medicamentos Tomados
            </label>
            {medicationsTaken.length > 0 && (
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                {medicationsTaken.length} selecionado{medicationsTaken.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Catalog Medication Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {medications.map(med => {
              const isSelected = medicationsTaken.some(m => m.name.toLowerCase() === med.name.toLowerCase());
              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => toggleMedication(med.name, med.dosage, med.id)}
                  className={`text-xs sm:text-sm px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] font-medium shadow-sm'
                      : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <span>💊 {med.name}</span>
                  {med.dosage && (
                    <span className="text-[11px] opacity-75">({med.dosage})</span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}

            {/* Custom Extra Meds */}
            {medicationsTaken
              .filter(m => !medications.some(cat => cat.name.toLowerCase() === m.name.toLowerCase()))
              .map((customMed, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleMedication(customMed.name, customMed.dosage)}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-md border bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <span>💊 {customMed.name}</span>
                  {customMed.dosage && <span className="text-[11px] opacity-75">({customMed.dosage})</span>}
                  <Check className="w-3.5 h-3.5" />
                </button>
              ))}

            {/* Add Custom Button */}
            {!isAddingCustomMed ? (
              <button
                type="button"
                onClick={() => setIsAddingCustomMed(true)}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-md border border-dashed border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Outro medicamento</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <input
                  type="text"
                  placeholder="Nome do remédio"
                  value={customMedName}
                  onChange={e => setCustomMedName(e.target.value)}
                  autoFocus
                  className="px-2.5 py-1 rounded-md bg-[var(--card-bg)] border border-[var(--card-border-hover)] text-xs text-[var(--text-primary)] outline-none w-36"
                />
                <input
                  type="text"
                  placeholder="Dose (ex: 50mg)"
                  value={customMedDosage}
                  onChange={e => setCustomMedDosage(e.target.value)}
                  className="px-2.5 py-1 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--text-primary)] outline-none w-24"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomMed()}
                  className="px-2.5 py-1 rounded-md bg-[var(--color-primary)] text-[var(--bg-primary)] text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAddingCustomMed(false); setCustomMedName(''); setCustomMedDosage(''); }}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Detailed Selected Meds List with Quantity & Relief */}
          {medicationsTaken.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Doses e eficácia:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {medicationsTaken.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="p-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        💊 {m.name} {m.dosage ? `(${m.dosage})` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(idx)}
                        className="text-[var(--text-muted)] hover:text-[var(--color-below)] p-0.5 transition-colors"
                        title="Remover"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-[var(--card-bg)] border border-[var(--card-border)] px-1.5 py-1 rounded-md">
                        <span className="text-[10px] text-[var(--text-muted)] font-medium mr-0.5">Qtd:</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateMedQuantity(idx, -1)}
                          className="w-5 h-5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--card-border)] text-[var(--text-primary)] flex items-center justify-center text-xs transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-[var(--text-primary)] w-4 text-center">
                          {m.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateMedQuantity(idx, 1)}
                          className="w-5 h-5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--card-border)] text-[var(--text-primary)] flex items-center justify-center text-xs transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Relief Selector */}
                      <select
                        value={m.relief || 'total'}
                        onChange={e => handleUpdateMedRelief(idx, e.target.value as ReliefLevel)}
                        className="px-2 py-1 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--text-primary)] outline-none flex-1"
                      >
                        <option value="total">🌟 Alívio Total</option>
                        <option value="partial">⚖️ Alívio Parcial</option>
                        <option value="none">❌ Sem Alívio</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. SINTOMAS & GATILHOS */}
        <div className="space-y-3 pt-1">
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

        {/* 5. OBSERVAÇÕES */}
        <div className="space-y-1">
          <label className="form-label mb-0">
            Observações (Opcional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anotações adicionais do dia..."
            className="input-field resize-none text-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {existingCrisis ? (
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-danger text-xs py-2 px-3"
            >
              Excluir Registro
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary text-xs py-2 px-4 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Salvando...' : (existingCrisis ? 'Atualizar Registro' : 'Salvar Registro do Dia')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
