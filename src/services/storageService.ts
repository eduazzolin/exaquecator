import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { CrisisRecord, Medication } from '../types';
import { generateMockCrises } from '../utils/mockData';
import { DEFAULT_MEDICATIONS } from '../utils/constants';

const LOCAL_STORAGE_CRISES_KEY = 'enxaquecator_crises_v2';
const LOCAL_STORAGE_MEDS_KEY = 'enxaquecator_medications_v2';

export const getInitialMedications = (): Medication[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_MEDS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_MEDICATIONS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_MEDS_KEY, JSON.stringify(DEFAULT_MEDICATIONS));
  return DEFAULT_MEDICATIONS;
};

export const getInitialCrises = (): CrisisRecord[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_CRISES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      const mock = generateMockCrises();
      localStorage.setItem(LOCAL_STORAGE_CRISES_KEY, JSON.stringify(mock));
      return mock;
    }
  }
  const mock = generateMockCrises();
  localStorage.setItem(LOCAL_STORAGE_CRISES_KEY, JSON.stringify(mock));
  return mock;
};

// --- CRISES API ---

export const fetchCrisesFromStorage = async (userId?: string | null): Promise<CrisisRecord[]> => {
  if (isFirebaseConfigured && db && userId) {
    try {
      const crisesRef = collection(db, `users/${userId}/crises`);
      const q = query(crisesRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const list: CrisisRecord[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as CrisisRecord);
      });
      return list;
    } catch (error) {
      console.error('Error fetching crises from Firestore, using local cache:', error);
    }
  }
  return getInitialCrises().sort((a, b) => b.date.localeCompare(a.date));
};

export const saveCrisisToStorage = async (crisis: CrisisRecord, userId?: string | null): Promise<void> => {
  const localList = getInitialCrises();
  const existingIdx = localList.findIndex(c => c.id === crisis.id);
  if (existingIdx >= 0) {
    localList[existingIdx] = crisis;
  } else {
    localList.unshift(crisis);
  }
  localList.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(LOCAL_STORAGE_CRISES_KEY, JSON.stringify(localList));

  if (isFirebaseConfigured && db && userId) {
    try {
      const crisisRef = doc(db, `users/${userId}/crises`, crisis.id);
      await setDoc(crisisRef, crisis, { merge: true });
    } catch (error) {
      console.error('Error saving crisis to Firestore:', error);
    }
  }
};

export const deleteCrisisFromStorage = async (crisisId: string, userId?: string | null): Promise<void> => {
  const localList = getInitialCrises().filter(c => c.id !== crisisId);
  localStorage.setItem(LOCAL_STORAGE_CRISES_KEY, JSON.stringify(localList));

  if (isFirebaseConfigured && db && userId) {
    try {
      const crisisRef = doc(db, `users/${userId}/crises`, crisisId);
      await deleteDoc(crisisRef);
    } catch (error) {
      console.error('Error deleting crisis from Firestore:', error);
    }
  }
};

// --- MEDICATIONS API ---

export const fetchMedicationsFromStorage = async (userId?: string | null): Promise<Medication[]> => {
  if (isFirebaseConfigured && db && userId) {
    try {
      const medsRef = collection(db, `users/${userId}/medications`);
      const snapshot = await getDocs(medsRef);
      const list: Medication[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Medication);
      });
      if (list.length > 0) return list;
    } catch (error) {
      console.error('Error fetching medications from Firestore:', error);
    }
  }
  return getInitialMedications();
};

export const saveMedicationToStorage = async (med: Medication, userId?: string | null): Promise<void> => {
  const localList = getInitialMedications();
  const existingIdx = localList.findIndex(m => m.id === med.id);
  if (existingIdx >= 0) {
    localList[existingIdx] = med;
  } else {
    localList.push(med);
  }
  localStorage.setItem(LOCAL_STORAGE_MEDS_KEY, JSON.stringify(localList));

  if (isFirebaseConfigured && db && userId) {
    try {
      const medRef = doc(db, `users/${userId}/medications`, med.id);
      await setDoc(medRef, med, { merge: true });
    } catch (error) {
      console.error('Error saving medication to Firestore:', error);
    }
  }
};

export const deleteMedicationFromStorage = async (medId: string, userId?: string | null): Promise<void> => {
  const localList = getInitialMedications().filter(m => m.id !== medId);
  localStorage.setItem(LOCAL_STORAGE_MEDS_KEY, JSON.stringify(localList));

  if (isFirebaseConfigured && db && userId) {
    try {
      const medRef = doc(db, `users/${userId}/medications`, medId);
      await deleteDoc(medRef);
    } catch (error) {
      console.error('Error deleting medication from Firestore:', error);
    }
  }
};
