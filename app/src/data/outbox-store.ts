/**
 * A outbox com estado: persistência em IndexedDB e o worker que a esvazia.
 *
 * A lógica da fila é pura e vive em `app/src/domain/outbox.ts`. Aqui só há o que não se consegue
 * testar sem simular o mundo: disco, rede, temporizadores e o ciclo de vida do React.
 *
 * ## Quando é que tenta
 *
 * - Ao arrancar, se ficou fila da sessão anterior.
 * - Sempre que alguma coisa entra na fila.
 * - Quando o browser diz que voltou a haver rede (`online`).
 * - Quando o tablet volta a ficar visível — um Fire na parede passa horas com o ecrã apagado, e o
 *   `online` sozinho não chega para acordar a sincronização.
 * - De 30 em 30 segundos, como rede de segurança para o que os eventos acima não apanharem.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { openDB, type IDBPDatabase } from 'idb';
import {
  dueEntries,
  enqueue,
  markFailed,
  markSent,
  outboxStatus,
  type OutboxEntry,
  type OutboxStatus,
} from '../domain/outbox.ts';
import { readToken, writeFile } from './github.ts';

const DB_NAME = 'ratatouille';
const DB_VERSION = 1;
const STORE = 'kv';
const OUTBOX_KEY = 'outbox';

const HEARTBEAT_MS = 30_000;

let dbPromise: Promise<IDBPDatabase> | undefined;

function getDb(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    },
  });
  return dbPromise;
}

async function readQueue(): Promise<OutboxEntry[]> {
  try {
    const db = await getDb();
    return ((await db.get(STORE, OUTBOX_KEY)) as OutboxEntry[] | undefined) ?? [];
  } catch (error) {
    console.warn('Não foi possível ler a fila de envio:', error);
    return [];
  }
}

async function writeQueue(queue: OutboxEntry[]): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE, queue, OUTBOX_KEY);
  } catch (error) {
    console.warn('Não foi possível guardar a fila de envio:', error);
  }
}

export interface Outbox {
  /** Mete um ficheiro na fila e tenta enviar já. */
  push: (file: { path: string; content: string; message: string }) => void;
  status: OutboxStatus;
  /** Força uma tentativa agora, ignorando o recuo. Alimenta o botão das Definições. */
  syncNow: () => void;
  syncing: boolean;
  /** Falso enquanto a fila guardada ainda não foi lida. */
  ready: boolean;
  /** Sem token não há sincronização possível, e a interface tem de o dizer. */
  hasToken: boolean;
}

export function useOutbox(): Outbox {
  const [queue, setQueue] = useState<OutboxEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasToken, setHasToken] = useState(() => readToken() !== undefined);

  /*
   * A fila também vive numa ref.
   *
   * O worker é assíncrono e corre fora do render: se lesse o estado, leria o de quando arrancou.
   * A ref é a versão sempre atual, e o estado existe só para a interface redesenhar.
   */
  const queueRef = useRef<OutboxEntry[]>([]);
  const runningRef = useRef(false);

  const update = useCallback((next: OutboxEntry[]) => {
    queueRef.current = next;
    setQueue(next);
    void writeQueue(next);
  }, []);

  const drain = useCallback(
    async (options?: { ignoreBackoff?: boolean }) => {
      // Uma passagem de cada vez: duas em paralelo escreveriam o mesmo ficheiro com o mesmo `sha`.
      if (runningRef.current) return;

      const token = readToken();
      setHasToken(token !== undefined);
      if (!token) return;

      // Offline declarado pelo browser: nem vale a pena gastar uma tentativa e um recuo.
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

      const pending = options?.ignoreBackoff
        ? [...queueRef.current].sort((a, b) => a.queuedAt - b.queuedAt)
        : dueEntries(queueRef.current, Date.now());
      if (pending.length === 0) return;

      runningRef.current = true;
      setSyncing(true);

      try {
        for (const entry of pending) {
          try {
            await writeFile({ path: entry.path, content: entry.content, message: entry.message }, token);
            update(markSent(queueRef.current, entry.path, entry.content));
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            update(markFailed(queueRef.current, entry.path, message, Date.now()));
          }
        }
      } finally {
        runningRef.current = false;
        setSyncing(false);
      }
    },
    [update],
  );

  // Arranque: ler o que ficou da sessão anterior e tentar enviá-lo.
  useEffect(() => {
    let cancelled = false;
    void readQueue().then((stored) => {
      if (cancelled) return;
      queueRef.current = stored;
      setQueue(stored);
      setReady(true);
      void drain();
    });
    return () => {
      cancelled = true;
    };
  }, [drain]);

  // Rede de volta, ecrã de volta, e um batimento de fundo.
  useEffect(() => {
    const attempt = () => void drain();
    const onVisible = () => {
      if (document.visibilityState === 'visible') attempt();
    };

    window.addEventListener('online', attempt);
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(attempt, HEARTBEAT_MS);

    return () => {
      window.removeEventListener('online', attempt);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [drain]);

  const push = useCallback(
    (file: { path: string; content: string; message: string }) => {
      update(enqueue(queueRef.current, file, Date.now()));
      void drain();
    },
    [drain, update],
  );

  const syncNow = useCallback(() => {
    setHasToken(readToken() !== undefined);
    void drain({ ignoreBackoff: true });
  }, [drain]);

  return { push, status: outboxStatus(queue), syncNow, syncing, ready, hasToken };
}
