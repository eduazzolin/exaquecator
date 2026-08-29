import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MedicationTaken, ReliefLevel } from '../../types';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS, getIntensityColor } from '../../utils/constants';
import { formatDateFull, getTodayDateString } from '../../utils/dateUtils';
import { TagPicker } from '../common/TagPicker';
import { Plus, Trash2, Pill, Save, Calendar, Check } from 'lucide-react';

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

  const [intensity, setIntensity] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [medicationsTaken, setMedicationsTaken] = useState<MedicationTaken[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form whenever selectedDate or crises list changes
  useEffect(() => {
    if (existingCrisis) {
      setIntensity(existingCrisis.intensity ?? null);
      setSymptoms(existingCrisis.symptoms || []);
      setTriggers(existingCrisis.triggers || []);
      setMedicationsTaken(existingCrisis.medicationsTaken || []);
      setNotes(existingCrisis.notes || '');
    } else {
      // Default blank state (intensity is null by default)
      setIntensity(null);
      setSymptoms([]);
      setTriggers([]);
      setMedicationsTaken([]);
      setNotes('');
    }
  }, [selectedDate, existingCrisis]);

  const handleIntensityClick = (num: number) => {
    if (intensity === num) {
      setIntensity(null);
    } else {
      setIntensity(num);
    }
  };

  const handleAddMedication = (medId?: string) => {
    let name = '';
    let dosage = '';
    if (medId) {
      const found = medications.find(m => m.id === medId);
      if (found) {
        name = found.name;
        dosage = found.dosage;
      }
    }

    setMedicationsTaken([
      ...medicationsTaken,
      {
        medicationId: medId,
        name,
        dosage,
        relief: 'total'
      }
    ]);
  };

  const handleUpdateMed = (index: number, field: keyof MedicationTaken, value: any) => {
    const updated = [...medicationsTaken];
    updated[index] = { ...updated[index], [field]: value };
    setMedicationsTaken(updated);
  };

  const handleRemoveMed = (index: number) => {
    setMedicationsTaken(medicationsTaken.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recordData = {
        date: selectedDate,
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
  const isToday = selectedDate === getTodayDateString();

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
      
      {/* Top Header: Date Selector & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-violet-400 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={e => onDateChange(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs sm:text-sm font-bold text-white outline-none focus:border-violet-500 cursor-pointer"
              />
              {isToday && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/50">
                  Hoje
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDateFull(selectedDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {existingCrisis ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Dia Registrado (Modo Edição)
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Nenhum registro neste dia
            </span>
          )}
        </div>

      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Intensity Selector (1 to 10 or Null) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Intensidade da Dor (Opcional)
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
                      : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Medications Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-violet-400" />
              Medicamentos Tomados
            </label>

            {medications.length > 0 && (
              <select
                onChange={e => {
                  if (e.target.value) {
                    handleAddMedication(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="text-xs px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 outline-none cursor-pointer hover:border-violet-500"
              >
                <option value="" disabled>+ Adicionar do Catálogo</option>
                {medications.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.dosage})</option>
                ))}
              </select>
            )}
          </div>

          {medicationsTaken.length > 0 && (
            <div className="space-y-2">
              {medicationsTaken.map((med, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nome do remédio"
                      value={med.name}
                      onChange={e => handleUpdateMed(idx, 'name', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      placeholder="Dose (ex: 50mg)"
                      value={med.dosage}
                      onChange={e => handleUpdateMed(idx, 'dosage', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-violet-500"
                    />
                    <div className="flex items-center gap-1">
                      <select
                        value={med.relief || 'total'}
                        onChange={e => handleUpdateMed(idx, 'relief', e.target.value as ReliefLevel)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none"
                      >
                        <option value="total">Alívio Total</option>
                        <option value="partial">Alívio Parcial</option>
                        <option value="none">Sem Alívio</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleAddMedication()}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Medicamento
          </button>
        </div>

        {/* Symptoms & Triggers */}
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

        {/* Notes */}
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
