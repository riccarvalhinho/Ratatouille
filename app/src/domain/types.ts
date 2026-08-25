/**
 * Tipos do domínio.
 *
 * Estes tipos são o espelho de data/schema/*.json. O schema é o contrato — alterar um campo
 * significa alterar o schema primeiro e este ficheiro depois, nunca ao contrário.
 */

/** Como se confeciona. Responde a "tenho de ligar o forno?" e alimenta a estimativa de `weight`. */
export type CookingMethod =
  | 'forno'
  | 'tacho'
  | 'frigideira'
  | 'grelhador'
  | 'airfryer'
  | 'micro-ondas'
  | 'sem-confecao';

export const COOKING_METHOD_NAMES: Record<CookingMethod, string> = {
  forno: 'Forno',
  tacho: 'Tacho',
  frigideira: 'Frigideira',
  grelhador: 'Grelhador',
  airfryer: 'Air fryer',
  'micro-ondas': 'Micro-ondas',
  'sem-confecao': 'Sem confeção',
};

/**
 * Quão substancial é a refeição, sempre comparada com outras do mesmo tipo de prato — uma sobremesa
 * compara-se com sobremesas. Substitui a ideia de uma etiqueta "saudável", que é um juízo que convida
 * à discussão e não muda o que se cozinha hoje.
 */
export type Weight = 'leve' | 'equilibrado' | 'substancial';

export const WEIGHT_NAMES: Record<Weight, string> = {
  leve: 'Leve',
  equilibrado: 'Equilibrado',
  substancial: 'Substancial',
};

/*
 * Só almoço e jantar (Q6, decidida).
 *
 * O pequeno-almoço e o lanche não se planeiam — não há decisão a tomar sobre eles de véspera, e
 * duas linhas mortas na grelha custavam metade da altura útil de cada célula. Acrescentam-se ao
 * schema e a esta lista no dia em que isso mudar; nada mais no código sabe quantos blocos há.
 *
 * Nota para não confundir: "Pequeno-almoço" continua a existir como **label** de tipo de prato em
 * data/taxonomies/labels.json. Uma receita pode ser de pequeno-almoço sem haver um bloco para ela.
 */
export type MealBlock = 'almoco' | 'jantar';

/** Ordem por que os blocos aparecem no dia. */
export const MEAL_BLOCKS: readonly MealBlock[] = ['almoco', 'jantar'];

export const MEAL_BLOCK_NAMES: Record<MealBlock, string> = {
  almoco: 'Almoço',
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
  /** Pressupõe-se em qualquer cozinha. A app não o mostra — só interessa o que pode impedir alguém. */
  comum?: boolean;
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
  /** Estruturada e não enterrada no texto: o modo cozinha mostra-a como dado ao lado do temporizador. */
  temperatureC?: number;
  /** Passo em que se sai da cozinha. Um passo passivo avisa quando acaba; um ativo não precisa. */
  passive?: boolean;
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
  saturatedFatGrams?: number;
  fibreGrams?: number;
  /** Sal em gramas, como nos rótulos portugueses. */
  saltGrams?: number;
}

export interface RecipeSource {
  kind?: 'propria' | 'familia' | 'livro' | 'web' | 'video' | 'importada';
  title?: string;
  /** Autor, canal ou publicação de origem. */
  author?: string;
  url?: string;
}

/**
 * Estado de revisão. Ausente significa `revisto` — uma receita escrita à mão está revista por quem
 * a escreveu. O importador escreve sempre `rascunho`, com os buracos listados em `gaps`.
 */
export type RecipeStatus = 'rascunho' | 'revisto';

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  /** A receita em texto corrido, numa transcrição nossa. Nunca o texto original de outra pessoa. */
  narrative?: string;
  status?: RecipeStatus;
  /** Campos que o importador não conseguiu determinar — as perguntas que a revisão vai fazer. */
  gaps?: string[];
  image?: string;
  /**
   * Atribuição da imagem. Obrigatória quando a fotografia vem de um banco de licença livre — as
   * licenças CC BY e CC BY-SA exigem crédito, e as APIs do Pexels e do Pixabay pedem que se diga de
   * onde veio. Ver `data/schema/recipe.schema.json` e `media/README.md`.
   */
  imageCredit?: {
    author?: string;
    license: string;
    licenseUrl?: string;
    sourceUrl?: string;
  };
  /** Opcional: há receitas que rendem unidades e não pessoas. Existe sempre `servings` ou `yield`. */
  servings?: number;
  /** Rendimento que não são pessoas: "30 bolachas", "1 bolo de 24 cm". */
  yield?: string;
  labels: string[];
  methods: CookingMethod[];
  weight?: Weight;
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
