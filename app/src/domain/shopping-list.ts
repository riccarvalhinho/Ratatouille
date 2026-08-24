/**
 * Lista de compras, derivada do plano da semana. Ver docs/specs/004-lista-de-compras.md.
 *
 * O trabalho todo é agregação: percorrer as receitas planeadas, somar o mesmo ingrediente canónico
 * entre elas, e agrupar por zona de supermercado. Não há aqui nada de interface — isto é lógica pura
 * e testável, e é de propósito.
 */
import type { Aisle, Ingredient, Recipe, WeekPlan } from './types.ts';
import { addQuantities, formatForShopping, toBase, type Quantity } from './units.ts';

export interface ShoppingItem {
  ingredientId: string;
  name: string;
  /** Já em linguagem de supermercado: "4 cebolas", "1,5 kg", ou vazio quando é "q.b.". */
  amount: string;
  /** Ingredientes de despensa vão para um grupo à parte, para se ignorarem de relance (questão Q9). */
  staple: boolean;
  /** De que receitas vem — para decidir se vale a pena, quando só se usa numa. */
  fromRecipes: string[];
  /**
   * Quantidades que não se conseguiram somar entre si por estarem em grandezas incompatíveis.
   * Mostrar em vez de esconder: um erro visível é melhor do que um total errado.
   */
  unmergedAmounts?: string[];
}

export interface ShoppingGroup {
  aisle: Aisle | 'despensa';
  title: string;
  items: ShoppingItem[];
}

export const AISLE_NAMES: Record<Aisle | 'despensa', string> = {
  'frutas-e-legumes': 'Frutas e legumes',
  talho: 'Talho',
  peixaria: 'Peixaria',
  'laticinios-e-ovos': 'Laticínios e ovos',
  mercearia: 'Mercearia',
  congelados: 'Congelados',
  padaria: 'Padaria',
  bebidas: 'Bebidas',
  outros: 'Outros',
  despensa: 'Já deves ter em casa',
};

/** Ordem por que se percorre a loja. Os artigos de despensa ficam no fim, para se saltarem. */
const AISLE_ORDER: (Aisle | 'despensa')[] = [
  'frutas-e-legumes',
  'talho',
  'peixaria',
  'laticinios-e-ovos',
  'padaria',
  'congelados',
  'mercearia',
  'bebidas',
  'outros',
  'despensa',
];

interface Accumulator {
  ingredient: Ingredient | undefined;
  ingredientId: string;
  /** Uma entrada por grandeza. Normalmente só há uma; mais do que uma significa que não deu para somar. */
  byDimension: Map<string, Quantity>;
  /** Alguma receita pediu este ingrediente sem quantidade ("q.b."). */
  hasUnquantified: boolean;
  fromRecipes: Set<string>;
}

/**
 * Constrói a lista de compras de uma semana.
 *
 * `servingsScale` permite pedir mais ou menos doses do que a receita declara — as quantidades
 * escalam, os tempos não (conversa 1).
 */
export function buildShoppingList(
  plan: WeekPlan,
  recipesById: Map<string, Recipe>,
  ingredientsById: Map<string, Ingredient>,
): ShoppingGroup[] {
  const accumulators = new Map<string, Accumulator>();

  for (const day of plan.days) {
    for (const entries of Object.values(day.blocks)) {
      for (const entry of entries ?? []) {
        const recipe = recipesById.get(entry.recipeId);
        if (!recipe) continue;

        // Doses pedidas diferentes das declaradas escalam as quantidades proporcionalmente.
        const scale =
          entry.servings && recipe.servings ? entry.servings / recipe.servings : 1;

        for (const item of recipe.ingredients) {
          const ingredient = ingredientsById.get(item.ref);
          let acc = accumulators.get(item.ref);
          if (!acc) {
            acc = {
              ingredient,
              ingredientId: item.ref,
              byDimension: new Map(),
              hasUnquantified: false,
              fromRecipes: new Set(),
            };
            accumulators.set(item.ref, acc);
          }
          acc.fromRecipes.add(recipe.name);

          if (item.quantity === undefined || item.unit === undefined) {
            acc.hasUnquantified = true;
            continue;
          }

          const base = toBase(item.quantity * scale, item.unit, ingredient);
          if (!base) {
            acc.hasUnquantified = true;
            continue;
          }

          const existing = acc.byDimension.get(base.dimension);
          acc.byDimension.set(
            base.dimension,
            existing ? (addQuantities(existing, base) ?? base) : base,
          );
        }
      }
    }
  }

  const byAisle = new Map<Aisle | 'despensa', ShoppingItem[]>();

  for (const acc of accumulators.values()) {
    const quantities = [...acc.byDimension.values()];
    const formatted = quantities.map((q) => formatForShopping(q, acc.ingredient));

    const item: ShoppingItem = {
      ingredientId: acc.ingredientId,
      name: acc.ingredient?.name ?? acc.ingredientId,
      amount: formatted[0] ?? '',
      staple: acc.ingredient?.staple ?? false,
      fromRecipes: [...acc.fromRecipes].sort((a, b) => a.localeCompare(b, 'pt')),
    };
    if (formatted.length > 1) item.unmergedAmounts = formatted.slice(1);

    const key: Aisle | 'despensa' = item.staple ? 'despensa' : (acc.ingredient?.aisle ?? 'outros');
    const list = byAisle.get(key);
    if (list) list.push(item);
    else byAisle.set(key, [item]);
  }

  return AISLE_ORDER.filter((aisle) => byAisle.has(aisle)).map((aisle) => ({
    aisle,
    title: AISLE_NAMES[aisle],
    items: (byAisle.get(aisle) ?? []).sort((a, b) => a.name.localeCompare(b.name, 'pt')),
  }));
}
