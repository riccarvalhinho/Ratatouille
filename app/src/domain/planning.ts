/**
 * Navegação e leitura do plano semanal. Ver docs/specs/003-planeamento-semanal.md.
 *
 * As semanas ISO estão aqui e não espalhadas pelo código porque a semana 1 é a que contém a primeira
 * quinta-feira do ano — o que faz com que 1 de janeiro possa pertencer à semana 52 do ano anterior.
 * É o tipo de regra que se implementa mal quando se implementa duas vezes.
 */
import type { HistoryEntry, MealBlock, PlanDay, PlanEntry, WeekPlan } from './types.ts';
import { MEAL_BLOCKS } from './types.ts';

/** Identificador de semana ISO ("2026-W35") para uma data ISO ("2026-08-24"). */
export function isoWeekOf(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Data inválida: ${isoDate}`);

  // A quinta-feira da mesma semana define o ano ISO a que a semana pertence.
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7) + 3);

  const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);

  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Segunda-feira de uma semana ISO, em formato ISO. */
export function mondayOfIsoWeek(week: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) throw new Error(`Semana ISO inválida: ${week}`);

  const jan4 = new Date(Date.UTC(Number(match[1]), 0, 4));
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));

  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (Number(match[2]) - 1) * 7);
  return monday.toISOString().slice(0, 10);
}

/** As sete datas de uma semana ISO, de segunda a domingo. */
export function datesOfIsoWeek(week: string): string[] {
  const monday = new Date(`${mondayOfIsoWeek(week)}T00:00:00Z`);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + i);
    return day.toISOString().slice(0, 10);
  });
}

export function shiftIsoWeek(week: string, weeks: number): string {
  const monday = new Date(`${mondayOfIsoWeek(week)}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() + weeks * 7);
  return isoWeekOf(monday.toISOString().slice(0, 10));
}

/**
 * A semana completa, com os sete dias e os quatro blocos, mesmo os vazios.
 * A vista de planeamento precisa da grelha inteira, não só do que está preenchido.
 */
export function fullWeek(week: string, plan: WeekPlan | undefined): PlanDay[] {
  const byDate = new Map((plan?.days ?? []).map((day) => [day.date, day]));

  return datesOfIsoWeek(week).map((date) => {
    const existing = byDate.get(date);
    const blocks: Partial<Record<MealBlock, PlanEntry[]>> = {};
    for (const block of MEAL_BLOCKS) blocks[block] = existing?.blocks[block] ?? [];
    return { date, blocks };
  });
}

export function isWeekEmpty(plan: WeekPlan | undefined): boolean {
  if (!plan) return true;
  return !plan.days.some((day) => Object.values(day.blocks).some((entries) => (entries ?? []).length > 0));
}

/** Todas as receitas planeadas para um dia, por ordem dos blocos. */
export function recipesOfDay(day: PlanDay): { block: MealBlock; entry: PlanEntry }[] {
  return MEAL_BLOCKS.flatMap((block) =>
    (day.blocks[block] ?? []).map((entry) => ({ block, entry })),
  );
}

/**
 * Data mais recente em que cada receita foi cozinhada.
 *
 * Alimenta o "última vez que fiz isto" do detalhe, que é o que evita repetir sempre os mesmos
 * pratos — um dos problemas que o produto existe para resolver.
 */
export function lastCookedByRecipe(history: HistoryEntry[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const entry of history) {
    const known = result.get(entry.recipeId);
    if (!known || entry.date > known) result.set(entry.recipeId, entry.date);
  }
  return result;
}

/** "há 3 semanas", "ontem", "nunca cozinhada" — responde à pergunta real, que é "já chega para repetir?". */
export function formatLastCooked(isoDate: string | undefined, today: string): string {
  if (!isoDate) return 'nunca cozinhada';

  const days = Math.round(
    (new Date(`${today}T00:00:00Z`).getTime() - new Date(`${isoDate}T00:00:00Z`).getTime()) / 86400000,
  );

  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  if (days < 14) return 'há 1 semana';
  if (days < 60) return `há ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `há ${Math.floor(days / 30)} meses`;
  return days < 730 ? 'há mais de 1 ano' : `há ${Math.floor(days / 365)} anos`;
}
