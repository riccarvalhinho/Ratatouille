import fs from 'node:fs';
import path from 'node:path';
import { paths, rel } from './paths.ts';

export interface LoadedFile<T = unknown> {
  /** Caminho absoluto no disco. */
  file: string;
  /** Caminho relativo à raiz do repositório, para mensagens. */
  name: string;
  /** Nome do ficheiro sem extensão — usado para confirmar que bate certo com o id interno. */
  stem: string;
  data: T;
}

export function readJson<T = unknown>(file: string): LoadedFile<T> {
  const raw = fs.readFileSync(file, 'utf8');
  let data: T;
  try {
    data = JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`${rel(file)}: JSON inválido — ${(error as Error).message}`);
  }
  return { file, name: rel(file), stem: path.basename(file, '.json'), data };
}

export function readJsonDir<T = unknown>(dir: string): LoadedFile<T>[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((entry) => entry.endsWith('.json'))
    .sort()
    .map((entry) => readJson<T>(path.join(dir, entry)));
}

/** Lê tudo o que está em data/, sem validar. A validação é responsabilidade de validate-data.ts. */
export function loadAll() {
  return {
    recipes: readJsonDir(paths.recipes),
    plans: readJsonDir(paths.planning),
    labels: readJson(path.join(paths.taxonomies, 'labels.json')),
    ingredients: readJson(path.join(paths.taxonomies, 'ingredients.json')),
    equipment: readJson(path.join(paths.taxonomies, 'equipment.json')),
    favourites: readJson(path.join(paths.state, 'favourites.json')),
    history: readJson(path.join(paths.state, 'history.json')),
  };
}
