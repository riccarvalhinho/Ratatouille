import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const paths = {
  schemas: path.join(repoRoot, 'data', 'schema'),
  recipes: path.join(repoRoot, 'data', 'recipes'),
  taxonomies: path.join(repoRoot, 'data', 'taxonomies'),
  planning: path.join(repoRoot, 'data', 'planning'),
  state: path.join(repoRoot, 'data', 'state'),
  media: path.join(repoRoot, 'media'),
  bundleDir: path.join(repoRoot, 'app', 'public', 'data'),
} as const;

/** Caminho relativo à raiz do repositório, para mensagens de erro legíveis. */
export function rel(absolute: string): string {
  return path.relative(repoRoot, absolute);
}
