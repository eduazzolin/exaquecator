import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CrisisRecord, Medication, AppNotification } from '../types';
import { useAuth } from './AuthContext';
import { 
  fetchCrisesFromStorage, 
  saveCrisisToStorage, 
  deleteCrisisFromStorage,
  fetchMedicationsFromStorage,
  saveMedicationToStorage,
  deleteMedicationFromStorage
} from '../services/storageService';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS } from '../utils/constants';
import {
  mergeTagSuggestions,
  getStoredCustomSymptoms,
  saveStoredCustomSymptoms,
  getStoredCustomTriggers,
  saveStoredCustomTriggers
} from '../utils/tagUtils';

interface DataContextType {
  crises: CrisisRecord[];
  medications: Medication[];
  loading: boolean;
  notifications: AppNotification[];
  dismissNotification: (id: string) => void;
  showToast: (message: string, type?: AppNotification['type']) => void;
  
  // Crisis Actions
  addCrisis: (crisis: Omit<CrisisRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CrisisRecord>;
  updateCrisis: (crisis: CrisisRecord) => Promise<void>;
  deleteCrisis: (id: string) => Promise<void>;
  
  // Medication Actions
  addMedication: (med: Omit<Medication, 'id' | 'createdAt'>) => Promise<Medication>;
  updateMedication: (med: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  toggleMedicationFavorite: (id: string) => Promise<void>;
  
  // Suggestions (Sintomas e Gatilhos)
  symptomSuggestions: string[];
  triggerSuggestions: string[];
  addCustomSymptom: (symptom: string) => void;
  addCustomTrigger: (trigger: string) => void;

  // Refresh
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [crises, setCrises] = useState<CrisisRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState<string[]>(() => getStoredCustomSymptoms());
  const [customTriggers, setCustomTriggers] = useState<string[]>(() => getStoredCustomTriggers());

  const symptomSuggestions = useMemo(() => {
    return mergeTagSuggestions(
      COMMON_SYMPTOMS,
      crises.map(c => c.symptoms),
      customSymptoms
    );
  }, [crises, customSymptoms]);

  const triggerSuggestions = useMemo(() => {
    return mergeTagSuggestions(
      COMMON_TRIGGERS,
      crises.map(c => c.triggers),
      customTriggers
    );
  }, [crises, customTriggers]);

  const addCustomSymptom = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setCustomSymptoms(prev => {
      if (prev.some(s => s.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [...prev, trimmed];
      saveStoredCustomSymptoms(updated);
      return updated;
    });
  };

  const addCustomTrigger = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setCustomTriggers(prev => {
      if (prev.some(t => t.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [...prev, trimmed];
      saveStoredCustomTriggers(updated);
      return updated;
    });
  };

  const showToast = (message: string, type: AppNotification['type'] = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissNotification(id);
    }, 3500);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const refreshData = async () => {
    if (!user) {
      setCrises([]);
      setMedications([]);
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    try {
      const [fetchedCrises, fetchedMeds] = await Promise.all([
        fetchCrisesFromStorage(user.uid),
        fetchMedicationsFromStorage(user.uid)
      ]);
      setCrises(fetchedCrises);
      setMedications(fetchedMeds);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    refreshData();
  }, [user?.uid, authLoading]);

  // --- Crisis Handlers ---

  const addCrisis = async (crisisData: Omit<CrisisRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CrisisRecord> => {
    const now = new Date().toISOString();
    const newCrisis: CrisisRecord = {
      ...crisisData,
      id: `crisis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user?.uid,
      createdAt: now,
      updatedAt: now
    };

    if (crisisData.symptoms) {
      crisisData.symptoms.forEach(addCustomSymptom);
    }
    if (crisisData.triggers) {
      crisisData.triggers.forEach(addCustomTrigger);
    }

    const updated = [newCrisis, ...crises].sort((a, b) => b.date.localeCompare(a.date));
    setCrises(updated);
    await saveCrisisToStorage(newCrisis, user?.uid);
    showToast('Registro de enxaqueca salvo com sucesso!');
    return newCrisis;
  };

  const updateCrisis = async (crisis: CrisisRecord): Promise<void> => {
    const now = new Date().toISOString();
    const updatedRecord: CrisisRecord = {
      ...crisis,
      updatedAt: now
    };

    if (crisis.symptoms) {
      crisis.symptoms.forEach(addCustomSymptom);
    }
    if (crisis.triggers) {
      crisis.triggers.forEach(addCustomTrigger);
    }

    setCrises(prev => prev.map(c => c.id === crisis.id ? updatedRecord : c).sort((a, b) => b.date.localeCompare(a.date)));
    await saveCrisisToStorage(updatedRecord, user?.uid);
    showToast('Registro atualizado!');
  };

  const deleteCrisis = async (id: string): Promise<void> => {
    setCrises(prev => prev.filter(c => c.id !== id));
    await deleteCrisisFromStorage(id, user?.uid);
    showToast('Registro excluído.', 'info');
  };

  // --- Medication Handlers ---

  const addMedication = async (medData: Omit<Medication, 'id' | 'createdAt'>): Promise<Medication> => {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user?.uid,
      createdAt: new Date().toISOString()
    };

    setMedications(prev => [...prev, newMed]);
    await saveMedicationToStorage(newMed, user?.uid);
    showToast('Medicamento adicionado!');
    return newMed;
  };

  const updateMedication = async (med: Medication): Promise<void> => {
    setMedications(prev => prev.map(m => m.id === med.id ? med : m));
    await saveMedicationToStorage(med, user?.uid);
    showToast('Medicamento atualizado!');
  };

  const deleteMedication = async (id: string): Promise<void> => {
    setMedications(prev => prev.filter(m => m.id !== id));
    await deleteMedicationFromStorage(id, user?.uid);
    showToast('Medicamento removido.', 'info');
  };

  const toggleMedicationFavorite = async (id: string): Promise<void> => {
    const med = medications.find(m => m.id === id);
    if (!med) return;
    const updated = { ...med, isFavorite: !med.isFavorite };
    await updateMedication(updated);
  };

  const isLoading = authLoading || dataLoading;

  return (
    <DataContext.Provider
      value={{
        crises,
        medications,
        loading: isLoading,
        notifications,
        dismissNotification,
        showToast,
        addCrisis,
        updateCrisis,
        deleteCrisis,
        addMedication,
        updateMedication,
        deleteMedication,
        toggleMedicationFavorite,
        symptomSuggestions,
        triggerSuggestions,
        addCustomSymptom,
        addCustomTrigger,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
