import { describe, expect, it } from 'vitest';
import { buildHistory, countCookedByRecipe, countDistinctRecipes, formatTotalCooked } from './history.ts';
import type { HistoryEntry, Recipe } from './types.ts';

function receita(id: string, name: string): Recipe {
  return { id, name } as Recipe;
}

const ENTRIES: HistoryEntry[] = [
  { recipeId: 'caldo-verde', date: '2026-08-17', block: 'jantar' },
  { recipeId: 'caril-de-frango', date: '2026-09-02' },
  { recipeId: 'caldo-verde', date: '2026-09-15', block: 'almoco' },
];

const RECEITAS = new Map([
  ['caldo-verde', receita('caldo-verde', 'Caldo verde')],
  ['caril-de-frango', receita('caril-de-frango', 'Caril de frango')],
]);

describe('contagens do histórico', () => {
  it('conta as vezes de cada receita', () => {
    const counts = countCookedByRecipe(ENTRIES);
    expect(counts.get('caldo-verde')).toBe(2);
    expect(counts.get('caril-de-frango')).toBe(1);
  });

  it('conta receitas diferentes, e não refeições', () => {
    expect(countDistinctRecipes(ENTRIES)).toBe(2);
    expect(countDistinctRecipes([])).toBe(0);
  });

  it('diz a contagem por palavras', () => {
    expect(formatTotalCooked(1)).toBe('primeira vez');
    expect(formatTotalCooked(4)).toBe('4 vezes ao todo');
  });
});

describe('histórico para leitura', () => {
  it('põe as mais recentes primeiro, seja qual for a ordem de chegada', () => {
    const items = buildHistory(ENTRIES, RECEITAS);
    expect(items.map((item) => item.entry.date)).toEqual(['2026-09-15', '2026-09-02', '2026-08-17']);
  });

  it('junta a receita e o total a cada entrada', () => {
    const [primeira] = buildHistory(ENTRIES, RECEITAS);
    expect(primeira!.recipe?.name).toBe('Caldo verde');
    // O total é o da receita no histórico inteiro, e não o que vai até àquela data.
    expect(primeira!.total).toBe(2);
  });

  it('aguenta uma entrada cuja receita já não está no catálogo', () => {
    const items = buildHistory([{ recipeId: 'receita-apagada', date: '2026-09-15' }], RECEITAS);
    expect(items).toHaveLength(1);
    expect(items[0]!.recipe).toBeUndefined();
    expect(items[0]!.total).toBe(1);
  });

  it('dá chaves diferentes a entradas iguais, para as listas não colapsarem', () => {
    const repetida: HistoryEntry[] = [
      { recipeId: 'caldo-verde', date: '2026-09-15', block: 'almoco' },
      { recipeId: 'caldo-verde', date: '2026-09-15', block: 'jantar' },
    ];
    const chaves = buildHistory(repetida, RECEITAS).map((item) => item.key);
    expect(new Set(chaves).size).toBe(2);
  });
});
