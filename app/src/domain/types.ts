/**
 * Tipos do domínio.
 *
 * Estes tipos são o espelho de data/schema/*.json. O schema é o contrato — alterar um campo
 * significa alterar o schema primeiro e este ficheiro depois, nunca ao contrário.
 */

export type Difficulty = 'facil' | 'medio' | 'dificil';

export type MealBlock = 'pequeno-almoco' | 'almoco' | 'lanche' | 'jantar';

/** Ordem por que os blocos aparecem no dia. */
export const MEAL_BLOCKS: readonly MealBlock[] = ['pequeno-almoco', 'almoco', 'lanche', 'jantar'];

export const MEAL_BLOCK_NAMES: Record<MealBlock, string> = {
  'pequeno-almoco': 'Pequeno-almoço',
  almoco: 'Almoço',
  lanche: 'Lanche',
  jantar: 'Jantar',
};

export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'un' | 'csopa' | 'ccha' | 'pitada' | 'qb';

export type LabelGroup = 'tipo-de-prato' | 'proteina' | 'regime' | 'ocasiao';

export type Aisle =
  | 'frutas-e-legumes'
  | 'talho'
  | 'peixaria'
  | 'laticinios-e-ovos'
  | 'mercearia'
  | 'congelados'
  | 'padaria'
  | 'bebidas'
  | 'outros';

export interface Label {
  id: string;
  name: string;
  group: LabelGroup;
}

export interface Ingredient {
  id: string;
  name: string;
  plural?: string;
  aisle: Aisle;
  /** Coisas que se têm sempre em casa. Vão para um grupo à parte na lista de compras. */
  staple?: boolean;
  /** Peso médio de uma unidade, para converter "2 cebolas" em gramas ao agregar compras. */
  unitGramsPerUnit?: number;
  /** g por ml, para converter volume em peso. */
  density?: number;
}

export interface Equipment {
  id: string;
  name: string;
  kind?: 'eletrodomestico' | 'utensilio';
}

export interface RecipeIngredient {
  ref: string;
  quantity?: number;
  unit?: Unit;
  note?: string;
  optional?: boolean;
}

export interface RecipeStep {
  text: string;
  durationMinutes?: number;
  ingredientRefs?: string[];
}

/** Antecedência que não é tempo ativo: marinar, demolhar, levedar. Não se soma aos outros tempos. */
export interface PrepAhead {
  minutes: number;
  description: string;
}

export interface RecipeTiming {
  prepMinutes: number;
  cookMinutes: number;
  prepAhead?: PrepAhead;
}

export interface Nutrition {
  method: 'calculado' | 'estimado';
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fibreGrams?: number;
  saltGrams?: number;
  nutriScore?: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface RecipeSource {
  kind?: 'propria' | 'familia' | 'livro' | 'web' | 'importada';
  title?: string;
  url?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  image?: string;
  servings: number;
  difficulty: Difficulty;
  labels: string[];
  timing: RecipeTiming;
  equipment?: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition?: Nutrition;
  source?: RecipeSource;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanEntry {
  recipeId: string;
  servings?: number;
  cooked?: boolean;
  note?: string;
}

export interface PlanDay {
  /** Data ISO, AAAA-MM-DD. */
  date: string;
  blocks: Partial<Record<MealBlock, PlanEntry[]>>;
}

export interface WeekPlan {
  /** Semana ISO, ex.: 2026-W35. */
  week: string;
  days: PlanDay[];
}

export interface HistoryEntry {
  recipeId: string;
  date: string;
  block?: MealBlock;
  rating?: number;
  note?: string;
}

/** O que tools/build-bundle.ts produz e a app descarrega de uma vez. */
export interface DataBundle {
  formatVersion: number;
  generatedAt: string;
  recipes: Recipe[];
  plans: WeekPlan[];
  taxonomies: {
    labels: Label[];
    ingredients: Ingredient[];
    equipment: Equipment[];
  };
  favourites: string[];
  history: HistoryEntry[];
}

/** Versão de formato que esta build da app sabe ler. */
export const SUPPORTED_BUNDLE_FORMAT = 1;
