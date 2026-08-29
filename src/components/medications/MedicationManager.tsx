import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Medication, MedicationCategory } from '../../types';
import { Pill, Plus, Star, Edit2, Trash2, X, Sparkles } from 'lucide-react';

export const MedicationManager: React.FC = () => {
  const { 
    medications, 
    addMedication, 
    updateMedication, 
    deleteMedication, 
    toggleMedicationFavorite 
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [category, setCategory] = useState<MedicationCategory>('abortive');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(true);

  const openNewModal = () => {
    setEditingMed(null);
    setName('');
    setDosage('');
    setCategory('abortive');
    setNotes('');
    setIsFavorite(true);
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setCategory(med.category);
    setNotes(med.notes || '');
    setIsFavorite(Boolean(med.isFavorite));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMed) {
      await updateMedication({
        ...editingMed,
        name: name.trim(),
        dosage: dosage.trim(),
        category,
        notes: notes.trim(),
        isFavorite
      });
    } else {
      await addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        category,
        notes: notes.trim(),
        isFavorite
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este medicamento do catálogo?')) {
      deleteMedication(id);
    }
  };

  const getCategoryLabel = (cat: MedicationCategory) => {
    switch (cat) {
      case 'abortive': return { label: 'Abortivo / SOS (Triptanos/Específicos)', color: 'text-violet-400 bg-violet-950/40 border-violet-800/40' };
      case 'painkiller': return { label: 'Analgésico / Anti-inflamatório', color: 'text-blue-400 bg-blue-950/40 border-blue-800/40' };
      case 'preventive': return { label: 'Uso Contínuo / Preventivo', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' };
      case 'other': return { label: 'Outro', color: 'text-slate-400 bg-slate-900 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 to-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-violet-400" />
            Catálogo de Medicamentos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cadastre seus remédios frequentes para adicioná-los com 1 toque durante as crises
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-violet-950/50 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Medicamento
        </button>
      </div>

      {/* Grid of Medications */}
      {medications.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
          <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">Nenhum remédio cadastrado</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Adicione os remédios que você costuma tomar para alívio rápido.</p>
          <button
            onClick={openNewModal}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
          >
            Cadastrar Primeiro Medicamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map(med => {
            const catInfo = getCategoryLabel(med.category);
            return (
              <div
                key={med.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-base text-white">{med.name}</h3>
                      <span className="text-xs font-medium text-slate-400">{med.dosage || 'Sem dose padrão'}</span>
                    </div>

                    <button
                      onClick={() => toggleMedicationFavorite(med.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        med.isFavorite
                          ? 'text-amber-400 bg-amber-950/40 hover:bg-amber-900/50'
                          : 'text-slate-600 hover:text-slate-300'
                      }`}
                      title={med.isFavorite ? 'Remover dos favoritos' : 'Favoritar para acesso rápido'}
                    >
                      <Star className={`w-4 h-4 ${med.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md border mb-2 ${catInfo.color}`}>
                    {catInfo.label}
                  </span>

                  {med.notes && (
                    <p className="text-xs text-slate-400 italic line-clamp-2 mt-1">
                      {med.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
                  {med.isFavorite ? (
                    <span className="text-[11px] text-amber-400/90 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3 h-3" /> Acesso Rápido Ativo
                    </span>
                  ) : <span />}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(med)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 animate-in fade-in">
            
            <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-violet-400" />
                {editingMed ? 'Editar Medicamento' : 'Novo Medicamento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Nome do Remédio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sumatriptana, Naratriptana, Dipirona"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Dosagem Padrão
                </label>
                <input
                  type="text"
                  placeholder="Ex: 50mg, 1g, 2.5mg, 1 comprimido"
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as MedicationCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-violet-500 outline-none"
                >
                  <option value="abortive">Abortivo / SOS (Triptanos/Específicos para Crise)</option>
                  <option value="painkiller">Analgésico / Anti-inflamatório Comum</option>
                  <option value="preventive">Uso Contínuo / Preventivo Diário</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Instruções / Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tomar no máximo 2 ao dia; tomar junto com alimentação"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-violet-500 outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={e => setIsFavorite(e.target.checked)}
                  className="rounded border-slate-700 text-violet-600 focus:ring-violet-500 bg-slate-950"
                />
                <div className="text-xs">
                  <p className="font-semibold text-white">Adicionar aos Favoritos (Acesso Rápido)</p>
                  <p className="text-slate-400">Aparecerá com 1 toque no Modo Emergência durante a dor</p>
                </div>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-950"
                >
                  {editingMed ? 'Atualizar Medicamento' : 'Salvar Medicamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
