import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MedicationTaken, ReliefLevel, CrisisType } from '../../types';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS, getIntensityColor } from '../../utils/constants';
import { formatDateFull } from '../../utils/dateUtils';
import { TagPicker } from '../common/TagPicker';
import { MiniDatePicker } from '../common/MiniDatePicker';
import { Plus, Minus, Pill, Save, Check, X } from 'lucide-react';

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
      setType(existingCrisis.type ?? null);
      setIntensity(existingCrisis.intensity ?? null);
      setSymptoms(existingCrisis.symptoms || []);
      setTriggers(existingCrisis.triggers || []);
      setMedicationsTaken(existingCrisis.medicationsTaken || []);
      setNotes(existingCrisis.notes || '');
    } else {
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
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
      
      {/* Top Header: Mini Calendar Picker & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Data do Registro
          </label>
          <div>
            <MiniDatePicker
              value={selectedDate}
              onChange={onDateChange}
            />
          </div>
        </div>

        <div>
          {existingCrisis ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5 self-start sm:self-auto">
              <Check className="w-3.5 h-3.5" /> Dia Registrado (Modo Edição)
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Nenhum registro salvo neste dia
            </span>
          )}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 1. TIPO (Presença, Dor, Aura) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tipo do Episódio
            </label>
            {type && (
              <button
                type="button"
                onClick={() => setType(null)}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                (Limpar)
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'presenca' as CrisisType, label: 'Presença', emoji: '🌫️', desc: 'Sensação / Pródromo' },
              { id: 'dor' as CrisisType, label: 'Dor', emoji: '💥', desc: 'Cefaleia / Enxaqueca' },
              { id: 'aura' as CrisisType, label: 'Aura', emoji: '✨', desc: 'Alteração visual / sensorial' }
            ].map(opt => {
              const isSelected = type === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleTypeClick(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-violet-600/30 border-violet-500 text-white shadow-md ring-2 ring-violet-500/50'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{opt.emoji}</span>
                    {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                  <div className="mt-1">
                    <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate hidden sm:block">
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
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Intensidade da Dor
            </label>
            {intensity !== null ? (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentColor?.bg} ${currentColor?.text} ${currentColor?.border}`}>
                  {intensity}/10 • {currentColor?.label}
                </span>
                <button
                  type="button"
                  onClick={() => setIntensity(null)}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  (Limpar)
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Não informada (Padrão)</span>
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
                  className={`h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-md scale-105 ring-2 ring-violet-500/50'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
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
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-violet-400" />
              Medicamentos Tomados
            </label>
            {medicationsTaken.length > 0 && (
              <span className="text-xs text-violet-400 font-medium">
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
                  className={`text-xs sm:text-sm px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-violet-600/30 border-violet-500 text-violet-200 font-semibold shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  <span>💊 {med.name}</span>
                  {med.dosage && (
                    <span className="text-[11px] opacity-80">({med.dosage})</span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
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
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-xl border bg-violet-600/30 border-violet-500 text-violet-200 font-semibold flex items-center gap-1.5"
                >
                  <span>💊 {customMed.name}</span>
                  {customMed.dosage && <span className="text-[11px]">({customMed.dosage})</span>}
                  <Check className="w-3.5 h-3.5 text-violet-400" />
                </button>
              ))}

            {/* Add Custom Button */}
            {!isAddingCustomMed ? (
              <button
                type="button"
                onClick={() => setIsAddingCustomMed(true)}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-violet-300 hover:border-violet-500/50 hover:bg-violet-950/20 transition-all flex items-center gap-1"
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
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-violet-500 text-xs text-white outline-none w-36"
                />
                <input
                  type="text"
                  placeholder="Dose (ex: 50mg)"
                  value={customMedDosage}
                  onChange={e => setCustomMedDosage(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none w-24"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomMed()}
                  className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-xs font-bold"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAddingCustomMed(false); setCustomMedName(''); setCustomMedDosage(''); }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Detailed Selected Meds List with Quantity & Relief */}
          {medicationsTaken.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">
                Quantidade e eficácia dos remédios tomados:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {medicationsTaken.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        💊 {m.name} {m.dosage ? `(${m.dosage})` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(idx)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                        title="Remover"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-1.5 py-1 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-medium mr-1">Qtd:</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateMedQuantity(idx, -1)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">
                          {m.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateMedQuantity(idx, 1)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Relief Selector */}
                      <select
                        value={m.relief || 'total'}
                        onChange={e => handleUpdateMedRelief(idx, e.target.value as ReliefLevel)}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none flex-1"
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
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Observações (Opcional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anotações do dia..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {existingCrisis ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl border border-rose-800/60 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold transition-colors"
            >
              Excluir Registro
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-950/50 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            {isSubmitting ? 'Salvando...' : (existingCrisis ? 'Atualizar Registro' : 'Salvar Registro do Dia')}
          </button>
        </div>

      </form>

    </div>
  );
};
