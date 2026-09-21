/**
 * O histórico como se lê, e não como se guarda. Ver docs/specs/008-historico.md.
 *
 * O ficheiro `data/state/history.json` é uma lista de factos crus — receita, data, bloco. O ecrã
 * precisa de mais do que isso: a receita inteira para ter fotografia e nome, e a contagem de quantas
 * vezes aquele prato já foi feito, que é o que transforma uma lista de datas numa leitura do
 * repertório de casa.
 *
 * A junção vive aqui e não no ecrã por uma razão prática: uma entrada pode apontar para uma receita
 * que já não existe em `data/recipes/` — apagada, ou com o slug mudado. O histórico é um facto e não
 * se reescreve por causa disso, portanto o caso tem de ter resposta, e essa resposta tem teste.
 */
import type { HistoryEntry, Recipe } from './types.ts';

export interface HistoryItem {
  entry: HistoryEntry;
  /** Ausente quando a entrada aponta para uma receita que já não está no catálogo. */
  recipe?: Recipe;
  /** Vezes que esta receita aparece no histórico inteiro — a tal curiosidade. */
  total: number;
  /** Chave estável para as listas. A mesma receita repete-se, a mesma data também. */
  key: string;
}

/** Quantas vezes cada receita foi cozinhada, ao todo. */
export function countCookedByRecipe(entries: HistoryEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) counts.set(entry.recipeId, (counts.get(entry.recipeId) ?? 0) + 1);
  return counts;
}

/**
 * As entradas por ordem de leitura — mais recentes primeiro — já com receita e contagem.
 *
 * A ordenação é feita aqui e não assumida da ordem do ficheiro: o histórico local ganha entradas
 * pelo fim antes de ser serializado, e um ecrã que confiasse na ordem de chegada mostrava a refeição
 * de hoje no meio de agosto.
 */
export function buildHistory(
  entries: HistoryEntry[],
  recipesById: Map<string, Recipe>,
): HistoryItem[] {
  const totals = countCookedByRecipe(entries);

  return [...entries]
    .sort((a, b) => b.date.localeCompare(a.date) || a.recipeId.localeCompare(b.recipeId))
    .map((entry, index) => ({
      entry,
      recipe: recipesById.get(entry.recipeId),
      total: totals.get(entry.recipeId) ?? 1,
      key: `${entry.date}-${entry.recipeId}-${index}`,
    }));
}

/** Quantas receitas diferentes há no histórico. Vai para o resumo do topo, ao lado do total. */
export function countDistinctRecipes(entries: HistoryEntry[]): number {
  return countCookedByRecipe(entries).size;
}

/** "primeira vez", "3 vezes ao todo" — o que se diz de uma contagem sem obrigar a fazer contas. */
export function formatTotalCooked(total: number): string {
  return total <= 1 ? 'primeira vez' : `${total} vezes ao todo`;
}
