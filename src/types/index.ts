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

export interface WeatherData {
  temperature: number; // °C
  apparentTemperature?: number; // °C
  humidity?: number; // %
  pressure: number; // hPa ao nível do mar
  pressureVariation24h?: number; // Delta hPa nas últimas 24h (ex: -5.4)
  pressureStatus?: 'falling' | 'stable' | 'rising'; // falling (queda), stable (estável), rising (subida)
  weatherCode?: number; // Código WMO
  weatherDescription?: string; // ex: 'Parcialmente Nublado'
  weatherIcon?: string; // ex: '☀️', '⛅', '🌧️', '⛈️'
  uvIndex?: number; // Índice UV máximo
  airQualityIndex?: number; // AQI
  airQualityLabel?: string; // ex: 'Boa', 'Moderada', 'Ruim'
  cityName?: string; // Cidade / Região
  latitude?: number;
  longitude?: number;
  fetchedAt?: string;
}

export type CrisisType = 'presenca' | 'dor' | 'aura';

export type TimeOfDay = 'madrugada' | 'manha' | 'tarde' | 'noite';

export interface CrisisRecord {
  id: string;
  userId?: string;
  date: string; // Formato YYYY-MM-DD
  startTime?: string; // Formato HH:mm (opcional)
  timeOfDay?: TimeOfDay; // 'madrugada' | 'manha' | 'tarde' | 'noite'
  type?: CrisisType | null; // 'presenca' | 'dor' | 'aura'
  intensity: number | null; // 1 a 10 ou null se não informada
  symptoms?: string[];
  triggers?: string[];
  medicationsTaken?: MedicationTaken[];
  notes?: string;
  weather?: WeatherData; // Dados meteorológicos e ambientais automáticos
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
