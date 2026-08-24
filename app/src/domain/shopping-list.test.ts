import { describe, expect, it } from 'vitest';
import { buildShoppingList } from './shopping-list.ts';
import type { Ingredient, Recipe, WeekPlan } from './types.ts';

const ingredients: Ingredient[] = [
  { id: 'cebola', name: 'Cebola', plural: 'Cebolas', aisle: 'frutas-e-legumes', unitGramsPerUnit: 120 },
  { id: 'batata', name: 'Batata', plural: 'Batatas', aisle: 'frutas-e-legumes', unitGramsPerUnit: 150 },
  { id: 'sal', name: 'Sal', aisle: 'mercearia', staple: true },
  { id: 'azeite', name: 'Azeite', aisle: 'mercearia', staple: true, density: 0.92 },
  { id: 'bacalhau', name: 'Bacalhau', aisle: 'peixaria' },
  { id: 'natas', name: 'Natas', aisle: 'laticinios-e-ovos', density: 1 },
];
const ingredientsById = new Map(ingredients.map((i) => [i.id, i]));

function recipe(id: string, name: string, items: Recipe['ingredients'], servings = 4): Recipe {
  return {
    id,
    name,
    servings,
    labels: ['prato-principal'],
    methods: ['tacho'],
    timing: { prepMinutes: 10, cookMinutes: 20 },
    ingredients: items,
    steps: [{ text: 'Fazer.' }],
  };
}

const sopa = recipe('sopa', 'Sopa', [
  { ref: 'cebola', quantity: 1, unit: 'un' },
  { ref: 'batata', quantity: 600, unit: 'g' },
  { ref: 'sal', unit: 'qb' },
  { ref: 'azeite', quantity: 4, unit: 'csopa' },
]);

const bacalhau = recipe('bacalhau', 'Bacalhau com natas', [
  { ref: 'cebola', quantity: 200, unit: 'g' },
  { ref: 'batata', quantity: 800, unit: 'g' },
  { ref: 'bacalhau', quantity: 600, unit: 'g' },
  { ref: 'natas', quantity: 400, unit: 'ml' },
  { ref: 'sal', unit: 'qb' },
]);

const recipesById = new Map([sopa, bacalhau].map((r) => [r.id, r]));

function planWith(entries: { recipeId: string; servings?: number }[]): WeekPlan {
  return { week: '2026-W35', days: [{ date: '2026-08-24', blocks: { jantar: entries } }] };
}

function find(groups: ReturnType<typeof buildShoppingList>, id: string) {
  return groups.flatMap((g) => g.items).find((i) => i.ingredientId === id);
}

describe('buildShoppingList', () => {
  const groups = buildShoppingList(
    planWith([{ recipeId: 'sopa' }, { recipeId: 'bacalhau' }]),
    recipesById,
    ingredientsById,
  );

  it('soma o mesmo ingrediente entre receitas, atravessando unidades', () => {
    // 1 cebola (120 g) + 200 g = 320 g = 2,67 cebolas, arredondado para cima
    expect(find(groups, 'cebola')?.amount).toBe('3 cebolas');
    // 600 g + 800 g = 1400 g = 9,33 batatas
    expect(find(groups, 'batata')?.amount).toBe('10 batatas');
  });

  it('agrupa por zona de supermercado', () => {
    const frutas = groups.find((g) => g.aisle === 'frutas-e-legumes');
    expect(frutas?.items.map((i) => i.ingredientId).sort()).toEqual(['batata', 'cebola']);
    expect(groups.find((g) => g.aisle === 'peixaria')?.items[0]?.ingredientId).toBe('bacalhau');
  });

  it('põe os ingredientes de despensa num grupo à parte, no fim', () => {
    expect(groups[groups.length - 1]?.aisle).toBe('despensa');
    expect(groups[groups.length - 1]?.items.map((i) => i.ingredientId).sort()).toEqual([
      'azeite',
      'sal',
    ]);
  });

  it('não inventa quantidade para "q.b."', () => {
    expect(find(groups, 'sal')?.amount).toBe('');
  });

  it('diz de que receitas vem cada item', () => {
    expect(find(groups, 'cebola')?.fromRecipes).toEqual(['Bacalhau com natas', 'Sopa']);
    expect(find(groups, 'bacalhau')?.fromRecipes).toEqual(['Bacalhau com natas']);
  });

  it('converte colheres de sopa em massa através da densidade', () => {
    // 4 colheres de sopa = 60 ml × 0,92 = 55,2 g
    expect(find(groups, 'azeite')?.amount).toBe('55,2 g');
  });
});

describe('doses', () => {
  it('escala as quantidades quando o plano pede doses diferentes', () => {
    const groups = buildShoppingList(
      planWith([{ recipeId: 'bacalhau', servings: 8 }]),
      recipesById,
      ingredientsById,
    );
    // receita para 4, pedidas 8 → dobro: 600 g de bacalhau passam a 1,2 kg
    expect(find(groups, 'bacalhau')?.amount).toBe('1,2 kg');
    // 400 ml de natas, densidade 1, a dobrar → 800 g
    expect(find(groups, 'natas')?.amount).toBe('800 g');
  });

  it('conta duas vezes a mesma receita planeada duas vezes', () => {
    const groups = buildShoppingList(
      planWith([{ recipeId: 'bacalhau' }, { recipeId: 'bacalhau' }]),
      recipesById,
      ingredientsById,
    );
    expect(find(groups, 'bacalhau')?.amount).toBe('1,2 kg');
  });
});

describe('casos difíceis', () => {
  it('não esconde quantidades que não deu para somar', () => {
    const semDensidade: Ingredient = { id: 'xarope', name: 'Xarope', aisle: 'mercearia' };
    const a = recipe('a', 'A', [{ ref: 'xarope', quantity: 100, unit: 'ml' }]);
    const b = recipe('b', 'B', [{ ref: 'xarope', quantity: 50, unit: 'g' }]);
    const groups = buildShoppingList(
      planWith([{ recipeId: 'a' }, { recipeId: 'b' }]),
      new Map([a, b].map((r) => [r.id, r])),
      new Map([[semDensidade.id, semDensidade]]),
    );
    const item = find(groups, 'xarope');
    // Sem densidade, ml e g não se somam. Mostram-se os dois em vez de dar um total errado.
    expect(item?.amount).toBe('100 ml');
    expect(item?.unmergedAmounts).toEqual(['50 g']);
  });

  it('ignora receitas planeadas que já não existem', () => {
    const groups = buildShoppingList(
      planWith([{ recipeId: 'apagada' }, { recipeId: 'sopa' }]),
      recipesById,
      ingredientsById,
    );
    expect(groups.flatMap((g) => g.items).length).toBeGreaterThan(0);
    expect(find(groups, 'bacalhau')).toBeUndefined();
  });

  it('devolve lista vazia para uma semana sem nada planeado', () => {
    expect(buildShoppingList({ week: '2026-W35', days: [] }, recipesById, ingredientsById)).toEqual([]);
  });
});
