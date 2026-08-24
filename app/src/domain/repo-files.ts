/**
 * Como a app escreve os ficheiros de `data/`.
 *
 * Isto é a fronteira mais frágil do M2: o tablet passa a escrever no repositório, e um ficheiro com
 * a forma errada só dá erro **depois** do commit, no `npm run validate` do CI. Nessa altura já lá
 * está, e a app continua a mandar mais.
 *
 * Por isso os serializadores estão aqui, puros e num sítio só, e o teste ao lado compara o que eles
 * produzem com os ficheiros que estão mesmo em `data/` — byte a byte, indentação e linha final
 * incluídas. Se o schema ou a convenção mudarem, o teste parte antes de alguém dar por isso.
 */
import type { HistoryEntry, WeekPlan } from './types.ts';

/** Dois espaços e uma linha no fim, como todos os ficheiros de `data/`. */
function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function serializeWeekPlan(plan: WeekPlan): string {
  return serialize(plan);
}

/** Ordenados, para o diff corresponder à alteração e não à ordem dos toques. */
export function serializeFavourites(recipeIds: string[]): string {
  return serialize({ kind: 'favourites', recipeIds: [...new Set(recipeIds)].sort() });
}

/**
 * Mais recentes primeiro, como o schema descreve e o seed faz.
 * O desempate por `recipeId` existe para duas receitas no mesmo dia saírem sempre na mesma ordem.
 */
export function sortHistory(entries: HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort(
    (a, b) => b.date.localeCompare(a.date) || a.recipeId.localeCompare(b.recipeId),
  );
}

export function serializeHistory(entries: HistoryEntry[]): string {
  return serialize({ kind: 'history', entries: sortHistory(entries) });
}
