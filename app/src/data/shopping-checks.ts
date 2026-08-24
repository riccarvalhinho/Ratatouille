/**
 * O que já está no carrinho.
 *
 * **Isto não vai para o GitHub, de propósito.** É a única escrita da app que fica só no aparelho.
 *
 * Duas razões. Marcar itens é a ação mais frequente de toda a app — uma lista de vinte artigos são
 * vinte toques em dez minutos — e cada um daria um commit; o histórico do repositório passava a ser
 * ruído. E o estado não interessa a ninguém depois da compra: no domingo seguinte a lista é outra.
 *
 * A consequência é que as marcas não passam do telemóvel para o tablet. Isso está certo: quem vai
 * ao supermercado leva um aparelho só, e é nesse que a lista se marca.
 */
import { useCallback, useEffect, useState } from 'react';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'ratatouille';
const DB_VERSION = 1;
const STORE = 'kv';
const CHECKS_KEY = 'shopping-checks';

/** Marcas por semana ISO. Mudar de semana não perde o que já estava marcado na anterior. */
type Checks = Record<string, string[]>;

let dbPromise: Promise<IDBPDatabase> | undefined;

function getDb(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    },
  });
  return dbPromise;
}

export interface ShoppingChecks {
  isChecked: (week: string, ingredientId: string) => boolean;
  toggle: (week: string, ingredientId: string) => void;
  countChecked: (week: string) => number;
  clearWeek: (week: string) => void;
  ready: boolean;
}

export function useShoppingChecks(): ShoppingChecks {
  const [checks, setChecks] = useState<Checks>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const db = await getDb();
        const stored = ((await db.get(STORE, CHECKS_KEY)) as Checks | undefined) ?? {};
        if (!cancelled) setChecks(stored);
      } catch (error) {
        console.warn('Não foi possível ler o que já está marcado:', error);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback((next: Checks) => {
    setChecks(next);
    void (async () => {
      try {
        const db = await getDb();
        await db.put(STORE, next, CHECKS_KEY);
      } catch (error) {
        console.warn('Não foi possível guardar o que está marcado:', error);
      }
    })();
  }, []);

  const isChecked = useCallback(
    (week: string, ingredientId: string) => (checks[week] ?? []).includes(ingredientId),
    [checks],
  );

  const toggle = useCallback(
    (week: string, ingredientId: string) => {
      const current = checks[week] ?? [];
      const next = current.includes(ingredientId)
        ? current.filter((id) => id !== ingredientId)
        : [...current, ingredientId];

      // Uma semana sem nada marcado sai do registo, para não crescer para sempre.
      const updated = { ...checks };
      if (next.length === 0) delete updated[week];
      else updated[week] = next;

      save(updated);
    },
    [checks, save],
  );

  const countChecked = useCallback((week: string) => (checks[week] ?? []).length, [checks]);

  const clearWeek = useCallback(
    (week: string) => {
      const updated = { ...checks };
      delete updated[week];
      save(updated);
    },
    [checks, save],
  );

  return { isChecked, toggle, countChecked, clearWeek, ready };
}
