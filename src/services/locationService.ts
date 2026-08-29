export interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

const LOCATION_STORAGE_KEY = 'enxaquecator_user_location';
const LOCATION_TIMESTAMP_KEY = 'enxaquecator_location_ts';
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas de cache para localização

/**
 * Obtém a localização atual do usuário.
 * 1. Tenta cache recente
 * 2. Tenta GPS do navegador (HTML5 Geolocation)
 * 3. Se falhar / recusar, faz fallback silencioso para geolocalização via IP
 */
export async function getUserLocation(): Promise<GeoLocation> {
  // 1. Tentar cache válido
  try {
    const cached = localStorage.getItem(LOCATION_STORAGE_KEY);
    const cachedTs = localStorage.getItem(LOCATION_TIMESTAMP_KEY);
    if (cached && cachedTs) {
      const age = Date.now() - parseInt(cachedTs, 10);
      if (age < CACHE_TTL_MS) {
        return JSON.parse(cached);
      }
    }
  } catch (e) {
    // ignore storage errors
  }

  // 2. Tentar GPS do navegador com timeout de 4 segundos
  try {
    const coords = await getBrowserCoordinates(4000);
    if (coords) {
      const location: GeoLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      // Tenta resolver o nome da cidade em background (reversa)
      try {
        const cityData = await reverseGeocode(coords.latitude, coords.longitude);
        if (cityData?.city) {
          location.city = cityData.city;
          location.region = cityData.region;
        }
      } catch (e) {
        // Fallback silencioso
      }

      saveLocationToCache(location);
      return location;
    }
  } catch (e) {
    // GPS não disponível ou permissão negada
  }

  // 3. Fallback silencioso por IP (sem perturbar o usuário)
  try {
    const ipLocation = await getIpLocation();
    if (ipLocation) {
      saveLocationToCache(ipLocation);
      return ipLocation;
    }
  } catch (e) {
    // ignore
  }

  // 4. Default neutro caso tudo falhe (São Paulo, Brasil - fuso -03:00)
  const defaultLocation: GeoLocation = {
    latitude: -23.5505,
    longitude: -46.6333,
    city: 'São Paulo',
    region: 'SP',
    country: 'Brazil'
  };

  return defaultLocation;
}

function getBrowserCoordinates(timeoutMs: number): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    const timer = setTimeout(() => resolve(null), timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: timeoutMs,
        maximumAge: 1000 * 60 * 30 // Aceita cache do navegador até 30min
      }
    );
  });
}

async function getIpLocation(): Promise<GeoLocation | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('IP API error');
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        region: data.region_code || data.region,
        country: data.country_name
      };
    }
  } catch (e) {
    // Tentativa alternativa com freeipapi
    try {
      const res2 = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(3000) });
      if (!res2.ok) return null;
      const data2 = await res2.json();
      if (data2.latitude && data2.longitude) {
        return {
          latitude: data2.latitude,
          longitude: data2.longitude,
          city: data2.cityName,
          region: data2.regionName,
          country: data2.countryName
        };
      }
    } catch (err) {
      return null;
    }
  }
  return null;
}

async function reverseGeocode(lat: number, lon: number): Promise<{ city?: string; region?: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' },
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.village;
    const region = data.address?.state_code || data.address?.state;
    return { city, region };
  } catch (e) {
    return null;
  }
}

function saveLocationToCache(loc: GeoLocation) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    localStorage.setItem(LOCATION_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    // ignore
  }
}
