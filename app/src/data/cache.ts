/**
 * Cache do bundle em IndexedDB.
 *
 * É isto que faz a app funcionar offline: uma vez descarregado o bundle, a cozinha pode ficar sem
 * Wi-Fi que as receitas continuam lá. Ver docs/adr/0004-escrita-via-github-api.md.
 */
import { openDB, type IDBPDatabase } from 'idb';
import type { DataBundle } from '../domain/types.ts';

const DB_NAME = 'ratatouille';
const DB_VERSION = 1;
const STORE = 'kv';
const BUNDLE_KEY = 'bundle';

let dbPromise: Promise<IDBPDatabase> | undefined;

function getDb(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    },
  });
  return dbPromise;
}

export async function readCachedBundle(): Promise<DataBundle | undefined> {
  try {
    const db = await getDb();
    return (await db.get(STORE, BUNDLE_KEY)) as DataBundle | undefined;
  } catch (error) {
    // IndexedDB pode estar indisponível (modo privado, WebView antigo). Não é motivo para a app
    // não abrir — perde-se o offline, não a app.
    console.warn('Não foi possível ler a cache local:', error);
    return undefined;
  }
}

export async function writeCachedBundle(bundle: DataBundle): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE, bundle, BUNDLE_KEY);
  } catch (error) {
    console.warn('Não foi possível guardar a cache local:', error);
  }
}
