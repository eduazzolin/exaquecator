import React, { createContext, useContext, useEffect, useState } from 'react';
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
import { fetchWeatherForDate } from '../services/weatherService';
import { getTimeOfDayFromTime } from '../utils/dateUtils';

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
  
  // Refresh
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [crises, setCrises] = useState<CrisisRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

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
    setLoading(true);
    try {
      const [fetchedCrises, fetchedMeds] = await Promise.all([
        fetchCrisesFromStorage(user?.uid),
        fetchMedicationsFromStorage(user?.uid)
      ]);
      setCrises(fetchedCrises);
      setMedications(fetchedMeds);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.uid]);

  // --- Crisis Handlers ---

  // Helper para enriquecer silenciosamente um registro com clima
  const enrichRecordWithWeather = async (record: CrisisRecord) => {
    try {
      const weather = await fetchWeatherForDate(record.date);
      if (weather) {
        const enriched: CrisisRecord = {
          ...record,
          weather,
          updatedAt: new Date().toISOString()
        };
        setCrises(prev => prev.map(c => c.id === record.id ? enriched : c));
        await saveCrisisToStorage(enriched, user?.uid);
      }
    } catch (e) {
      console.warn('Background weather enrichment error:', e);
    }
  };

  const addCrisis = async (crisisData: Omit<CrisisRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CrisisRecord> => {
    const now = new Date().toISOString();
    const timeOfDay = crisisData.timeOfDay || getTimeOfDayFromTime(crisisData.startTime);
    
    const newCrisis: CrisisRecord = {
      ...crisisData,
      timeOfDay,
      id: `crisis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user?.uid,
      createdAt: now,
      updatedAt: now
    };

    const updated = [newCrisis, ...crises].sort((a, b) => b.date.localeCompare(a.date));
    setCrises(updated);
    await saveCrisisToStorage(newCrisis, user?.uid);
    showToast('Registro de enxaqueca salvo com sucesso!');

    // Se não tiver dados climáticos anexados, buscar silenciosamente em background
    if (!newCrisis.weather) {
      enrichRecordWithWeather(newCrisis);
    }

    return newCrisis;
  };

  const updateCrisis = async (crisis: CrisisRecord): Promise<void> => {
    const now = new Date().toISOString();
    const timeOfDay = crisis.timeOfDay || getTimeOfDayFromTime(crisis.startTime);
    
    const updatedRecord: CrisisRecord = {
      ...crisis,
      timeOfDay,
      updatedAt: now
    };

    setCrises(prev => prev.map(c => c.id === crisis.id ? updatedRecord : c).sort((a, b) => b.date.localeCompare(a.date)));
    await saveCrisisToStorage(updatedRecord, user?.uid);
    showToast('Registro atualizado!');

    // Se ainda não tiver clima, buscar em background
    if (!updatedRecord.weather) {
      enrichRecordWithWeather(updatedRecord);
    }
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

  return (
    <DataContext.Provider
      value={{
        crises,
        medications,
        loading,
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
