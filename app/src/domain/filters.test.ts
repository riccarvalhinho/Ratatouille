import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS, applyFilters, durationBandOf, toggleFilter } from './filters.ts';
import type { Recipe } from './types.ts';

function make(id: string, over: Partial<Recipe>): Recipe {
  return {
    id,
    name: id,
    servings: 4,
    labels: ['prato-principal'],
    methods: ['tacho'],
    timing: { prepMinutes: 10, cookMinutes: 20 },
    ingredients: [{ ref: 'sal', unit: 'qb' }],
    steps: [{ text: 'Fazer.' }],
    ...over,
  };
}

const salada = make('salada', {
  methods: ['sem-confecao'],
  weight: 'leve',
  labels: ['salada', 'peixe'],
  timing: { prepMinutes: 10, cookMinutes: 0 },
});
const assado = make('assado', {
  methods: ['forno'],
  weight: 'substancial',
  labels: ['prato-principal', 'carne'],
  timing: { prepMinutes: 20, cookMinutes: 70 },
});
const sopa = make('sopa', {
  methods: ['tacho'],
  weight: 'equilibrado',
  labels: ['sopa'],
  timing: { prepMinutes: 15, cookMinutes: 30 },
});
const gratinado = make('gratinado', {
  methods: ['forno', 'tacho'],
  weight: 'substancial',
  labels: ['prato-principal'],
  timing: { prepMinutes: 20, cookMinutes: 25 },
});

const all = [salada, assado, sopa, gratinado];
const ids = (rs: Recipe[]) => rs.map((r) => r.id).sort();

describe('durationBandOf', () => {
  it('classifica pelo tempo ativo', () => {
    expect(durationBandOf(salada)).toBe('ate-30');
    expect(durationBandOf(sopa)).toBe('30-60');
    expect(durationBandOf(assado)).toBe('mais-de-60');
  });

  it('a antecedência não conta para a duração', () => {
    const bacalhau = make('bacalhau', {
      timing: { prepMinutes: 10, cookMinutes: 10, prepAhead: { minutes: 1440, description: 'demolhar' } },
    });
    expect(durationBandOf(bacalhau)).toBe('ate-30');
  });
});

describe('applyFilters', () => {
  it('sem filtros devolve tudo', () => {
    expect(applyFilters(all, EMPTY_FILTERS)).toHaveLength(4);
  });

  it('dentro do mesmo tipo, os filtros somam-se', () => {
    const f = { ...EMPTY_FILTERS, weights: ['leve' as const, 'equilibrado' as const] };
    expect(ids(applyFilters(all, f))).toEqual(['salada', 'sopa']);
  });

  it('entre tipos diferentes, os filtros restringem-se', () => {
    const f = { ...EMPTY_FILTERS, methods: ['forno' as const], weights: ['substancial' as const] };
    expect(ids(applyFilters(all, f))).toEqual(['assado', 'gratinado']);

    const impossivel = { ...EMPTY_FILTERS, methods: ['forno' as const], weights: ['leve' as const] };
    expect(applyFilters(all, impossivel)).toEqual([]);
  });

  it('basta um dos métodos da receita corresponder', () => {
    const f = { ...EMPTY_FILTERS, methods: ['tacho' as const] };
    expect(ids(applyFilters(all, f))).toEqual(['gratinado', 'sopa']);
  });

  it('filtra por label', () => {
    expect(ids(applyFilters(all, { ...EMPTY_FILTERS, labels: ['carne', 'peixe'] }))).toEqual([
      'assado',
      'salada',
    ]);
  });

  it('exclui receitas sem peso quando se filtra por peso', () => {
    const semPeso = make('sem-peso', { weight: undefined });
    expect(applyFilters([semPeso], { ...EMPTY_FILTERS, weights: ['leve'] })).toEqual([]);
  });

  it('"hoje não me apetece ligar o forno" — o caso que motivou o campo', () => {
    const semForno = all.filter((r) => !r.methods.includes('forno'));
    expect(ids(semForno)).toEqual(['salada', 'sopa']);
  });
});

describe('toggleFilter', () => {
  it('acrescenta e retira sem mutar', () => {
    const um = toggleFilter(EMPTY_FILTERS, 'methods', 'forno');
    expect(um.methods).toEqual(['forno']);
    expect(EMPTY_FILTERS.methods).toEqual([]);

    const dois = toggleFilter(um, 'methods', 'tacho');
    expect(dois.methods).toEqual(['forno', 'tacho']);

    expect(toggleFilter(dois, 'methods', 'forno').methods).toEqual(['tacho']);
  });
});
