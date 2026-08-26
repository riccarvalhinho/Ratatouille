/**
 * O estado que a app escreve: planos, favoritos e histórico.
 *
 * Substitui o antigo `plan-store.ts`, que só sabia planos. Ver docs/adr/0004-escrita-via-github-api.md.
 *
 * O caminho de uma alteração é sempre o mesmo:
 *
 * 1. muda o estado em memória — a interface responde no instante;
 * 2. grava em IndexedDB — sobrevive a fechar a app;
 * 3. serializa o **ficheiro inteiro** e mete-o na outbox — sai para o GitHub quando houver rede.
 *
 * O passo 3 é o que faltava até ao M2. O 1 e o 2 já existiam.
 *
 * ## Porque é que o ficheiro vai inteiro
 *
 * Cada ficheiro de `data/` é escrito por inteiro a partir do estado local: uma semana, a lista de
 * favoritos, o histórico. Não há fusão parcial a fazer, e é isso que deixa a outbox juntar cinco
 * alterações seguidas num commit só.
 *
 * ## O bundle é a base, as edições são a camada por cima
 *
 * Leitura: a edição local ganha se existir; senão vale o que veio no bundle. Quando o commit chega
 * ao GitHub, o CI regenera o bundle e a base passa a incluir a alteração — a camada local fica a
 * dizer o mesmo, o que é inofensivo.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { openDB, type IDBPDatabase } from 'idb';
import { addToBlock, removeFromBlock } from '../domain/plan-edit.ts';
import { lastCookedByRecipe } from '../domain/planning.ts';
import { repoPaths } from '../domain/outbox.ts';
import {
  serializeFavourites,
  serializeHistory,
  serializeWeekPlan,
  sortHistory,
} from '../domain/repo-files.ts';
import type { DataBundle, HistoryEntry, MealBlock, PlanEntry, WeekPlan } from '../domain/types.ts';
import type { Outbox } from './outbox-store.ts';

const DB_NAME = 'ratatouille';
const DB_VERSION = 1;
const STORE = 'kv';
const EDITS_KEY = 'local-edits';
/** Chave da versão anterior, que só guardava planos. Lida uma vez para não perder o que lá estava. */
const LEGACY_PLAN_KEY = 'plan-edits';

interface LocalEdits {
  plans: Record<string, WeekPlan>;
  favourites?: string[];
  history?: HistoryEntry[];
}

const EMPTY: LocalEdits = { plans: {} };

let dbPromise: Promise<IDBPDatabase> | undefined;

function getDb(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    },
  });
  return dbPromise;
}

async function readEdits(): Promise<LocalEdits> {
  try {
    const db = await getDb();
    const stored = (await db.get(STORE, EDITS_KEY)) as LocalEdits | undefined;
    if (stored) return stored;

    const legacy = (await db.get(STORE, LEGACY_PLAN_KEY)) as Record<string, WeekPlan> | undefined;
    return legacy ? { plans: legacy } : EMPTY;
  } catch (error) {
    // Sem IndexedDB (modo privado, WebView antigo) perde-se a persistência, não a app.
    console.warn('Não foi possível ler o estado local:', error);
    return EMPTY;
  }
}

async function writeEdits(edits: LocalEdits): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE, edits, EDITS_KEY);
  } catch (error) {
    console.warn('Não foi possível guardar o estado local:', error);
  }
}

export interface LocalStore {
  weekPlan: (week: string) => WeekPlan | undefined;
  addRecipe: (week: string, date: string, block: MealBlock, entry: PlanEntry) => void;
  removeRecipe: (week: string, date: string, block: MealBlock, index: number) => void;

  isFavourite: (recipeId: string) => boolean;
  toggleFavourite: (recipeId: string) => void;

  /** Data mais recente em que cada receita foi cozinhada, já com o histórico local. */
  lastCooked: Map<string, string>;
  /** Regista que uma receita foi mesmo cozinhada. Sem duplicar o mesmo prato no mesmo dia. */
  markCooked: (recipeId: string, date: string, block?: MealBlock) => void;
  /**
   * Tira do histórico. Existe porque o modo cozinha passou a marcar sozinho ao terminar: sem forma
   * de desfazer, um passeio pelos passos até ao fim ficava registado como uma refeição que não houve.
   */
  unmarkCooked: (recipeId: string, date: string) => void;
  wasCookedOn: (recipeId: string, date: string) => boolean;

  ready: boolean;
}

export function useLocalStore(bundle: DataBundle | undefined, outbox: Outbox): LocalStore {
  const [edits, setEdits] = useState<LocalEdits>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void readEdits().then((stored) => {
      if (cancelled) return;
      setEdits(stored);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Uma alteração é sempre: novo estado, disco, outbox. O `apply` garante que nunca se faz uma
   * dessas coisas sem as outras — era assim que uma alteração ficava só no tablet sem ninguém dar
   * por isso.
   */
  const apply = useCallback(
    (change: (current: LocalEdits) => { edits: LocalEdits; file: { path: string; content: string; message: string } }) => {
      setEdits((current) => {
        const { edits: next, file } = change(current);
        void writeEdits(next);
        outbox.push(file);
        return next;
      });
    },
    [outbox],
  );

  // --- planos ---

  const weekPlan = useCallback(
    (week: string): WeekPlan | undefined =>
      edits.plans[week] ?? bundle?.plans.find((plan) => plan.week === week),
    [edits, bundle],
  );

  const savePlan = useCallback(
    (week: string, next: WeekPlan) => {
      apply((current) => ({
        edits: { ...current, plans: { ...current.plans, [week]: next } },
        file: {
          path: repoPaths.week(week),
          content: serializeWeekPlan(next),
          message: `Planeamento da semana ${week}`,
        },
      }));
    },
    [apply],
  );

  const addRecipe = useCallback(
    (week: string, date: string, block: MealBlock, entry: PlanEntry) => {
      savePlan(week, addToBlock(weekPlan(week), week, date, block, entry));
    },
    [savePlan, weekPlan],
  );

  const removeRecipe = useCallback(
    (week: string, date: string, block: MealBlock, index: number) => {
      const current = weekPlan(week);
      if (!current) return;
      savePlan(week, removeFromBlock(current, date, block, index));
    },
    [savePlan, weekPlan],
  );

  // --- favoritos ---

  const favourites = useMemo(
    () => new Set(edits.favourites ?? bundle?.favourites ?? []),
    [edits.favourites, bundle],
  );

  const isFavourite = useCallback((recipeId: string) => favourites.has(recipeId), [favourites]);

  const toggleFavourite = useCallback(
    (recipeId: string) => {
      const next = new Set(favourites);
      if (next.has(recipeId)) next.delete(recipeId);
      else next.add(recipeId);

      const recipeIds = [...next];

      apply((current) => ({
        edits: { ...current, favourites: recipeIds },
        file: {
          path: repoPaths.favourites,
          content: serializeFavourites(recipeIds),
          message: favourites.has(recipeId) ? `Tirar ${recipeId} dos favoritos` : `Favoritar ${recipeId}`,
        },
      }));
    },
    [apply, favourites],
  );

  // --- histórico ---

  const history = useMemo(
    () => edits.history ?? bundle?.history ?? [],
    [edits.history, bundle],
  );

  const lastCooked = useMemo(() => lastCookedByRecipe(history), [history]);

  const wasCookedOn = useCallback(
    (recipeId: string, date: string) =>
      history.some((entry) => entry.recipeId === recipeId && entry.date === date),
    [history],
  );

  const markCooked = useCallback(
    (recipeId: string, date: string, block?: MealBlock) => {
      // Marcar duas vezes o mesmo prato no mesmo dia é engano, não duas refeições.
      if (wasCookedOn(recipeId, date)) return;

      const entries = sortHistory([...history, { recipeId, date, ...(block ? { block } : {}) }]);

      apply((current) => ({
        edits: { ...current, history: entries },
        file: {
          path: repoPaths.history,
          content: serializeHistory(entries),
          message: `Cozinhado: ${recipeId} em ${date}`,
        },
      }));
    },
    [apply, history, wasCookedOn],
  );

  const unmarkCooked = useCallback(
    (recipeId: string, date: string) => {
      const entries = history.filter(
        (entry) => !(entry.recipeId === recipeId && entry.date === date),
      );
      if (entries.length === history.length) return;

      apply((current) => ({
        edits: { ...current, history: entries },
        file: {
          path: repoPaths.history,
          content: serializeHistory(entries),
          message: `Afinal não foi cozinhado: ${recipeId} em ${date}`,
        },
      }));
    },
    [apply, history],
  );

  return {
    weekPlan,
    addRecipe,
    removeRecipe,
    isFavourite,
    toggleFavourite,
    lastCooked,
    markCooked,
    unmarkCooked,
    wasCookedOn,
    ready,
  };
}
