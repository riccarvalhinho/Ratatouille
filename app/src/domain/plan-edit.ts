/**
 * Edições ao plano da semana. Ver docs/specs/003-planeamento-semanal.md.
 *
 * Funções puras: recebem o plano e devolvem um plano novo, sem tocar em armazenamento. Quem persiste
 * é `app/src/data/plan-store.ts`.
 *
 * Duas regras que existem por causa do formato: o plano é um ficheiro JSON versionado em Git, e um
 * diff legível vale mais aqui do que código mais curto.
 *
 * 1. **Nada de vazios.** Ao remover a última receita de um bloco, o bloco desaparece; se o dia ficar
 *    sem blocos, o dia desaparece. Sem isto, planear e desplanear uma receita deixava lixo no
 *    ficheiro e um diff que não corresponde a mudança nenhuma.
 * 2. **Ordem estável.** Os dias ficam por data e os blocos pela ordem de MEAL_BLOCKS, senão a mesma
 *    semana serializa de maneiras diferentes conforme a ordem dos toques.
 */
import { MEAL_BLOCKS, type MealBlock, type PlanDay, type PlanEntry, type WeekPlan } from './types.ts';

function sortBlocks(blocks: PlanDay['blocks']): PlanDay['blocks'] {
  const sorted: PlanDay['blocks'] = {};
  for (const block of MEAL_BLOCKS) {
    const entries = blocks[block];
    if (entries && entries.length > 0) sorted[block] = entries;
  }
  return sorted;
}

function normalise(week: string, days: PlanDay[]): WeekPlan {
  return {
    week,
    days: days
      .map((day) => ({ date: day.date, blocks: sortBlocks(day.blocks) }))
      .filter((day) => Object.keys(day.blocks).length > 0)
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/**
 * Acrescenta uma receita a um bloco.
 *
 * Não deduplica de propósito: a mesma receita duas vezes no mesmo bloco é como se dobra a
 * quantidade, e isso está na spec.
 */
export function addToBlock(
  plan: WeekPlan | undefined,
  week: string,
  date: string,
  block: MealBlock,
  entry: PlanEntry,
): WeekPlan {
  const days = (plan?.days ?? []).map((day) => ({ ...day, blocks: { ...day.blocks } }));
  const existing = days.find((day) => day.date === date);

  if (existing) {
    existing.blocks[block] = [...(existing.blocks[block] ?? []), entry];
  } else {
    days.push({ date, blocks: { [block]: [entry] } });
  }

  return normalise(plan?.week ?? week, days);
}

/** Remove a receita na posição `index` de um bloco. Um índice fora do bloco deixa o plano na mesma. */
export function removeFromBlock(
  plan: WeekPlan | undefined,
  date: string,
  block: MealBlock,
  index: number,
): WeekPlan {
  if (!plan) return { week: '', days: [] };

  const days = plan.days.map((day) => {
    if (day.date !== date) return day;
    const entries = day.blocks[block] ?? [];
    if (index < 0 || index >= entries.length) return day;
    return { ...day, blocks: { ...day.blocks, [block]: entries.filter((_, i) => i !== index) } };
  });

  return normalise(plan.week, days);
}

/** Quantas receitas a semana tem planeadas. Alimenta o "3 refeições" do cabeçalho. */
export function countEntries(plan: WeekPlan | undefined): number {
  return (plan?.days ?? []).reduce(
    (total, day) => total + Object.values(day.blocks).reduce((n, entries) => n + (entries?.length ?? 0), 0),
    0,
  );
}

/**
 * Blocos que estão vazios na semana toda.
 *
 * A grelha tem sempre as quatro linhas, mas uma linha sem nada em sete dias não merece a mesma
 * altura que o jantar. A 1280×800 esta é a diferença entre um cartão legível e um cartão a que
 * falta o nome.
 */
export function emptyBlocksOfWeek(plan: WeekPlan | undefined): Set<MealBlock> {
  const used = new Set<MealBlock>();
  for (const day of plan?.days ?? []) {
    for (const block of MEAL_BLOCKS) {
      if ((day.blocks[block] ?? []).length > 0) used.add(block);
    }
  }
  return new Set(MEAL_BLOCKS.filter((block) => !used.has(block)));
}
