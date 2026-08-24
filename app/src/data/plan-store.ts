/**
 * Planos da semana: o que veio no bundle mais o que foi editado no tablet.
 *
 * A ADR 0004 descreve a escrita em duas metades. Esta é a primeira: gravar já em IndexedDB para a
 * interface responder no instante, e o plano sobreviver a fechar a app. A segunda — mandar as
 * alterações para o GitHub como commit, com uma outbox que faz retry — é o M2 e ainda não existe.
 *
 * Enquanto a segunda metade não existir, o plano editado na cozinha **vive só neste tablet**. Isso
 * está dito na interface e não escondido, porque um plano que se julga guardado e não está é pior
 * do que um plano que se sabe local.
 *
 * A sobreposição é por semana inteira e não por receita: uma semana tocada localmente passa a ser
 * a versão local dessa semana, e as outras continuam a vir do bundle. É o mesmo grão do ficheiro
 * (`data/planning/AAAA-Www.json`), o que faz com que a sincronização do M2 seja um PUT por semana e
 * não uma fusão campo a campo.
 */
import { useCallback, useEffect, useState } from 'react';
import { openDB, type IDBPDatabase } from 'idb';
import { addToBlock, removeFromBlock } from '../domain/plan-edit.ts';
import type { DataBundle, MealBlock, PlanEntry, WeekPlan } from '../domain/types.ts';

const DB_NAME = 'ratatouille';
const DB_VERSION = 1;
const STORE = 'kv';
const EDITS_KEY = 'plan-edits';

type PlanEdits = Record<string, WeekPlan>;

let dbPromise: Promise<IDBPDatabase> | undefined;

function getDb(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    },
  });
  return dbPromise;
}

async function readEdits(): Promise<PlanEdits> {
  try {
    const db = await getDb();
    return ((await db.get(STORE, EDITS_KEY)) as PlanEdits | undefined) ?? {};
  } catch (error) {
    // Sem IndexedDB (modo privado, WebView antigo) perde-se a persistência, não a app.
    console.warn('Não foi possível ler o plano local:', error);
    return {};
  }
}

async function writeEdits(edits: PlanEdits): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE, edits, EDITS_KEY);
  } catch (error) {
    console.warn('Não foi possível guardar o plano local:', error);
  }
}

export interface PlanStore {
  /** O plano de uma semana: a versão local se existir, senão a do bundle. */
  weekPlan: (week: string) => WeekPlan | undefined;
  addRecipe: (week: string, date: string, block: MealBlock, entry: PlanEntry) => void;
  removeRecipe: (week: string, date: string, block: MealBlock, index: number) => void;
  /** Quantas semanas estão editadas só neste tablet, à espera do M2. */
  localWeeks: number;
  /** Falso enquanto as edições guardadas ainda não foram lidas do IndexedDB. */
  ready: boolean;
}

/**
 * O `bundle` chega indefinido enquanto os dados carregam. O hook tem de ser chamado sempre, mesmo
 * nesse instante — daí aceitar `undefined` em vez de obrigar quem chama a saltar a chamada.
 */
export function usePlanStore(bundle: DataBundle | undefined): PlanStore {
  const [edits, setEdits] = useState<PlanEdits>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readEdits().then((stored) => {
      if (!cancelled) {
        setEdits(stored);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const weekPlan = useCallback(
    (week: string): WeekPlan | undefined =>
      edits[week] ?? bundle?.plans.find((plan) => plan.week === week),
    [edits, bundle],
  );

  // A gravação é disparada e não esperada: a interface não fica à espera do disco. Se falhar, o
  // aviso fica na consola e o ecrã continua correto até fechar a app.
  const update = useCallback((week: string, next: WeekPlan) => {
    setEdits((current) => {
      const updated = { ...current, [week]: next };
      void writeEdits(updated);
      return updated;
    });
  }, []);

  const addRecipe = useCallback(
    (week: string, date: string, block: MealBlock, entry: PlanEntry) => {
      update(week, addToBlock(weekPlan(week), week, date, block, entry));
    },
    [update, weekPlan],
  );

  const removeRecipe = useCallback(
    (week: string, date: string, block: MealBlock, index: number) => {
      const current = weekPlan(week);
      if (!current) return;
      update(week, removeFromBlock(current, date, block, index));
    },
    [update, weekPlan],
  );

  return { weekPlan, addRecipe, removeRecipe, localWeeks: Object.keys(edits).length, ready };
}
