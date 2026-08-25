/**
 * Agrega data/ num único ficheiro que a app descarrega de uma vez.
 *
 * Porquê um bundle e não pedir ficheiro a ficheiro: numa cozinha com Wi-Fi fraco, um pedido é
 * muito melhor do que duzentos, e o resultado cabe inteiro em IndexedDB para uso offline.
 */
import fs from 'node:fs';
import path from 'node:path';
import { paths, rel } from './paths.ts';
import { loadAll } from './load-data.ts';

const data = loadAll();

const bundle = {
  /** Sobe quando o formato do bundle mudar de forma incompatível — a app usa isto para invalidar a cache. */
  formatVersion: 1,
  generatedAt: new Date().toISOString(),
  recipes: data.recipes.map((entry) => entry.data),
  plans: data.plans.map((entry) => entry.data),
  taxonomies: {
    labels: (data.labels.data as { items: unknown[] }).items,
    ingredients: (data.ingredients.data as { items: unknown[] }).items,
    equipment: (data.equipment.data as { items: unknown[] }).items,
  },
  favourites: (data.favourites.data as { recipeIds: string[] }).recipeIds,
  history: (data.history.data as { entries: unknown[] }).entries,
};

fs.mkdirSync(paths.bundleDir, { recursive: true });
const target = path.join(paths.bundleDir, 'bundle.json');
fs.writeFileSync(target, `${JSON.stringify(bundle)}\n`, 'utf8');

const sizeKb = (fs.statSync(target).size / 1024).toFixed(1);
console.log(`✓ ${rel(target)} — ${bundle.recipes.length} receita(s), ${sizeKb} KB`);

/*
 * As imagens vivem em `media/` na raiz e o campo `image` da receita é um caminho relativo à raiz do
 * repositório. Para a app as servir, têm de estar debaixo do seu `public/` — daí a cópia.
 *
 * Copiadas e não referenciadas por link simbólico: o Vite segue links no `public/`, mas o build do
 * GitHub Pages e o service worker lidam melhor com ficheiros a sério.
 */
const mediaSource = path.join(paths.media, 'recipes');
const mediaTarget = path.join(paths.bundleDir, '..', 'media', 'recipes');

fs.rmSync(mediaTarget, { recursive: true, force: true });

if (fs.existsSync(mediaSource)) {
  fs.mkdirSync(mediaTarget, { recursive: true });
  const images = fs.readdirSync(mediaSource).filter((file) => !file.startsWith('.'));
  for (const image of images) {
    fs.copyFileSync(path.join(mediaSource, image), path.join(mediaTarget, image));
  }
  if (images.length > 0) console.log(`✓ ${rel(mediaTarget)} — ${images.length} imagem(ns)`);
}
