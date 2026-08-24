/** Leitura das taxonomias do disco, para as ferramentas de importação. */
import path from 'node:path';
import { readJson } from '../load-data.ts';
import { paths } from '../paths.ts';
import type { Equipment, Ingredient, Label } from '../../app/src/domain/types.ts';

interface Taxonomy<T> {
  items: T[];
}

export function loadIngredients(): Ingredient[] {
  return (readJson<Taxonomy<Ingredient>>(path.join(paths.taxonomies, 'ingredients.json')).data).items;
}

export function loadLabels(): Label[] {
  return (readJson<Taxonomy<Label>>(path.join(paths.taxonomies, 'labels.json')).data).items;
}

export function loadEquipment(): Equipment[] {
  return (readJson<Taxonomy<Equipment>>(path.join(paths.taxonomies, 'equipment.json')).data).items;
}
