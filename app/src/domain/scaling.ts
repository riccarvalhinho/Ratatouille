/**
 * Escalar doses. Decidido na conversa 1: **só por múltiplos simples**.
 *
 * A restrição não é preguiça. Escalar para um número arbitrário parte em três sítios: os ovos são
 * discretos e meio ovo não existe, as formas de bolo têm o tamanho que têm, e o "q.b." não escala
 * de todo. Com múltiplos simples, a maior parte destes casos ou desaparece ou fica visível.
 *
 * E os tempos **não** escalam: o dobro da massa não coze o dobro do tempo.
 */
import type { Recipe, RecipeIngredient } from './types.ts';

/** Os múltiplos oferecidos. Metade, o normal, o dobro, o triplo. */
export const SCALE_FACTORS = [0.5, 1, 2, 3] as const;
export type ScaleFactor = (typeof SCALE_FACTORS)[number];

export interface ScaledIngredient extends RecipeIngredient {
  /**
   * A quantidade ficou fraccionada numa unidade que não se divide — meio ovo, meia lata.
   * Não se resolve sozinho: mostra-se ao utilizador para ele decidir.
   */
  awkward?: boolean;
}

export interface ScaledRecipe {
  factor: ScaleFactor;
  servings?: number;
  yield?: string;
  ingredients: ScaledIngredient[];
  /** Os tempos ficam iguais aos da receita. Repetido aqui para deixar a regra explícita. */
  timingUnchanged: true;
}

/** Unidades em que uma fração não faz sentido físico. */
const DISCRETE_UNITS = new Set(['un']);

export function scaleRecipe(recipe: Recipe, factor: ScaleFactor): ScaledRecipe {
  return {
    factor,
    servings: recipe.servings === undefined ? undefined : recipe.servings * factor,
    // O rendimento em texto livre não se consegue escalar sem interpretar a frase — fica como está,
    // e o número de doses ao lado dá o contexto.
    yield: recipe.yield,
    ingredients: recipe.ingredients.map((item) => scaleIngredient(item, factor)),
    timingUnchanged: true,
  };
}

function scaleIngredient(item: RecipeIngredient, factor: ScaleFactor): ScaledIngredient {
  // "Quanto baste" continua a ser quanto baste, seja para dois ou para doze.
  if (item.quantity === undefined || item.unit === undefined || item.unit === 'qb') return { ...item };

  const scaled = round(item.quantity * factor);
  const awkward = DISCRETE_UNITS.has(item.unit) && !Number.isInteger(scaled);

  const result: ScaledIngredient = { ...item, quantity: scaled };
  if (awkward) result.awkward = true;
  return result;
}

/** Duas casas decimais chegam para cozinha, e evitam 0.30000000000000004. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
