/**
 * Filtros do catálogo. Ver docs/specs/001-catalogo-receitas.md.
 *
 * Regra de combinação, da spec: **dentro do mesmo tipo somam-se (OU), entre tipos restringem-se (E)**.
 * Escolher "forno" e "tacho" mostra receitas de forno ou de tacho; escolher "forno" e "leve" mostra
 * só as que são as duas coisas.
 */
import type { CookingMethod, Recipe, Weight } from './types.ts';

/** Intervalos de duração. Escolhidos por corresponderem a decisões reais, não a números redondos. */
export type DurationBand = 'ate-30' | '30-60' | 'mais-de-60';

export const DURATION_BAND_NAMES: Record<DurationBand, string> = {
  'ate-30': 'Até 30 min',
  '30-60': '30 a 60 min',
  'mais-de-60': 'Mais de 1h',
};

export interface CatalogueFilters {
  durations: DurationBand[];
  methods: CookingMethod[];
  weights: Weight[];
  labels: string[];
}

export const EMPTY_FILTERS: CatalogueFilters = {
  durations: [],
  methods: [],
  weights: [],
  labels: [],
};

/** Tempo ativo: preparação mais confeção. A antecedência não conta — não é tempo na cozinha. */
export function activeMinutes(recipe: Recipe): number {
  return recipe.timing.prepMinutes + recipe.timing.cookMinutes;
}

export function durationBandOf(recipe: Recipe): DurationBand {
  const minutes = activeMinutes(recipe);
  if (minutes <= 30) return 'ate-30';
  if (minutes <= 60) return '30-60';
  return 'mais-de-60';
}

export function matchesFilters(recipe: Recipe, filters: CatalogueFilters): boolean {
  if (filters.durations.length > 0 && !filters.durations.includes(durationBandOf(recipe))) {
    return false;
  }
  // Uma receita pode ter vários métodos: basta que um deles esteja escolhido.
  if (filters.methods.length > 0 && !recipe.methods.some((m) => filters.methods.includes(m))) {
    return false;
  }
  if (filters.weights.length > 0) {
    if (!recipe.weight || !filters.weights.includes(recipe.weight)) return false;
  }
  if (filters.labels.length > 0 && !recipe.labels.some((l) => filters.labels.includes(l))) {
    return false;
  }
  return true;
}

export function applyFilters(recipes: Recipe[], filters: CatalogueFilters): Recipe[] {
  return recipes.filter((recipe) => matchesFilters(recipe, filters));
}

export function hasActiveFilters(filters: CatalogueFilters): boolean {
  return (
    filters.durations.length > 0 ||
    filters.methods.length > 0 ||
    filters.weights.length > 0 ||
    filters.labels.length > 0
  );
}

/**
 * Alterna um valor numa das listas de filtros, que é o que um toque num filtro faz.
 * Devolve um objeto novo — nada é mutado.
 */
export function toggleFilter<K extends keyof CatalogueFilters>(
  filters: CatalogueFilters,
  key: K,
  value: CatalogueFilters[K][number],
): CatalogueFilters {
  const current = filters[key] as string[];
  const next = current.includes(value as string)
    ? current.filter((v) => v !== value)
    : [...current, value as string];
  return { ...filters, [key]: next };
}
