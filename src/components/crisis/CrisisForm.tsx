import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MedicationTaken, ReliefLevel, CrisisType, PainLocation } from '../../types';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS, getIntensityColor, PERIOD_OPTIONS } from '../../utils/constants';
import { formatDateFull } from '../../utils/dateUtils';
import { compressImageDetails } from '../../utils/imageUtils';
import { uploadOrStoreImage } from '../../services/imageStorageService';
import { TagPicker } from '../common/TagPicker';
import { MiniDatePicker } from '../common/MiniDatePicker';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { Plus, Minus, Pill, Save, Check, X, Trash2, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Pencil, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

interface CrisisFormProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const CrisisForm: React.FC<CrisisFormProps> = ({
  selectedDate,
  onDateChange
}) => {
  const { crises, addCrisis, updateCrisis, deleteCrisis, medications } = useData();
  const { user } = useAuth();

  // Find if there is an existing record for the selected date
  const existingCrisis = crises.find(c => c.date === selectedDate);

  const [startTime, setStartTime] = useState<string>('');
  const [type, setType] = useState<CrisisType | null>('presenca');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [painLocation, setPainLocation] = useState<PainLocation | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [medicationsTaken, setMedicationsTaken] = useState<MedicationTaken[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageBlobs, setImageBlobs] = useState<Map<string, Blob>>(new Map());
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Image upload and preview states
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [compressStatus, setCompressStatus] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
      setPainLocation(existingCrisis.painLocation ?? null);
      setSymptoms(existingCrisis.symptoms || []);
      setTriggers(existingCrisis.triggers || []);
      setMedicationsTaken(existingCrisis.medicationsTaken || []);
      setImages(existingCrisis.images || []);
      setNotes(existingCrisis.notes || '');
      if (
        (existingCrisis.triggers && existingCrisis.triggers.length > 0) ||
        (existingCrisis.symptoms && existingCrisis.symptoms.length > 0) ||
        existingCrisis.intensity !== null ||
        existingCrisis.painLocation
      ) {
        setShowAdvanced(true);
      }
    } else {
      setStartTime('');
      setType('presenca');
      setIntensity(null);
      setPainLocation(null);
      setSymptoms([]);
      setTriggers([]);
      setMedicationsTaken([]);
      setImages([]);
      setNotes('');
      setShowAdvanced(false);
    }
  }, [selectedDate, existingCrisis]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 3 - images.length;
    if (availableSlots <= 0) {
      alert('Você já atingiu o limite de 3 fotos para este registro.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    setIsCompressingImage(true);
    setCompressStatus(`Otimizando ${filesToProcess.length === 1 ? 'imagem' : `${filesToProcess.length} imagens`}...`);

    try {
      const newImages: string[] = [];
      const updatedBlobs = new Map(imageBlobs);

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        setCompressStatus(`Comprimindo imagem ${i + 1}/${filesToProcess.length}...`);
        const result = await compressImageDetails(file, 800, 0.70);
        newImages.push(result.base64);
        updatedBlobs.set(result.base64, result.blob);
      }

      setImages(prev => [...prev, ...newImages].slice(0, 3));
      setImageBlobs(updatedBlobs);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      alert('Não foi possível processar a foto selecionada. Se o celular tiver pouca memória, tente tirar a foto com o app da Câmera e anexar pela Galeria.');
    } finally {
      setIsCompressingImage(false);
      setCompressStatus('');
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

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
      // Upload ou persistência local ultra-leve das fotos
      let finalImages: string[] = [];
      if (images.length > 0) {
        finalImages = await Promise.all(
          images.slice(0, 3).map((img, idx) =>
            uploadOrStoreImage(
              user?.uid,
              selectedDate,
              { base64: img, blob: imageBlobs.get(img) },
              idx
            )
          )
        );
      }

      const isMilagre = type === 'milagre';
      const recordData = {
        date: selectedDate,
        startTime: startTime.trim() || undefined,
        type,
        intensity: isMilagre ? null : intensity,
        painLocation: isMilagre ? null : (painLocation || null),
        symptoms: isMilagre ? [] : symptoms,
        triggers,
        medicationsTaken: isMilagre ? [] : medicationsTaken,
        images: finalImages,
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

  const renderPhotoAttachment = (isStandalone: boolean = false) => (
    <div className={`space-y-3 ${isStandalone ? '' : 'pt-3 border-t border-[var(--card-border)]'}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-[11px] font-bold tracking-wider text-[var(--text-secondary)] uppercase flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Fotos & Anexos</span>
          <span className="text-[10px] text-[var(--text-muted)] font-normal">
            ({images.length}/3)
          </span>
        </label>

        {images.length < 3 && !isCompressingImage && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[var(--card-bg)] border border-dashed border-[var(--card-border)] cursor-pointer"
              title="Tirar foto ou escolher da câmera"
            >
              <Camera className="w-3.5 h-3.5 text-sky-500" />
              <span>Tirar Foto</span>
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[var(--card-bg)] border border-dashed border-[var(--card-border)] cursor-pointer"
              title="Escolher foto existente da galeria"
            >
              <ImageIcon className="w-3.5 h-3.5 text-violet-500" />
              <span>Galeria</span>
            </button>
          </div>
        )}
      </div>

      {isCompressingImage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-600 dark:text-sky-400 text-xs animate-in">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span className="font-medium">{compressStatus || 'Otimizando imagem para formato ultra-leve...'}</span>
        </div>
      )}

      {images.length > 0 ? (
        <div className="flex items-center gap-3 overflow-x-auto py-1.5">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group w-20 h-20 rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm shrink-0"
            >
              <img
                src={img}
                alt={`Anexo ${idx + 1}`}
                onClick={() => setLightboxIndex(idx)}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                title="Clique para ver em tela cheia"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                title="Remover foto"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {images.length < 3 && !isCompressingImage && (
            <div className="flex flex-col gap-1.5 shrink-0 justify-center">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="h-9 px-3 rounded-xl border border-dashed border-[var(--card-border)] hover:border-[var(--card-border-hover)] flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-[var(--card-bg)]/40 hover:bg-[var(--card-bg)] cursor-pointer"
                title="Tirar foto com a câmera"
              >
                <Camera className="w-3.5 h-3.5 text-sky-500" />
                <span>+ Câmera</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="h-9 px-3 rounded-xl border border-dashed border-[var(--card-border)] hover:border-[var(--card-border-hover)] flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-[var(--card-bg)]/40 hover:bg-[var(--card-bg)] cursor-pointer"
                title="Escolher da galeria"
              >
                <ImageIcon className="w-3.5 h-3.5 text-violet-500" />
                <span>+ Galeria</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        !isCompressingImage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="py-3 px-3.5 rounded-xl border border-dashed border-[var(--card-border)] hover:border-[var(--card-border-hover)] flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-[var(--card-bg)]/40 hover:bg-[var(--card-bg)] cursor-pointer"
            >
              <Camera className="w-4 h-4 text-sky-500" />
              <span className="font-semibold">Tirar Foto</span>
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="py-3 px-3.5 rounded-xl border border-dashed border-[var(--card-border)] hover:border-[var(--card-border-hover)] flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-[var(--card-bg)]/40 hover:bg-[var(--card-bg)] cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-violet-500" />
              <span className="font-semibold">Escolher da Galeria</span>
            </button>
          </div>
        )
      )}

      {/* Dica amigável de otimização e prevenção de falta de memória no Android */}
      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed pt-0.5">
        💡 Fotos são otimizadas (~50 KB) para economizar dados e memória. Se o seu celular fechar ao abrir a câmera direta, tire a foto no app da Câmera e anexe pela <strong>Galeria</strong>.
      </p>
    </div>
  );

  const currentColor = intensity !== null ? getIntensityColor(intensity) : null;

  return (
    <div
      className={`p-5 sm:p-7 space-y-6 sm:space-y-7 rounded-2xl shadow-sm transition-all duration-200 border ${
        existingCrisis
          ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.07] border-amber-500/40 ring-1 ring-amber-500/25 shadow-md shadow-amber-500/5'
          : 'glass border-[var(--card-border)]'
      }`}
    >
      {/* Banner Exclusivo do Modo de Edição */}
      {existingCrisis && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium animate-in">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-5 sm:pb-6 border-b border-[var(--card-border)]">
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
        {!existingCrisis && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleMarkPainFree}
              className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-xs px-2.5 py-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Dia Livre de Dor
            </button>
          </div>
        )}
      </div>

      {/* Formulário Principal Direto na Tela */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
        
        {/* 2. TIPO DO EPISÓDIO COM IDENTIDADE CLÍNICA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">
              Tipo do Episódio
            </label>
            <span className="text-[11px] text-[var(--text-muted)]">Toque para selecionar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                desc: 'O capeta',
                selectedClasses: 'border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/30',
                badgeClasses: 'bg-violet-500 text-white dark:text-slate-900',
                descClasses: 'text-violet-600/80 dark:text-violet-300/80'
              },
              {
                id: 'milagre' as CrisisType,
                label: 'Milagre',
                emoji: '🍀',
                desc: 'vai entender',
                selectedClasses: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30',
                badgeClasses: 'bg-emerald-500 text-white dark:text-slate-900',
                descClasses: 'text-emerald-600/80 dark:text-emerald-300/80'
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

        {/* 3. MEDICAMENTOS TOMADOS (Oculto no tipo milagre) */}
        {type !== 'milagre' && (
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
        )}

        {/* 4. GATILHOS ACIONADOS (SE TIPO FOR MILAGRE) */}
        {type === 'milagre' && (
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/25 space-y-3 animate-in">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-[11px] font-bold tracking-wider text-emerald-800 dark:text-emerald-300 uppercase flex items-center gap-1.5">
                <span>🎯</span>
                <span>Gatilhos Acionados</span>
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Quais gatilhos você ativou mas não deram crise?
              </span>
            </div>

            <TagPicker
              label=""
              options={COMMON_TRIGGERS}
              selected={triggers}
              onChange={setTriggers}
              placeholderCustom="Outro gatilho acionado..."
            />
          </div>
        )}

        {/* 5. DESCRIÇÃO / OBSERVAÇÕES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">
              Descrição / Observações
            </label>
            <span className="text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
              Opcional • Contexto, alimentação, ambiente...
            </span>
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={type === 'milagre' ? "O que você acha que aconteceu? 'Vai entender'..." : "Notas adicionais, contexto ou observações sobre o episódio..."}
            className="input-field text-xs rounded-xl min-h-[96px] sm:min-h-[115px] resize-y leading-relaxed"
          />
        </div>

        {/* 6. SEÇÃO RETRÁTIL: DETALHAMENTOS OPCIONAIS E FOTOS */}
        {type !== 'milagre' ? (
          <div className="border border-[var(--card-border)] rounded-xl bg-[var(--bg-secondary)]/40 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Intensidade, Local, Sintomas, Gatilhos e Fotos
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
                  • Opcional
                </span>
                {intensity !== null && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                    Dor {intensity}/10
                  </span>
                )}
                {painLocation && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                    {painLocation === 'esquerda' ? '⬅️ Esquerda' : painLocation === 'direita' ? '➡️ Direita' : '↔️ Mista'}
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
                {images.length > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>{images.length} {images.length === 1 ? 'foto' : 'fotos'}</span>
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

                {/* Local da Dor */}
                <div className="space-y-2 p-3 sm:p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">
                      Local da Dor
                    </label>
                    {painLocation ? (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30">
                        {painLocation === 'mista' ? 'Mista (Bilateral)' : painLocation === 'esquerda' ? 'Lado Esquerdo' : 'Lado Direito'}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">Não informado</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'esquerda' as PainLocation, label: 'Esquerda', icon: '⬅️' },
                      { id: 'direita' as PainLocation, label: 'Direita', icon: '➡️' },
                      { id: 'mista' as PainLocation, label: 'Mista', icon: '↔️' }
                    ].map(opt => {
                      const isSelected = painLocation === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPainLocation(isSelected ? null : opt.id)}
                          className={`h-9 sm:h-10 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border border-[var(--color-primary)] shadow-sm scale-[1.02]'
                              : 'bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)]'
                          }`}
                        >
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
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

                {/* Bloco de Fotos & Anexos dentro da seção retrátil */}
                {renderPhotoAttachment(false)}
              </div>
            )}
          </div>
        ) : (
          /* Seção retrátil específica para Milagre (apenas fotos) */
          <div className="border border-[var(--card-border)] rounded-xl bg-[var(--bg-secondary)]/40 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Camera className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Fotos & Anexos
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal">
                  • Opcional
                </span>
                {images.length > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>{images.length} {images.length === 1 ? 'foto' : 'fotos'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <span>{showAdvanced ? 'Recolher' : 'Expandir'}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showAdvanced && (
              <div className="p-4 sm:p-5 pt-4 border-t border-[var(--card-border)] space-y-3 animate-in">
                {renderPhotoAttachment(true)}
              </div>
            )}
          </div>
        )}

        {/* Inputs para Câmera e Galeria com seletor nativo seguro (sem forçar capture para não derrubar memória no Android) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 5. BARRA DE SALVAR */}
        <div className="pt-5 sm:pt-6 border-t border-[var(--card-border)] flex items-center justify-between flex-wrap gap-3">
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

      {/* Modal de Zoom da Imagem (Lightbox) */}
      <ImageLightboxModal
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        images={images}
        initialIndex={lightboxIndex ?? 0}
        title={formatDateFull(selectedDate)}
      />

    </div>
  );
};
