/**
 * Filtros do catálogo. Ver docs/specs/001-catalogo-receitas.md.
 *
 * Regra de combinação, da spec: **dentro do mesmo tipo somam-se (OU), entre tipos restringem-se (E)**.
 * Escolher "forno" e "tacho" mostra receitas de forno ou de tacho; escolher "forno" e "leve" mostra
 * só as que são as duas coisas.
 */
import type { CookingMethod, Recipe, Weight } from './types.ts';

/**
 * Escalões de duração. São quatro e não três desde a conversa 2: o painel "Apetece-me algo" mostra-os
 * como quadrante, e "até 30 / 30 a 60" é grosso de mais para quem tem vinte minutos.
 *
 * São cumulativos, não intervalos: escolher "até 40" inclui o que demora vinte. É o que a pessoa
 * quer dizer — "tenho quarenta minutos" e não "quero uma receita entre trinta e quarenta".
 */
export type DurationBand = 'ate-20' | 'ate-40' | 'ate-60' | 'mais-de-60';

export const DURATION_BAND_NAMES: Record<DurationBand, string> = {
  'ate-20': 'Até 20 min',
  'ate-40': 'Até 40 min',
  'ate-60': 'Até 1 h',
  'mais-de-60': 'Mais de 1 h',
};

/**
 * Os três primeiros são tetos; o último é um piso, e é por isso que não está na mesma tabela.
 *
 * Um teto infinito para o "mais de 1 h" faria esse escalão devolver o catálogo inteiro — que é o
 * contrário do que a palavra diz a quem a lê.
 */
const DURATION_BAND_CEILING: Record<Exclude<DurationBand, 'mais-de-60'>, number> = {
  'ate-20': 20,
  'ate-40': 40,
  'ate-60': 60,
};

export interface CatalogueFilters {
  durations: DurationBand[];
  methods: CookingMethod[];
  weights: Weight[];
  /**
   * Labels escolhidas, **agrupadas pela família a que pertencem** — tipo de prato, ingrediente,
   * cultura, ocasião, regime.
   *
   * Não é um saco só de propósito. A regra desta spec é "dentro do mesmo tipo somam-se, entre tipos
   * restringem-se", e com uma lista plana todas as labels somavam entre si: escolher "sem glúten" e
   * "portuguesa" devolvia tudo o que fosse uma coisa **ou** a outra, quando quem escolhe as duas quer
   * as duas. Agrupadas, a regra sai da forma dos dados em vez de depender de quem a lê.
   */
  labels: Record<string, string[]>;
  /**
   * Só receitas que se fazem no próprio dia. Não é um escalão de duração — é outro tipo de tempo,
   * e por isso é um interruptor à parte. Descobrir às sete da tarde que o bacalhau precisava de
   * vinte e quatro horas de molho é o pior momento possível.
   */
  semVespera: boolean;
}

export const EMPTY_FILTERS: CatalogueFilters = {
  durations: [],
  methods: [],
  weights: [],
  labels: {},
  semVespera: false,
};

/** Tempo ativo: preparação mais confeção. A antecedência não conta — não é tempo na cozinha. */
export function activeMinutes(recipe: Recipe): number {
  return recipe.timing.prepMinutes + recipe.timing.cookMinutes;
}

/** O escalão mais apertado em que a receita cabe. Serve para a etiquetar, não para a filtrar. */
export function durationBandOf(recipe: Recipe): DurationBand {
  const minutes = activeMinutes(recipe);
  if (minutes <= 20) return 'ate-20';
  if (minutes <= 40) return 'ate-40';
  if (minutes <= 60) return 'ate-60';
  return 'mais-de-60';
}

/** Cabe se não exceder um dos tetos escolhidos, ou se ultrapassar a hora quando esse foi escolhido. */
export function fitsDurationBands(recipe: Recipe, bands: DurationBand[]): boolean {
  const minutes = activeMinutes(recipe);
  return bands.some((band) =>
    band === 'mais-de-60' ? minutes > 60 : minutes <= DURATION_BAND_CEILING[band],
  );
}

/** Precisa de véspera: marinar, demolhar, levedar, arrefecer horas. */
export function needsPrepAhead(recipe: Recipe): boolean {
  return recipe.timing.prepAhead !== undefined;
}

export function matchesFilters(recipe: Recipe, filters: CatalogueFilters): boolean {
  if (filters.durations.length > 0 && !fitsDurationBands(recipe, filters.durations)) {
    return false;
  }
  if (filters.semVespera && needsPrepAhead(recipe)) return false;
  // Uma receita pode ter vários métodos: basta que um deles esteja escolhido.
  if (filters.methods.length > 0 && !recipe.methods.some((m) => filters.methods.includes(m))) {
    return false;
  }
  if (filters.weights.length > 0) {
    if (!recipe.weight || !filters.weights.includes(recipe.weight)) return false;
  }
  // Um grupo de cada vez: dentro dele basta uma, mas todos os grupos escolhidos têm de acertar.
  for (const escolhidas of Object.values(filters.labels)) {
    if (escolhidas.length > 0 && !recipe.labels.some((l) => escolhidas.includes(l))) return false;
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
    Object.values(filters.labels).some((ids) => ids.length > 0) ||
    filters.semVespera
  );
}

/**
 * Alterna um valor numa das listas de filtros, que é o que um toque num filtro faz.
 * Devolve um objeto novo — nada é mutado.
 */
/** Só as chaves que são listas. O `semVespera` é um booleano e liga-se à mão, não por alternância. */
type ChaveDeLista = {
  [K in keyof CatalogueFilters]: CatalogueFilters[K] extends readonly unknown[] ? K : never;
}[keyof CatalogueFilters];

export function toggleFilter<K extends ChaveDeLista>(
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

/** Liga ou desliga uma label dentro do seu grupo. Grupos vazios saem do registo, para não crescer. */
export function toggleLabel(
  filters: CatalogueFilters,
  group: string,
  id: string,
): CatalogueFilters {
  const atuais = filters.labels[group] ?? [];
  const proximas = atuais.includes(id) ? atuais.filter((l) => l !== id) : [...atuais, id];

  const labels = { ...filters.labels };
  if (proximas.length === 0) delete labels[group];
  else labels[group] = proximas;

  return { ...filters, labels };
}

/** Está escolhida? Precisa do grupo porque é lá que ela vive. */
export function hasLabel(filters: CatalogueFilters, group: string, id: string): boolean {
  return (filters.labels[group] ?? []).includes(id);
}
