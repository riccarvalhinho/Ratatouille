import { describe, expect, it } from 'vitest';
import { addToBlock, countEntries, emptyBlocksOfWeek, removeFromBlock } from './plan-edit.ts';
import type { WeekPlan } from './types.ts';

const WEEK = '2026-W35';

const plan: WeekPlan = {
  week: WEEK,
  days: [
    { date: '2026-08-24', blocks: { jantar: [{ recipeId: 'caldo-verde' }] } },
    { date: '2026-08-26', blocks: { almoco: [{ recipeId: 'arroz-de-frango' }] } },
  ],
};

describe('addToBlock', () => {
  it('acrescenta a um dia que já existe', () => {
    const next = addToBlock(plan, WEEK, '2026-08-24', 'jantar', { recipeId: 'arroz-doce' });
    expect(next.days[0]?.blocks.jantar).toEqual([{ recipeId: 'caldo-verde' }, { recipeId: 'arroz-doce' }]);
  });

  it('cria o dia quando ainda não existe, e mantém os dias por data', () => {
    const next = addToBlock(plan, WEEK, '2026-08-25', 'jantar', { recipeId: 'arroz-doce' });
    expect(next.days.map((d) => d.date)).toEqual(['2026-08-24', '2026-08-25', '2026-08-26']);
  });

  it('cria a semana a partir do nada', () => {
    const next = addToBlock(undefined, WEEK, '2026-08-24', 'almoco', { recipeId: 'caldo-verde' });
    expect(next).toEqual({
      week: WEEK,
      days: [{ date: '2026-08-24', blocks: { almoco: [{ recipeId: 'caldo-verde' }] } }],
    });
  });

  it('deixa repetir a mesma receita no mesmo bloco — é assim que se dobra a quantidade', () => {
    const next = addToBlock(plan, WEEK, '2026-08-24', 'jantar', { recipeId: 'caldo-verde' });
    expect(next.days[0]?.blocks.jantar).toHaveLength(2);
  });

  it('ordena os blocos pela ordem do dia e não pela ordem dos toques', () => {
    const withDinner = addToBlock(undefined, WEEK, '2026-08-24', 'jantar', { recipeId: 'a' });
    const withLunch = addToBlock(withDinner, WEEK, '2026-08-24', 'almoco', { recipeId: 'b' });
    expect(Object.keys(withLunch.days[0]?.blocks ?? {})).toEqual(['almoco', 'jantar']);
  });

  it('não mexe no plano recebido', () => {
    addToBlock(plan, WEEK, '2026-08-24', 'jantar', { recipeId: 'arroz-doce' });
    expect(plan.days[0]?.blocks.jantar).toHaveLength(1);
  });
});

describe('removeFromBlock', () => {
  it('remove a receita indicada', () => {
    const two = addToBlock(plan, WEEK, '2026-08-24', 'jantar', { recipeId: 'arroz-doce' });
    const next = removeFromBlock(two, '2026-08-24', 'jantar', 0);
    expect(next.days[0]?.blocks.jantar).toEqual([{ recipeId: 'arroz-doce' }]);
  });

  it('remove o dia quando fica sem blocos, para não deixar lixo no ficheiro', () => {
    const next = removeFromBlock(plan, '2026-08-24', 'jantar', 0);
    expect(next.days.map((d) => d.date)).toEqual(['2026-08-26']);
  });

  it('remove o bloco quando fica sem receitas, mas mantém o dia se tiver outro bloco', () => {
    const withLunch = addToBlock(plan, WEEK, '2026-08-24', 'almoco', { recipeId: 'arroz-doce' });
    const next = removeFromBlock(withLunch, '2026-08-24', 'jantar', 0);
    expect(next.days[0]?.blocks).toEqual({ almoco: [{ recipeId: 'arroz-doce' }] });
  });

  it('ignora um índice que não existe', () => {
    expect(removeFromBlock(plan, '2026-08-24', 'jantar', 7)).toEqual(plan);
  });

  it('ignora uma data que não está no plano', () => {
    expect(removeFromBlock(plan, '2026-08-30', 'jantar', 0)).toEqual(plan);
  });
});

describe('countEntries', () => {
  it('conta as receitas todas da semana', () => {
    expect(countEntries(plan)).toBe(2);
  });

  it('uma semana por planear conta zero', () => {
    expect(countEntries(undefined)).toBe(0);
  });
});

describe('emptyBlocksOfWeek', () => {
  it('devolve os blocos sem nada em sete dias', () => {
    expect([...emptyBlocksOfWeek(plan)]).toEqual(['pequeno-almoco', 'lanche']);
  });

  it('numa semana por planear, estão todos vazios', () => {
    expect(emptyBlocksOfWeek(undefined).size).toBe(4);
  });
});
