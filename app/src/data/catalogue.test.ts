import { describe, expect, it } from 'vitest';
import { describeIngredient } from './catalogue.ts';
import type { Ingredient } from '../domain/types.ts';

const coxa: Ingredient = {
  id: 'coxa-de-frango',
  name: 'Coxa de frango',
  plural: 'Coxas de frango',
  aisle: 'talho',
};
const batata: Ingredient = { id: 'batata', name: 'Batata', plural: 'Batatas', aisle: 'frutas-e-legumes' };
const azeite: Ingredient = { id: 'azeite', name: 'Azeite', aisle: 'mercearia' };
const sal: Ingredient = { id: 'sal', name: 'Sal', aisle: 'mercearia' };

describe('describeIngredient', () => {
  it('não parte nomes canónicos que contêm "de"', () => {
    // o bug que isto substitui dava name "frango" e quantidade "4 Coxas"
    expect(describeIngredient({ ref: 'coxa-de-frango', quantity: 4, unit: 'un' }, coxa)).toEqual({
      name: 'Coxas de frango',
      amount: '4',
    });
  });

  it('à unidade, o número chega — o nome já diz o que se conta', () => {
    expect(describeIngredient({ ref: 'batata', quantity: 1, unit: 'un' }, batata)).toEqual({
      name: 'Batata',
      amount: '1',
    });
    expect(describeIngredient({ ref: 'batata', quantity: 3, unit: 'un' }, batata)).toEqual({
      name: 'Batatas',
      amount: '3',
    });
  });

  it('com unidade de medida, o nome fica no singular', () => {
    expect(describeIngredient({ ref: 'batata', quantity: 600, unit: 'g' }, batata)).toEqual({
      name: 'Batata',
      amount: '600 g',
    });
  });

  it('escreve as colheres por extenso abreviado', () => {
    expect(describeIngredient({ ref: 'azeite', quantity: 4, unit: 'csopa' }, azeite).amount).toBe('4 c. sopa');
    expect(describeIngredient({ ref: 'azeite', quantity: 1, unit: 'ccha' }, azeite).amount).toBe('1 c. chá');
  });

  it('usa vírgula decimal', () => {
    expect(describeIngredient({ ref: 'azeite', quantity: 2.5, unit: 'ml' }, azeite).amount).toBe('2,5 ml');
  });

  it('"q.b." não ganha número', () => {
    expect(describeIngredient({ ref: 'sal', unit: 'qb' }, sal)).toEqual({ name: 'Sal', amount: 'q.b.' });
  });

  it('aguenta um ingrediente que não está na taxonomia', () => {
    expect(describeIngredient({ ref: 'desconhecido', quantity: 2, unit: 'un' }, undefined)).toEqual({
      name: 'desconhecido',
      amount: '2',
    });
  });
});
