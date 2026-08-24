import { describe, expect, it } from 'vitest';
import {
  datesOfIsoWeek,
  formatLastCooked,
  fullWeek,
  isWeekEmpty,
  isoWeekOf,
  lastCookedByRecipe,
  mondayOfIsoWeek,
  recipesOfDay,
  shiftIsoWeek,
} from './planning.ts';
import type { WeekPlan } from './types.ts';

describe('semanas ISO', () => {
  it('calcula a semana de uma data', () => {
    expect(isoWeekOf('2026-08-24')).toBe('2026-W35');
    expect(isoWeekOf('2026-08-30')).toBe('2026-W35');
    expect(isoWeekOf('2026-08-31')).toBe('2026-W36');
  });

  it('trata a viragem do ano, que é onde estas contas costumam falhar', () => {
    // 1 de janeiro de 2027 é sexta-feira e pertence à última semana de 2026
    expect(isoWeekOf('2027-01-01')).toBe('2026-W53');
    // 4 de janeiro de 2027 é segunda e abre a semana 1
    expect(isoWeekOf('2027-01-04')).toBe('2027-W01');
  });

  it('a segunda-feira e a data voltam uma à outra', () => {
    for (const date of ['2026-01-01', '2026-06-15', '2026-12-31', '2027-01-01']) {
      const week = isoWeekOf(date);
      expect(isoWeekOf(mondayOfIsoWeek(week))).toBe(week);
    }
  });

  it('dá as sete datas, de segunda a domingo', () => {
    const dates = datesOfIsoWeek('2026-W35');
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe('2026-08-24');
    expect(dates[6]).toBe('2026-08-30');
  });

  it('navega entre semanas, incluindo através do ano', () => {
    expect(shiftIsoWeek('2026-W35', 1)).toBe('2026-W36');
    expect(shiftIsoWeek('2026-W35', -1)).toBe('2026-W34');
    expect(shiftIsoWeek('2027-W01', -1)).toBe('2026-W53');
  });

  it('rejeita entradas inválidas em vez de devolver lixo', () => {
    expect(() => isoWeekOf('nao-e-data')).toThrow();
    expect(() => mondayOfIsoWeek('2026-35')).toThrow();
  });
});

describe('fullWeek', () => {
  const plan: WeekPlan = {
    week: '2026-W35',
    days: [{ date: '2026-08-26', blocks: { jantar: [{ recipeId: 'sopa' }] } }],
  };

  it('devolve a grelha inteira, mesmo com um dia só preenchido', () => {
    const week = fullWeek('2026-W35', plan);
    expect(week).toHaveLength(7);
    expect(week.every((d) => Object.keys(d.blocks).length === 4)).toBe(true);
  });

  it('mantém o que estava planeado no dia certo', () => {
    const week = fullWeek('2026-W35', plan);
    expect(week[2]?.date).toBe('2026-08-26');
    expect(week[2]?.blocks.jantar).toEqual([{ recipeId: 'sopa' }]);
    expect(week[0]?.blocks.jantar).toEqual([]);
  });

  it('funciona sem plano nenhum', () => {
    const week = fullWeek('2026-W35', undefined);
    expect(week).toHaveLength(7);
    expect(week.every((d) => recipesOfDay(d).length === 0)).toBe(true);
  });
});

describe('isWeekEmpty', () => {
  it('distingue sem plano, plano vazio e plano com coisas', () => {
    expect(isWeekEmpty(undefined)).toBe(true);
    expect(isWeekEmpty({ week: '2026-W35', days: [] })).toBe(true);
    expect(isWeekEmpty({ week: '2026-W35', days: [{ date: '2026-08-24', blocks: { jantar: [] } }] })).toBe(true);
    expect(
      isWeekEmpty({ week: '2026-W35', days: [{ date: '2026-08-24', blocks: { jantar: [{ recipeId: 'x' }] } }] }),
    ).toBe(false);
  });
});

describe('recipesOfDay', () => {
  it('devolve por ordem dos blocos do dia, com vários pratos no mesmo bloco', () => {
    const result = recipesOfDay({
      date: '2026-08-24',
      blocks: {
        jantar: [{ recipeId: 'sopa' }, { recipeId: 'sobremesa' }],
        almoco: [{ recipeId: 'salada' }],
      },
    });
    expect(result.map((r) => `${r.block}:${r.entry.recipeId}`)).toEqual([
      'almoco:salada',
      'jantar:sopa',
      'jantar:sobremesa',
    ]);
  });
});

describe('histórico', () => {
  it('guarda a data mais recente por receita', () => {
    const last = lastCookedByRecipe([
      { recipeId: 'sopa', date: '2026-08-01' },
      { recipeId: 'sopa', date: '2026-08-19' },
      { recipeId: 'assado', date: '2026-07-04' },
    ]);
    expect(last.get('sopa')).toBe('2026-08-19');
    expect(last.get('assado')).toBe('2026-07-04');
    expect(last.get('nunca-feita')).toBeUndefined();
  });

  it('diz o tempo em linguagem útil, não em datas exatas', () => {
    const hoje = '2026-08-24';
    expect(formatLastCooked(undefined, hoje)).toBe('nunca cozinhada');
    expect(formatLastCooked('2026-08-24', hoje)).toBe('hoje');
    expect(formatLastCooked('2026-08-23', hoje)).toBe('ontem');
    expect(formatLastCooked('2026-08-21', hoje)).toBe('há 3 dias');
    expect(formatLastCooked('2026-08-16', hoje)).toBe('há 1 semana');
    expect(formatLastCooked('2026-08-03', hoje)).toBe('há 3 semanas');
    expect(formatLastCooked('2026-05-24', hoje)).toBe('há 3 meses');
    expect(formatLastCooked('2025-01-01', hoje)).toBe('há mais de 1 ano');
  });
});
