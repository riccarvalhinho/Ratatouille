/**
 * Semanas ISO 8601: a semana começa à segunda-feira e a semana 1 é a que contém a primeira
 * quinta-feira do ano. É por isto que 1 de janeiro pode pertencer à semana 52 do ano anterior —
 * daí valer a pena ter isto num sítio só, testado, em vez de espalhado pelo código.
 */

/** Devolve o identificador de semana ISO ("2026-W35") para uma data ISO ("2026-08-24"). */
export function isoWeekOf(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Data inválida: ${isoDate}`);

  // Recua para a quinta-feira da mesma semana: define o ano ISO a que a semana pertence.
  const thursday = new Date(date);
  const dayOfWeek = (date.getUTCDay() + 6) % 7; // 0 = segunda … 6 = domingo
  thursday.setUTCDate(date.getUTCDate() - dayOfWeek + 3);

  const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  const firstDayOfWeek = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayOfWeek + 3);

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / msPerWeek);

  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Segunda-feira da semana ISO indicada, em formato ISO ("2026-08-24"). */
export function mondayOfIsoWeek(week: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) throw new Error(`Semana ISO inválida: ${week}`);
  const year = Number(match[1]);
  const weekNumber = Number(match[2]);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4DayOfWeek = (jan4.getUTCDay() + 6) % 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4DayOfWeek);

  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (weekNumber - 1) * 7);
  return monday.toISOString().slice(0, 10);
}
