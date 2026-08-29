export type MedicationCategory = 'abortive' | 'painkiller' | 'preventive' | 'other';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  category: MedicationCategory;
  notes?: string;
  isFavorite?: boolean;
  createdAt: string;
  userId?: string;
}

export type ReliefLevel = 'none' | 'partial' | 'total' | 'unknown';

export interface MedicationTaken {
  medicationId?: string;
  name: string;
  dosage: string;
  quantity?: number; // Quantidade de doses / comprimidos (ex: 1, 2, 3)
  relief?: ReliefLevel;
}

export type CrisisType = 'presenca' | 'dor' | 'aura';

export interface CrisisRecord {
  id: string;
  userId?: string;
  date: string; // Formato YYYY-MM-DD
  type?: CrisisType | null; // 'presenca' | 'dor' | 'aura'
  intensity: number | null; // 1 a 10 ou null se não informada
  symptoms?: string[];
  triggers?: string[];
  medicationsTaken?: MedicationTaken[];
  notes?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
