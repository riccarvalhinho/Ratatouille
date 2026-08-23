/**
 * Índices e formatações derivadas do bundle.
 *
 * Como não há base de dados, é aqui que se faz o trabalho que um SELECT faria: resolver
 * referências e preparar os dados para a interface. Ver docs/adr/0002-dados-json-versionados.md.
 */
import type {
  DataBundle,
  Difficulty,
  Equipment,
  Ingredient,
  Label,
  Recipe,
  RecipeIngredient,
} from '../domain/types.ts';

export interface Catalogue {
  recipes: Recipe[];
  labelsById: Map<string, Label>;
  ingredientsById: Map<string, Ingredient>;
  equipmentById: Map<string, Equipment>;
  favourites: Set<string>;
  /** Data mais recente em que cada receita foi cozinhada, se alguma. */
  lastCookedByRecipe: Map<string, string>;
}

function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export function buildCatalogue(bundle: DataBundle): Catalogue {
  const lastCookedByRecipe = new Map<string, string>();
  for (const entry of bundle.history) {
    const known = lastCookedByRecipe.get(entry.recipeId);
    if (!known || entry.date > known) lastCookedByRecipe.set(entry.recipeId, entry.date);
  }

  return {
    recipes: [...bundle.recipes].sort((a, b) => a.name.localeCompare(b.name, 'pt')),
    labelsById: indexById(bundle.taxonomies.labels),
    ingredientsById: indexById(bundle.taxonomies.ingredients),
    equipmentById: indexById(bundle.taxonomies.equipment),
    favourites: new Set(bundle.favourites),
    lastCookedByRecipe,
  };
}

/** Uma receita sem `status` conta como revista: quem a escreveu à mão já a reviu. */
export function isDraft(recipe: Recipe): boolean {
  return recipe.status === 'rascunho';
}

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

/** Tempo total ativo: preparação mais confeção. A antecedência não entra, porque não é tempo ativo. */
export function activeMinutes(recipe: Recipe): number {
  return recipe.timing.prepMinutes + recipe.timing.cookMinutes;
}

/** "45 min", "1h", "1h30". */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, '0')}`;
}

/** Antecedência em linguagem de cozinha: "de véspera", "+2h". */
export function formatPrepAhead(minutes: number): string {
  if (minutes >= 1440) {
    const days = Math.round(minutes / 1440);
    return days === 1 ? 'de véspera' : `${days} dias antes`;
  }
  return `+${formatMinutes(minutes)}`;
}

const UNIT_NAMES: Record<string, string> = {
  csopa: 'c. sopa',
  ccha: 'c. chá',
  un: '',
  pitada: 'pitada',
};

/** "600 g de batata", "2 dentes de alho", "sal q.b." */
export function formatIngredient(item: RecipeIngredient, ingredient: Ingredient | undefined): string {
  const name = ingredient?.name ?? item.ref;
  const { quantity, unit } = item;

  if (unit === undefined || unit === 'qb' || quantity === undefined) {
    const base = `${name} q.b.`;
    return item.note ? `${base} (${item.note})` : base;
  }

  // Separador decimal português: 0,5 e não 0.5.
  const amount = String(quantity).replace('.', ',');
  const plural = quantity > 1 ? (ingredient?.plural ?? name) : name;
  const unitLabel = UNIT_NAMES[unit] ?? unit;

  const head = unitLabel === '' ? `${amount} ${plural}` : `${amount} ${unitLabel} de ${name}`;

  return item.note ? `${head}, ${item.note}` : head;
}

export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
}
