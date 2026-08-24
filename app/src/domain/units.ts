/**
 * Conversão de unidades.
 *
 * Existe por uma razão só: a lista de compras tem de conseguir somar "2 cebolas" com "200 g de
 * cebola" e dar um número. Sem isto, o ADR 0002 — ingredientes como referências e não texto livre —
 * não serve para nada.
 *
 * A estratégia é reduzir tudo a uma **base canónica por ingrediente**, e só depois voltar a
 * apresentar na unidade que faz sentido para quem vai ao supermercado. Ninguém compra 440 g de
 * cebola; compra quatro cebolas.
 */
import type { Ingredient, Unit } from './types.ts';

/** Em que grandeza uma quantidade está expressa. */
export type Dimension = 'massa' | 'volume' | 'contagem';

export interface Quantity {
  amount: number;
  dimension: Dimension;
}

/** Colheres e pitadas são medidas de cozinha, não do sistema métrico. Estes são os equivalentes usados. */
const SPOON_ML: Partial<Record<Unit, number>> = {
  csopa: 15,
  ccha: 5,
};

/** Uma pitada não tem definição oficial. 0,4 g é o valor de trabalho, e só afeta sal e especiarias. */
const PINCH_GRAMS = 0.4;

/**
 * Reduz uma quantidade à base canónica do ingrediente.
 *
 * A base preferida é sempre a mais convertível: gramas quando há como lá chegar, porque é a grandeza
 * para a qual mais coisas convergem. Devolve `undefined` quando não há informação suficiente — o que
 * é um resultado legítimo e não um erro, e a lista de compras trata-o mostrando o item sem quantidade.
 */
export function toBase(
  quantity: number,
  unit: Unit,
  ingredient: Ingredient | undefined,
): Quantity | undefined {
  switch (unit) {
    case 'g':
      return { amount: quantity, dimension: 'massa' };
    case 'kg':
      return { amount: quantity * 1000, dimension: 'massa' };

    case 'ml':
    case 'l': {
      const ml = unit === 'l' ? quantity * 1000 : quantity;
      // Com densidade dá para ir a gramas, que soma com mais coisas.
      if (ingredient?.density) return { amount: ml * ingredient.density, dimension: 'massa' };
      return { amount: ml, dimension: 'volume' };
    }

    case 'csopa':
    case 'ccha': {
      const ml = quantity * (SPOON_ML[unit] ?? 0);
      if (ingredient?.density) return { amount: ml * ingredient.density, dimension: 'massa' };
      return { amount: ml, dimension: 'volume' };
    }

    case 'pitada':
      return { amount: quantity * PINCH_GRAMS, dimension: 'massa' };

    case 'un': {
      // Uma unidade só vira massa se soubermos quanto pesa uma.
      if (ingredient?.unitGramsPerUnit) {
        return { amount: quantity * ingredient.unitGramsPerUnit, dimension: 'massa' };
      }
      return { amount: quantity, dimension: 'contagem' };
    }

    case 'qb':
      // "Quanto baste" não tem quantidade. Não se soma, e não se inventa.
      return undefined;
  }
}

/** Duas quantidades só se somam se estiverem na mesma grandeza. */
export function addQuantities(a: Quantity, b: Quantity): Quantity | undefined {
  if (a.dimension !== b.dimension) return undefined;
  return { amount: a.amount + b.amount, dimension: a.dimension };
}

/**
 * Volta a pôr uma quantidade em linguagem de supermercado.
 *
 * Arredonda **para cima** nos ingredientes vendidos à unidade: não se compram 3,6 cebolas, e ficar
 * a faltar meia cebola é pior do que sobrar meia.
 */
export function formatForShopping(quantity: Quantity, ingredient: Ingredient | undefined): string {
  const { amount, dimension } = quantity;

  if (dimension === 'massa') {
    // Ingredientes vendidos à unidade apresentam-se à unidade, mesmo tendo sido somados em gramas.
    if (ingredient?.unitGramsPerUnit) {
      const units = Math.ceil(amount / ingredient.unitGramsPerUnit);
      const name = units > 1 ? (ingredient.plural ?? ingredient.name) : ingredient.name;
      return `${units} ${name.toLowerCase()}`;
    }
    if (amount >= 1000) return `${trim(amount / 1000)} kg`;
    return `${trim(amount)} g`;
  }

  if (dimension === 'volume') {
    if (amount >= 1000) return `${trim(amount / 1000)} l`;
    return `${trim(amount)} ml`;
  }

  const units = Math.ceil(amount);
  const name = ingredient
    ? units > 1
      ? (ingredient.plural ?? ingredient.name)
      : ingredient.name
    : '';
  return name ? `${units} ${name.toLowerCase()}` : String(units);
}

/** Sem casas decimais inúteis, e com vírgula, que é o separador decimal português. */
function trim(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return (Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)).replace('.', ',');
}
