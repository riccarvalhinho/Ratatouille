import { describe, expect, it } from 'vitest';
import { scaleRecipe } from './scaling.ts';
import type { Recipe } from './types.ts';

const base: Recipe = {
  id: 'bolo',
  name: 'Bolo',
  servings: 4,
  labels: ['sobremesa'],
  methods: ['forno'],
  timing: { prepMinutes: 15, cookMinutes: 40 },
  ingredients: [
    { ref: 'farinha', quantity: 250, unit: 'g' },
    { ref: 'ovo', quantity: 3, unit: 'un' },
    { ref: 'sal', unit: 'qb' },
    { ref: 'azeite', quantity: 2, unit: 'csopa' },
  ],
  steps: [{ text: 'Fazer.' }],
};

const qty = (r: ReturnType<typeof scaleRecipe>, ref: string) =>
  r.ingredients.find((i) => i.ref === ref);

describe('scaleRecipe', () => {
  it('escala as quantidades e as doses', () => {
    const doubled = scaleRecipe(base, 2);
    expect(doubled.servings).toBe(8);
    expect(qty(doubled, 'farinha')?.quantity).toBe(500);
    expect(qty(doubled, 'azeite')?.quantity).toBe(4);
  });

  it('não escala "quanto baste"', () => {
    const doubled = scaleRecipe(base, 2);
    expect(qty(doubled, 'sal')?.quantity).toBeUndefined();
    expect(qty(doubled, 'sal')?.unit).toBe('qb');
  });

  it('não escala os tempos — o dobro da massa não coze o dobro do tempo', () => {
    expect(scaleRecipe(base, 3).timingUnchanged).toBe(true);
  });

  it('marca como problemática uma quantidade discreta que ficou fraccionada', () => {
    // metade de 3 ovos são 1,5 ovos, e meio ovo não existe
    const halved = scaleRecipe(base, 0.5);
    expect(qty(halved, 'ovo')?.quantity).toBe(1.5);
    expect(qty(halved, 'ovo')?.awkward).toBe(true);
  });

  it('não marca nada quando a divisão dá certo', () => {
    const doubled = scaleRecipe(base, 2);
    expect(qty(doubled, 'ovo')?.quantity).toBe(6);
    expect(qty(doubled, 'ovo')?.awkward).toBeUndefined();
    // gramas podem ser fraccionadas à vontade
    expect(qty(scaleRecipe(base, 0.5), 'farinha')?.awkward).toBeUndefined();
  });

  it('não produz lixo de vírgula flutuante', () => {
    const r = scaleRecipe({ ...base, ingredients: [{ ref: 'x', quantity: 0.1, unit: 'g' }] }, 3);
    expect(r.ingredients[0]?.quantity).toBe(0.3);
  });

  it('aguenta receitas sem doses declaradas', () => {
    const bolachas: Recipe = { ...base, servings: undefined, yield: '30 bolachas' };
    const doubled = scaleRecipe(bolachas, 2);
    expect(doubled.servings).toBeUndefined();
    expect(doubled.yield).toBe('30 bolachas');
    expect(qty(doubled, 'farinha')?.quantity).toBe(500);
  });

  it('não altera a receita original', () => {
    scaleRecipe(base, 3);
    expect(base.ingredients[0]?.quantity).toBe(250);
    expect(base.servings).toBe(4);
  });
});
