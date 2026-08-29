import { WeatherData } from '../types';
import { getUserLocation, GeoLocation } from './locationService';

// WMO Weather interpretation codes
const WMO_DESCRIPTIONS: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Céu Limpo', icon: '☀️' },
  1: { desc: 'Predomínio de Sol', icon: '🌤️' },
  2: { desc: 'Parcialmente Nublado', icon: '⛅' },
  3: { desc: 'Nublado / Encoberto', icon: '☁️' },
  45: { desc: 'Nevoeiro', icon: '🌫️' },
  48: { desc: 'Nevoeiro com Depósito', icon: '🌫️' },
  51: { desc: 'Garoa Leve', icon: '🌦️' },
  53: { desc: 'Garoa Moderada', icon: '🌧️' },
  55: { desc: 'Garoa Densa', icon: '🌧️' },
  56: { desc: 'Garoa Congelante', icon: '❄️' },
  57: { desc: 'Garoa Congelante Densa', icon: '❄️' },
  61: { desc: 'Chuva Fraca', icon: '🌦️' },
  63: { desc: 'Chuva Moderada', icon: '🌧️' },
  65: { desc: 'Chuva Forte', icon: '🌧️' },
  66: { desc: 'Chuva Congelante', icon: '❄️' },
  67: { desc: 'Chuva Congelante Forte', icon: '❄️' },
  71: { desc: 'Neve Fraca', icon: '🌨️' },
  73: { desc: 'Neve Moderada', icon: '🌨️' },
  75: { desc: 'Neve Forte', icon: '🌨️' },
  80: { desc: 'Pancadas de Chuva Leves', icon: '🌦️' },
  81: { desc: 'Pancadas de Chuva Moderadas', icon: '🌧️' },
  82: { desc: 'Pancadas de Chuva Violentas', icon: '⛈️' },
  95: { desc: 'Tempestade com Trovoadas', icon: '⛈️' },
  96: { desc: 'Tempestade com Granizo Leve', icon: '⛈️' },
  99: { desc: 'Tempestade com Granizo Forte', icon: '⛈️' }
};

function getWmoDetails(code?: number) {
  if (code === undefined || code === null) {
    return { desc: 'Indisponível', icon: '🌡️' };
  }
  return WMO_DESCRIPTIONS[code] || { desc: 'Tempo Variável', icon: '⛅' };
}

function getAqiLabel(aqi?: number): string | undefined {
  if (aqi === undefined || aqi === null) return undefined;
  if (aqi <= 20) return 'Excelente';
  if (aqi <= 40) return 'Boa';
  if (aqi <= 60) return 'Moderada';
  if (aqi <= 80) return 'Ruim';
  return 'Muito Ruim';
}

/**
 * Busca dados meteorológicos e ambientais para uma determinada data.
 * Se for hoje ou recente, usa a Forecast API.
 * Se for retroativo (> 3 dias atrás), usa a Archive API do Open-Meteo.
 */
export async function fetchWeatherForDate(
  dateStr: string,
  providedLocation?: GeoLocation
): Promise<WeatherData | null> {
  try {
    const location = providedLocation || (await getUserLocation());
    if (!location || !location.latitude || !location.longitude) {
      return null;
    }

    const lat = location.latitude;
    const lon = location.longitude;
    const cacheKey = `enx_weather_${dateStr}_${lat.toFixed(2)}_${lon.toFixed(2)}`;

    // 1. Verificar cache local primeiro
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // ignore
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = dateStr === todayStr;
    
    // Comparar se a data é anterior a hoje
    const targetDate = new Date(dateStr + 'T12:00:00');
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    let weatherData: WeatherData | null = null;

    if (diffDays >= 3) {
      // Usar Archive API para datas históricas
      weatherData = await fetchHistoricalWeather(lat, lon, dateStr, location.city);
    } else {
      // Usar Forecast API (cobre hoje e os últimos 2 dias com dados em tempo real)
      weatherData = await fetchCurrentForecastWeather(lat, lon, isToday, location.city);
    }

    if (weatherData) {
      // Tentar enriquecer com Qualidade do Ar (Air Quality API)
      try {
        const aqiData = await fetchAirQuality(lat, lon);
        if (aqiData) {
          weatherData.airQualityIndex = aqiData.aqi;
          weatherData.airQualityLabel = aqiData.label;
        }
      } catch (e) {
        // Silencioso
      }

      // Salvar em cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify(weatherData));
      } catch (e) {
        // ignore
      }
    }

    return weatherData;
  } catch (error) {
    console.warn('Silent weather fetch failed:', error);
    return null;
  }
}

async function fetchCurrentForecastWeather(
  lat: number,
  lon: number,
  isToday: boolean,
  cityName?: string
): Promise<WeatherData | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,weather_code&hourly=surface_pressure,temperature_2m&daily=weather_code,uv_index_max,temperature_2m_max,temperature_2m_min&timezone=auto`;

  const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
  if (!res.ok) throw new Error('Open-Meteo forecast error');

  const data = await res.json();
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  const temp = Math.round(isToday && current?.temperature_2m !== undefined ? current.temperature_2m : (daily?.temperature_2m_max?.[0] || 22));
  const appTemp = current?.apparent_temperature !== undefined ? Math.round(current.apparent_temperature) : temp;
  const humidity = Math.round(current?.relative_humidity_2m || 65);
  const pressure = Math.round(current?.surface_pressure || 1013);
  const weatherCode = isToday && current?.weather_code !== undefined ? current.weather_code : (daily?.weather_code?.[0] || 1);
  const uvIndex = daily?.uv_index_max?.[0] !== undefined ? Math.round(daily.uv_index_max[0]) : undefined;

  // Calcular variação de pressão nas últimas 24h
  let pressureVariation24h: number | undefined = undefined;
  let pressureStatus: 'falling' | 'stable' | 'rising' = 'stable';

  if (hourly?.surface_pressure && hourly.surface_pressure.length >= 24) {
    const currentIdx = isToday ? (new Date().getHours()) : 12;
    const currentP = hourly.surface_pressure[currentIdx] || pressure;
    const prevIdx = Math.max(0, currentIdx - 24);
    const prevP = hourly.surface_pressure[prevIdx];
    if (prevP) {
      const delta = Math.round((currentP - prevP) * 10) / 10;
      pressureVariation24h = delta;
      if (delta <= -3.0) pressureStatus = 'falling';
      else if (delta >= 3.0) pressureStatus = 'rising';
    }
  }

  const { desc, icon } = getWmoDetails(weatherCode);

  return {
    temperature: temp,
    apparentTemperature: appTemp,
    humidity,
    pressure,
    pressureVariation24h,
    pressureStatus,
    weatherCode,
    weatherDescription: desc,
    weatherIcon: icon,
    uvIndex,
    cityName,
    latitude: lat,
    longitude: lon,
    fetchedAt: new Date().toISOString()
  };
}

async function fetchHistoricalWeather(
  lat: number,
  lon: number,
  dateStr: string,
  cityName?: string
): Promise<WeatherData | null> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=weather_code,temperature_2m_mean,relative_humidity_2m_mean,surface_pressure_mean,uv_index_max&timezone=auto`;

  const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
  if (!res.ok) throw new Error('Open-Meteo archive error');

  const data = await res.json();
  const daily = data.daily;
  if (!daily || !daily.temperature_2m_mean || daily.temperature_2m_mean.length === 0) {
    return null;
  }

  const temp = Math.round(daily.temperature_2m_mean[0]);
  const humidity = Math.round(daily.relative_humidity_2m_mean?.[0] || 65);
  const pressure = Math.round(daily.surface_pressure_mean?.[0] || 1013);
  const weatherCode = daily.weather_code?.[0] || 0;
  const uvIndex = daily.uv_index_max?.[0] !== undefined ? Math.round(daily.uv_index_max[0]) : undefined;

  const { desc, icon } = getWmoDetails(weatherCode);

  return {
    temperature: temp,
    apparentTemperature: temp,
    humidity,
    pressure,
    pressureStatus: 'stable',
    weatherCode,
    weatherDescription: desc,
    weatherIcon: icon,
    uvIndex,
    cityName,
    latitude: lat,
    longitude: lon,
    fetchedAt: new Date().toISOString()
  };
}

async function fetchAirQuality(lat: number, lon: number): Promise<{ aqi: number; label: string } | null> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi&timezone=auto`;
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) return null;
  const data = await res.json();
  const aqi = data.current?.european_aqi;
  if (aqi !== undefined && aqi !== null) {
    const label = getAqiLabel(aqi) || 'Normal';
    return { aqi, label };
  }
  return null;
}
