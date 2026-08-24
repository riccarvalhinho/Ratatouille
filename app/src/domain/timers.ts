/**
 * Temporizadores do modo cozinha.
 *
 * A decisão que importa: o tempo restante é sempre calculado a partir do **relógio**, nunca contando
 * ticks. Um tablet com o ecrã a esmorecer, ou um browser que põe o separador em segundo plano,
 * estrangula o `setInterval` — um temporizador que conte ticks fica minutos atrasado e estraga o
 * jantar em silêncio. Com o relógio, o pior que acontece é a interface atualizar mais devagar.
 *
 * Por isso este módulo é puro e recebe sempre o `now` de fora: dá para testar sem esperar.
 */

export interface Timer {
  id: string;
  /** Passo a que pertence, para se saber a que voltar quando toca. */
  stepIndex: number;
  label: string;
  totalMs: number;
  /** A correr: instante em que acaba. Ausente quando está em pausa. */
  endsAt?: number;
  /** Em pausa: quanto falta. Ausente quando está a correr. */
  remainingMs?: number;
  /**
   * Passo passivo — levedar, arrefecer, assar sem mexer. Quando acaba, **avisa**.
   * Num passo ativo já se está a olhar para o tacho, e um alarme só incomoda.
   */
  passive: boolean;
  /** Marcado depois de o aviso ter sido dado, para não avisar em ciclo. */
  acknowledged?: boolean;
}

export function createTimer(
  params: { stepIndex: number; label: string; minutes: number; passive: boolean },
  now: number,
): Timer {
  const totalMs = params.minutes * 60_000;
  return {
    id: `${params.stepIndex}-${now}`,
    stepIndex: params.stepIndex,
    label: params.label,
    totalMs,
    endsAt: now + totalMs,
    passive: params.passive,
  };
}

export function remainingMs(timer: Timer, now: number): number {
  if (timer.endsAt !== undefined) return Math.max(0, timer.endsAt - now);
  return timer.remainingMs ?? 0;
}

export function isRunning(timer: Timer): boolean {
  return timer.endsAt !== undefined;
}

export function isDone(timer: Timer, now: number): boolean {
  return remainingMs(timer, now) === 0;
}

/**
 * `endsAt` e `remainingMs` são mutuamente exclusivos — é o que distingue a correr de em pausa.
 * Daí não se copiar o objeto inteiro nestas transições: constrói-se de raiz para não sobrar o campo
 * do estado anterior.
 */
function rebuild(timer: Timer, state: { endsAt: number } | { remainingMs: number }): Timer {
  return {
    id: timer.id,
    stepIndex: timer.stepIndex,
    label: timer.label,
    totalMs: timer.totalMs,
    passive: timer.passive,
    ...(timer.acknowledged ? { acknowledged: true } : {}),
    ...state,
  };
}

export function pause(timer: Timer, now: number): Timer {
  if (!isRunning(timer)) return timer;
  return rebuild(timer, { remainingMs: remainingMs(timer, now) });
}

export function resume(timer: Timer, now: number): Timer {
  if (isRunning(timer)) return timer;
  return rebuild(timer, { endsAt: now + (timer.remainingMs ?? 0) });
}

export function reset(timer: Timer, now: number): Timer {
  return rebuild({ ...timer, acknowledged: false }, { endsAt: now + timer.totalMs });
}

/** Temporizadores que acabaram e ainda não foram avisados. Só os passivos é que avisam. */
export function timersToAnnounce(timers: Timer[], now: number): Timer[] {
  return timers.filter((t) => t.passive && !t.acknowledged && isDone(t, now));
}

/** "12:05", "0:47". Sempre com dois dígitos nos segundos, para o número não saltar. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Fração já decorrida, de 0 a 1, para desenhar o progresso. */
export function progress(timer: Timer, now: number): number {
  if (timer.totalMs === 0) return 1;
  return 1 - remainingMs(timer, now) / timer.totalMs;
}
