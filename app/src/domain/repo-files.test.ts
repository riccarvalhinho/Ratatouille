/**
 * Os serializadores contra os ficheiros reais de `data/`.
 *
 * Não é um teste de forma inventada: lê o que está no repositório e exige que a app produza
 * exatamente o mesmo. É o que impede o tablet de começar a commitar ficheiros que o
 * `npm run validate` do CI vai recusar — erro que só apareceria depois do commit já lá estar.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { serializeFavourites, serializeHistory, serializeWeekPlan, sortHistory } from './repo-files.ts';
import type { HistoryEntry, WeekPlan } from './types.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (relative: string) => readFileSync(path.join(repoRoot, relative), 'utf8');

describe('contra os ficheiros do repositório', () => {
  it('escreve os favoritos exatamente como data/state/favourites.json', () => {
    const onDisk = read('data/state/favourites.json');
    const parsed = JSON.parse(onDisk) as { recipeIds: string[] };
    expect(serializeFavourites(parsed.recipeIds)).toBe(onDisk);
  });

  it('escreve o histórico exatamente como data/state/history.json', () => {
    const onDisk = read('data/state/history.json');
    const parsed = JSON.parse(onDisk) as { entries: HistoryEntry[] };
    expect(serializeHistory(parsed.entries)).toBe(onDisk);
  });

  it('escreve a semana exatamente como data/planning/2026-W35.json', () => {
    const onDisk = read('data/planning/2026-W35.json');
    expect(serializeWeekPlan(JSON.parse(onDisk) as WeekPlan)).toBe(onDisk);
  });
});

describe('formato', () => {
  it('termina sempre em linha nova, como o resto do repositório', () => {
    expect(serializeFavourites(['a'])).toMatch(/\n$/);
    expect(serializeHistory([])).toMatch(/\n$/);
  });

  it('leva o campo kind, que o schema exige', () => {
    expect(JSON.parse(serializeFavourites([])) as { kind: string }).toMatchObject({ kind: 'favourites' });
    expect(JSON.parse(serializeHistory([])) as { kind: string }).toMatchObject({ kind: 'history' });
  });

  it('ordena os favoritos e tira repetidos', () => {
    const parsed = JSON.parse(serializeFavourites(['sopa', 'arroz', 'sopa'])) as { recipeIds: string[] };
    expect(parsed.recipeIds).toEqual(['arroz', 'sopa']);
  });

  it('põe o histórico com os mais recentes primeiro', () => {
    const entries: HistoryEntry[] = [
      { recipeId: 'velha', date: '2026-01-01' },
      { recipeId: 'nova', date: '2026-08-19' },
    ];
    expect(sortHistory(entries).map((e) => e.recipeId)).toEqual(['nova', 'velha']);
  });

  it('desempata o mesmo dia pelo id, para a ordem ser sempre a mesma', () => {
    const entries: HistoryEntry[] = [
      { recipeId: 'sopa', date: '2026-08-19' },
      { recipeId: 'arroz', date: '2026-08-19' },
    ];
    expect(sortHistory(entries).map((e) => e.recipeId)).toEqual(['arroz', 'sopa']);
  });
});
