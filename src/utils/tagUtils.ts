export const LOCAL_STORAGE_CUSTOM_SYMPTOMS_KEY = 'enxaquecator_custom_symptoms_v1';
export const LOCAL_STORAGE_CUSTOM_TRIGGERS_KEY = 'enxaquecator_custom_triggers_v1';

/**
 * Normaliza uma tag para fins de comparação e deduplicação,
 * removendo emojis iniciais, espaços extras e convertendo para minúsculas.
 */
export const normalizeTag = (tag: string): string => {
  return tag
    .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '')
    .trim()
    .toLowerCase();
};

export const getStoredCustomSymptoms = (): string[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_SYMPTOMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredCustomSymptoms = (symptoms: string[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_SYMPTOMS_KEY, JSON.stringify(symptoms));
  } catch (err) {
    console.warn('Erro ao salvar sintomas customizados no localStorage:', err);
  }
};

export const getStoredCustomTriggers = (): string[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_TRIGGERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredCustomTriggers = (triggers: string[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_TRIGGERS_KEY, JSON.stringify(triggers));
  } catch (err) {
    console.warn('Erro ao salvar gatilhos customizados no localStorage:', err);
  }
};

/**
 * Combina tags padrão com tags históricas cadastradas em registros anteriores
 * e tags customizadas salvas localmente, deduplicando de forma inteligente.
 * 
 * 1. Mantém a lista clínica padrão como base inicial.
 * 2. Adiciona as tags customizadas que o usuário já utilizou ou cadastrou, ordenadas alfabeticamente.
 */
export const mergeTagSuggestions = (
  defaults: string[],
  historicalTagLists: (string[] | undefined)[],
  storedCustom: string[] = []
): string[] => {
  const seenNormalized = new Set<string>();

  // Registra as tags padrão para evitar duplicatas
  defaults.forEach(item => {
    const trimmed = item.trim();
    if (trimmed) {
      seenNormalized.add(trimmed.toLowerCase());
      const norm = normalizeTag(trimmed);
      if (norm) seenNormalized.add(norm);
    }
  });

  const customMap = new Map<string, string>(); // normalizedKey -> originalText

  // Adiciona tags customizadas salvas localmente
  storedCustom.forEach(item => {
    if (typeof item !== 'string') return;
    const trimmed = item.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const norm = normalizeTag(trimmed);
    const key = norm || lower;
    if (!seenNormalized.has(lower) && (!norm || !seenNormalized.has(norm))) {
      if (!customMap.has(key)) {
        customMap.set(key, trimmed);
      }
    }
  });

  // Adiciona tags de registros históricos
  historicalTagLists.forEach(list => {
    if (!list || !Array.isArray(list)) return;
    list.forEach(item => {
      if (typeof item !== 'string') return;
      const trimmed = item.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      const norm = normalizeTag(trimmed);
      const key = norm || lower;
      if (!seenNormalized.has(lower) && (!norm || !seenNormalized.has(norm))) {
        if (!customMap.has(key)) {
          customMap.set(key, trimmed);
        }
      }
    });
  });

  // Ordena tags customizadas alfabeticamente
  const sortedCustom = Array.from(customMap.values()).sort((a, b) =>
    a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
  );

  return [...defaults, ...sortedCustom];
};
