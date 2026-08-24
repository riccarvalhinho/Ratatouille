import { describe, expect, it } from 'vitest';
import {
  backoffMs,
  dueEntries,
  enqueue,
  markFailed,
  markSent,
  outboxStatus,
  repoPaths,
  type OutboxEntry,
} from './outbox.ts';

const T0 = 1_000_000;

function file(path: string, content: string) {
  return { path, content, message: `atualizar ${path}` };
}

describe('enqueue', () => {
  it('põe um ficheiro na fila', () => {
    const queue = enqueue([], file('data/state/favourites.json', 'a'), T0);
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ path: 'data/state/favourites.json', content: 'a', attempts: 0 });
  });

  it('junta ficheiros diferentes', () => {
    const queue = enqueue(enqueue([], file('a.json', '1'), T0), file('b.json', '2'), T0);
    expect(queue.map((e) => e.path)).toEqual(['a.json', 'b.json']);
  });

  it('cinco alterações ao mesmo ficheiro deixam uma entrada — e portanto um commit', () => {
    let queue: OutboxEntry[] = [];
    for (const content of ['1', '2', '3', '4', '5']) {
      queue = enqueue(queue, file('data/planning/2026-W35.json', content), T0);
    }
    expect(queue).toHaveLength(1);
    expect(queue[0]?.content).toBe('5');
  });

  it('mantém a hora de entrada da primeira vez, para o "à espera há X" não mentir', () => {
    const first = enqueue([], file('a.json', '1'), T0);
    const second = enqueue(first, file('a.json', '2'), T0 + 60_000);
    expect(second[0]?.queuedAt).toBe(T0);
  });

  it('uma alteração nova volta a dar direito a tentar já', () => {
    const failed = markFailed(enqueue([], file('a.json', '1'), T0), 'a.json', 'sem rede', T0);
    expect(failed[0]?.retryAfter).toBeGreaterThan(T0);

    const edited = enqueue(failed, file('a.json', '2'), T0 + 1);
    expect(edited[0]?.attempts).toBe(0);
    expect(edited[0]?.retryAfter).toBeUndefined();
  });
});

describe('backoff', () => {
  it('duplica a cada tentativa', () => {
    expect(backoffMs(0)).toBe(0);
    expect(backoffMs(1)).toBe(2_000);
    expect(backoffMs(2)).toBe(4_000);
    expect(backoffMs(3)).toBe(8_000);
  });

  it('não passa dos cinco minutos, senão uma noite sem rede levava o intervalo a horas', () => {
    expect(backoffMs(20)).toBe(5 * 60_000);
  });
});

describe('dueEntries', () => {
  it('devolve tudo quando nada falhou ainda', () => {
    const queue = enqueue(enqueue([], file('a.json', '1'), T0), file('b.json', '2'), T0 + 1);
    expect(dueEntries(queue, T0).map((e) => e.path)).toEqual(['a.json', 'b.json']);
  });

  it('esconde uma entrada em recuo até chegar a hora', () => {
    const queue = markFailed(enqueue([], file('a.json', '1'), T0), 'a.json', 'erro', T0);
    expect(dueEntries(queue, T0 + 1_000)).toHaveLength(0);
    expect(dueEntries(queue, T0 + 2_000)).toHaveLength(1);
  });

  it('a mais antiga sai primeiro', () => {
    const queue = enqueue(enqueue([], file('b.json', '2'), T0 + 500), file('a.json', '1'), T0);
    expect(dueEntries(queue, T0 + 1000).map((e) => e.path)).toEqual(['a.json', 'b.json']);
  });
});

describe('markSent', () => {
  it('tira a entrada da fila', () => {
    const queue = enqueue([], file('a.json', '1'), T0);
    expect(markSent(queue, 'a.json', '1')).toHaveLength(0);
  });

  it('mantém a entrada se o conteúdo mudou enquanto o pedido estava em voo', () => {
    const queue = enqueue(enqueue([], file('a.json', '1'), T0), file('a.json', '2'), T0 + 10);
    // O envio levava o conteúdo "1"; entretanto passou a "2" e esse ainda não foi.
    const after = markSent(queue, 'a.json', '1');
    expect(after).toHaveLength(1);
    expect(after[0]?.content).toBe('2');
  });
});

describe('markFailed', () => {
  it('conta a tentativa, guarda o erro e adia', () => {
    const queue = markFailed(enqueue([], file('a.json', '1'), T0), 'a.json', 'HTTP 401', T0);
    expect(queue[0]).toMatchObject({ attempts: 1, lastError: 'HTTP 401', retryAfter: T0 + 2_000 });
  });

  it('afasta as tentativas seguintes', () => {
    let queue = enqueue([], file('a.json', '1'), T0);
    queue = markFailed(queue, 'a.json', 'erro', T0);
    queue = markFailed(queue, 'a.json', 'erro', T0 + 2_000);
    expect(queue[0]).toMatchObject({ attempts: 2, retryAfter: T0 + 2_000 + 4_000 });
  });

  it('nunca deixa cair a entrada — um plano por enviar não se perde em silêncio', () => {
    let queue = enqueue([], file('a.json', '1'), T0);
    for (let i = 0; i < 50; i++) queue = markFailed(queue, 'a.json', 'erro', T0);
    expect(queue).toHaveLength(1);
  });
});

describe('outboxStatus', () => {
  it('fila vazia é zero pendentes e sem erro', () => {
    expect(outboxStatus([])).toEqual({ pending: 0 });
  });

  it('conta as pendentes e mostra o erro mais recente', () => {
    let queue = enqueue(enqueue([], file('a.json', '1'), T0), file('b.json', '2'), T0 + 10);
    queue = markFailed(queue, 'b.json', 'HTTP 403', T0 + 20);
    expect(outboxStatus(queue)).toEqual({ pending: 2, lastError: 'HTTP 403', oldestQueuedAt: T0 });
  });
});

describe('repoPaths', () => {
  it('mapeia as entidades para os ficheiros do repositório', () => {
    expect(repoPaths.week('2026-W35')).toBe('data/planning/2026-W35.json');
    expect(repoPaths.favourites).toBe('data/state/favourites.json');
    expect(repoPaths.history).toBe('data/state/history.json');
  });
});
