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
      case 'abortive': return { label: 'Abortivo / SOS (Triptanos)', color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20' };
      case 'painkiller': return { label: 'Analgésico / Anti-inflamatório', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'preventive': return { label: 'Uso Contínuo / Preventivo', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'other': return { label: 'Outro', color: 'text-[var(--text-muted)] bg-[var(--bg-secondary)] border-[var(--card-border)]' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Pill className="w-5 h-5 text-[var(--text-secondary)]" />
            Catálogo de Medicamentos
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Cadastre seus remédios frequentes para adicioná-los com 1 toque durante os episódios.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="btn btn-primary text-xs self-start sm:self-auto py-2 px-3.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Medicamento</span>
        </button>
      </div>

      {/* Grid of Medications */}
      {medications.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[var(--card-border)] rounded-lg">
          <Pill className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-[var(--text-primary)] font-semibold text-sm">Nenhum remédio cadastrado</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">Adicione os remédios que você costuma tomar para alívio rápido.</p>
          <button
            onClick={openNewModal}
            className="btn btn-primary text-xs"
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
                className="glass glass-hover p-4 sm:p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">{med.name}</h3>
                      <span className="text-xs font-medium text-[var(--text-muted)]">{med.dosage || 'Sem dose padrão'}</span>
                    </div>

                    <button
                      onClick={() => toggleMedicationFavorite(med.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        med.isFavorite
                          ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                      title={med.isFavorite ? 'Remover dos favoritos' : 'Favoritar para acesso rápido'}
                    >
                      <Star className={`w-4 h-4 ${med.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mb-2 ${catInfo.color}`}>
                    {catInfo.label}
                  </span>

                  {med.notes && (
                    <p className="text-xs text-[var(--text-secondary)] italic line-clamp-2 mt-1">
                      {med.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--card-border)] text-xs">
                  {med.isFavorite ? (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3 h-3" /> Acesso Rápido Ativo
                    </span>
                  ) : <span />}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(med)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--color-below)] hover:bg-[var(--bg-secondary)] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-[var(--text-primary)]">
            
            <div className="p-4 sm:p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)] flex items-center justify-between">
              <h3 className="font-semibold text-base text-[var(--text-primary)] flex items-center gap-2">
                <Pill className="w-4 h-4 text-[var(--text-secondary)]" />
                {editingMed ? 'Editar Medicamento' : 'Novo Medicamento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="form-label">
                  Nome do Remédio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sumatriptana, Naratriptana, Dipirona"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="form-label">
                  Dosagem Padrão
                </label>
                <input
                  type="text"
                  placeholder="Ex: 50mg, 1g, 2.5mg, 1 comprimido"
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="form-label">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as MedicationCategory)}
                  className="input-field text-xs"
                >
                  <option value="abortive">Abortivo / SOS (Triptanos/Específicos para Crise)</option>
                  <option value="painkiller">Analgésico / Anti-inflamatório Comum</option>
                  <option value="preventive">Uso Contínuo / Preventivo Diário</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Instruções / Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tomar no máximo 2 ao dia; tomar junto com alimentação"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input-field text-xs resize-none"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={e => setIsFavorite(e.target.checked)}
                  className="rounded border-[var(--card-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div className="text-xs">
                  <p className="font-semibold text-[var(--text-primary)]">Adicionar aos Favoritos</p>
                  <p className="text-[var(--text-muted)]">Aparecerá destacado na seleção do diário</p>
                </div>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--card-border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
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
