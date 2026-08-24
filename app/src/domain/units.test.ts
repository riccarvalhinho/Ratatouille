import { describe, expect, it } from 'vitest';
import { addQuantities, formatForShopping, toBase } from './units.ts';
import type { Ingredient } from './types.ts';

const cebola: Ingredient = {
  id: 'cebola',
  name: 'Cebola',
  plural: 'Cebolas',
  aisle: 'frutas-e-legumes',
  unitGramsPerUnit: 120,
};
const azeite: Ingredient = { id: 'azeite', name: 'Azeite', aisle: 'mercearia', density: 0.92 };
const farinha: Ingredient = { id: 'farinha', name: 'Farinha', aisle: 'mercearia' };
const limao: Ingredient = { id: 'limao', name: 'Limão', plural: 'Limões', aisle: 'frutas-e-legumes' };

describe('toBase', () => {
  it('normaliza massa', () => {
    expect(toBase(1.5, 'kg', farinha)).toEqual({ amount: 1500, dimension: 'massa' });
    expect(toBase(200, 'g', farinha)).toEqual({ amount: 200, dimension: 'massa' });
  });

  it('converte volume em massa quando há densidade', () => {
    expect(toBase(100, 'ml', azeite)).toEqual({ amount: 92, dimension: 'massa' });
  });

  it('mantém volume quando não há densidade', () => {
    expect(toBase(250, 'ml', farinha)).toEqual({ amount: 250, dimension: 'volume' });
  });

  it('trata colheres como medidas de volume', () => {
    // 2 colheres de sopa de azeite = 30 ml × 0,92
    expect(toBase(2, 'csopa', azeite)).toEqual({ amount: 27.6, dimension: 'massa' });
    expect(toBase(1, 'ccha', farinha)).toEqual({ amount: 5, dimension: 'volume' });
  });

  it('converte unidades em massa quando se sabe quanto pesa uma', () => {
    expect(toBase(2, 'un', cebola)).toEqual({ amount: 240, dimension: 'massa' });
  });

  it('mantém contagem quando não se sabe o peso da unidade', () => {
    expect(toBase(3, 'un', limao)).toEqual({ amount: 3, dimension: 'contagem' });
  });

  it('não inventa quantidade para "quanto baste"', () => {
    expect(toBase(1, 'qb', farinha)).toBeUndefined();
  });

  it('não estoira sem ingrediente canónico', () => {
    expect(toBase(100, 'ml', undefined)).toEqual({ amount: 100, dimension: 'volume' });
    expect(toBase(2, 'un', undefined)).toEqual({ amount: 2, dimension: 'contagem' });
  });
});

describe('addQuantities', () => {
  it('soma dentro da mesma grandeza', () => {
    expect(addQuantities({ amount: 100, dimension: 'massa' }, { amount: 50, dimension: 'massa' })).toEqual({
      amount: 150,
      dimension: 'massa',
    });
  });

  it('recusa somar grandezas diferentes', () => {
    expect(
      addQuantities({ amount: 100, dimension: 'massa' }, { amount: 2, dimension: 'contagem' }),
    ).toBeUndefined();
  });
});

describe('formatForShopping', () => {
  it('apresenta à unidade o que se compra à unidade, arredondando para cima', () => {
    // 440 g de cebola = 3,67 cebolas. Ninguém compra 3,67 cebolas.
    expect(formatForShopping({ amount: 440, dimension: 'massa' }, cebola)).toBe('4 cebolas');
    expect(formatForShopping({ amount: 100, dimension: 'massa' }, cebola)).toBe('1 cebola');
  });

  it('sobe de g para kg quando faz sentido', () => {
    expect(formatForShopping({ amount: 1500, dimension: 'massa' }, farinha)).toBe('1,5 kg');
    expect(formatForShopping({ amount: 250, dimension: 'massa' }, farinha)).toBe('250 g');
  });

  it('sobe de ml para l quando faz sentido', () => {
    expect(formatForShopping({ amount: 1500, dimension: 'volume' }, farinha)).toBe('1,5 l');
    expect(formatForShopping({ amount: 200, dimension: 'volume' }, farinha)).toBe('200 ml');
  });

  it('usa o plural certo', () => {
    expect(formatForShopping({ amount: 3, dimension: 'contagem' }, limao)).toBe('3 limões');
    expect(formatForShopping({ amount: 1, dimension: 'contagem' }, limao)).toBe('1 limão');
  });

  it('usa vírgula decimal', () => {
    expect(formatForShopping({ amount: 1200, dimension: 'massa' }, farinha)).toBe('1,2 kg');
  });
});

describe('o caso que motivou tudo isto', () => {
  it('soma "2 cebolas" com "200 g de cebola" e dá cebolas', () => {
    const a = toBase(2, 'un', cebola);
    const b = toBase(200, 'g', cebola);
    const total = addQuantities(a!, b!);
    expect(total).toEqual({ amount: 440, dimension: 'massa' });
    expect(formatForShopping(total!, cebola)).toBe('4 cebolas');
  });
});
