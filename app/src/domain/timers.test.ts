import { describe, expect, it } from 'vitest';
import {
  createTimer,
  formatCountdown,
  isDone,
  isRunning,
  pause,
  progress,
  remainingMs,
  reset,
  resume,
  timersToAnnounce,
} from './timers.ts';

const T0 = 1_700_000_000_000;
const min = (n: number) => n * 60_000;

const novo = (over: Partial<Parameters<typeof createTimer>[0]> = {}) =>
  createTimer({ stepIndex: 2, label: 'Cozer', minutes: 20, passive: true, ...over }, T0);

describe('contagem pelo relógio', () => {
  it('conta a partir do relógio e não de ticks', () => {
    const timer = novo();
    expect(remainingMs(timer, T0)).toBe(min(20));
    expect(remainingMs(timer, T0 + min(5))).toBe(min(15));
  });

  it('sobrevive a um salto grande no tempo, que é o que acontece com o ecrã a dormir', () => {
    // Um temporizador que contasse ticks estaria aqui minutos atrasado.
    const timer = novo();
    expect(remainingMs(timer, T0 + min(19))).toBe(min(1));
    expect(isDone(timer, T0 + min(21))).toBe(true);
  });

  it('nunca conta abaixo de zero', () => {
    expect(remainingMs(novo(), T0 + min(60))).toBe(0);
  });
});

describe('pausar e retomar', () => {
  it('guarda o que falta ao pausar', () => {
    const paused = pause(novo(), T0 + min(8));
    expect(isRunning(paused)).toBe(false);
    expect(remainingMs(paused, T0 + min(30))).toBe(min(12));
  });

  it('retoma de onde ficou, mesmo que tenha estado horas em pausa', () => {
    const paused = pause(novo(), T0 + min(8));
    const resumed = resume(paused, T0 + min(120));
    expect(isRunning(resumed)).toBe(true);
    expect(remainingMs(resumed, T0 + min(120))).toBe(min(12));
    expect(remainingMs(resumed, T0 + min(125))).toBe(min(7));
  });

  it('pausar duas vezes não muda nada', () => {
    const once = pause(novo(), T0 + min(8));
    expect(pause(once, T0 + min(50))).toEqual(once);
  });

  it('reiniciar volta ao tempo total e volta a poder avisar', () => {
    const acabado = { ...novo(), acknowledged: true };
    const again = reset(acabado, T0 + min(30));

    expect(remainingMs(again, T0 + min(30))).toBe(min(20));
    // O que interessa não é o valor do campo, é voltar a avisar quando acabar outra vez.
    expect(timersToAnnounce([again], T0 + min(60))).toHaveLength(1);
  });
});

describe('avisos', () => {
  it('só os passos passivos avisam — num passo ativo já se está a olhar', () => {
    const passivo = novo({ passive: true });
    const ativo = novo({ passive: false, minutes: 5 });
    const depois = T0 + min(30);

    expect(timersToAnnounce([passivo, ativo], depois).map((t) => t.passive)).toEqual([true]);
  });

  it('não avisa antes de acabar', () => {
    expect(timersToAnnounce([novo()], T0 + min(10))).toEqual([]);
  });

  it('não avisa duas vezes', () => {
    const avisado = { ...novo(), acknowledged: true };
    expect(timersToAnnounce([avisado], T0 + min(30))).toEqual([]);
  });

  it('avisa vários ao mesmo tempo, que é o caso difícil', () => {
    const a = createTimer({ stepIndex: 1, label: 'Forno', minutes: 20, passive: true }, T0);
    const b = createTimer({ stepIndex: 3, label: 'Arroz', minutes: 18, passive: true }, T0);
    expect(timersToAnnounce([a, b], T0 + min(25))).toHaveLength(2);
  });
});

describe('formatCountdown', () => {
  it('escreve minutos e segundos com dois dígitos', () => {
    expect(formatCountdown(min(12) + 5000)).toBe('12:05');
    expect(formatCountdown(47_000)).toBe('0:47');
    expect(formatCountdown(0)).toBe('0:00');
  });

  it('arredonda para cima, para não mostrar 0:00 com tempo ainda a contar', () => {
    expect(formatCountdown(500)).toBe('0:01');
  });
});

describe('progress', () => {
  it('vai de 0 a 1', () => {
    const timer = novo();
    expect(progress(timer, T0)).toBe(0);
    expect(progress(timer, T0 + min(10))).toBe(0.5);
    expect(progress(timer, T0 + min(20))).toBe(1);
    expect(progress(timer, T0 + min(40))).toBe(1);
  });
});
