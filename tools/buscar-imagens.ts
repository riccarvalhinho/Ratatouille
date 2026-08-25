/**
 * Dá thumbnails de licença livre às receitas que ainda não as têm.
 *
 * Corre no GitHub Actions, não numa sessão de Claude Code: o proxy de saída dessas sessões bloqueia
 * todos os bancos de imagens. Os runners têm internet normal — é o mesmo caminho que
 * `.github/workflows/importar-receita.yml` já usa para ler páginas de receitas.
 *
 * Os bancos e a razão da escolha estão em `tools/import/images.ts`, que é quem fala com eles. Aqui
 * só há a parte do lote: escolher entre candidatas, descarregar, e escrever na receita.
 *
 * ## O que este programa NÃO faz
 *
 * Não sabe se a fotografia mostra o prato certo. Escolhe a melhor candidata por pontuação e
 * grava-a; **quem confirma é uma pessoa.** Por isso o commit fica num ramo e não no `main`, e o
 * programa diz no fim o que escolheu e de onde.
 *
 * Uso:
 *   npx tsx tools/buscar-imagens.ts                                          # as que não têm imagem
 *   npx tsx tools/buscar-imagens.ts caldo-verde                              # só esta
 *   npx tsx tools/buscar-imagens.ts caldo-verde --query "kale potato soup"   # com outro termo
 *   npx tsx tools/buscar-imagens.ts --force                                  # substitui as que há
 *
 * ## As chaves
 *
 * `PEXELS_API_KEY` e `PIXABAY_API_KEY` são opcionais. Sem elas ficam só o Commons e o Openverse, que
 * cobrem pratos com nome próprio mas não dão fotografia de estúdio. Com elas, os bancos curados vêm
 * primeiro. Ver o cabeçalho de `tools/import/images.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { paths, rel } from './paths.ts';
import { searchFreeImages, toCredit, type ImageCandidate } from './import/images.ts';

/** Acima disto a imagem não vale o peso no repositório nem no bundle. Ver `media/README.md`. */
const MAX_BYTES = 300 * 1024;

const USER_AGENT = 'RatatouilleImporter/1.0 (https://github.com/riccarvalhinho/Ratatouille)';

/** Tira acentos e pontuação, para comparar títulos sem depender de como foram escritos. */
function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Bancos onde a legenda descreve a fotografia, não identifica o prato.
 *
 * O Pexels devolve `alt` como "Cooked Food on White Ceramic Plate" e o Pixabay devolve etiquetas
 * como "soup, food, bowl". Nenhum diz "bacalhau com natas" — nem tem de dizer: **a afirmação sobre
 * o prato é a consulta que se fez**, e a ordem em que respondem é o juízo deles sobre ela.
 */
const CURATED = new Set(['pexels', 'pixabay']);

/**
 * Decide se uma candidata serve, e quanto.
 *
 * Há duas regras, porque há dois tipos de banco.
 *
 * **Commons e Openverse** são arquivos: cada ficheiro tem um nome que alguém escolheu para
 * identificar o que lá está. Aí o título é uma afirmação, e exige-se que **contenha o nome da
 * receita inteiro e seguido**. Foi o que se aprendeu à força: contar palavras soltas trouxe um
 * biryani indiano para o "Arroz de frango", e um prato africano à segunda tentativa. "Arroz" e
 * "frango" separados são um sinal fraco; seguidos, são uma afirmação.
 *
 * **Pexels e Pixabay** são bancos curados: aceita-se a ordem deles e confia-se na consulta. Isso
 * tem um custo que vale a pena dizer em voz alta — para "bacalhau com natas" não vem bacalhau com
 * natas, vem **um belo gratinado**. É a troca que se faz por fotografia de estúdio, e é por isso
 * que a consulta se pode dar à mão com `--query`.
 */
export function scoreCandidate(
  candidate: ImageCandidate,
  position: number,
  recipeName: string,
): number | undefined {
  const bigEnough = (candidate.width ?? 0) >= 800 ? 3 : 0;

  if (candidate.provider && CURATED.has(candidate.provider)) {
    return 20 + bigEnough - position;
  }

  const title = normalise(candidate.title ?? '');
  const name = normalise(recipeName);
  if (!title || !name || !title.includes(name)) return undefined;

  // Entre as que passam, ganha a mais próxima: título curto e alta na relevância do banco.
  const extraWords = title.split(' ').length - name.split(' ').length;
  return 25 + bigEnough - position - extraWords;
}

/** Descarrega, confirma que é mesmo uma imagem, e recusa o que for grande de mais. */
async function download(candidate: ImageCandidate, target: string): Promise<number> {
  const response = await fetch(candidate.url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ao descarregar`);

  const type = response.headers.get('content-type') ?? '';
  if (!type.startsWith('image/')) throw new Error(`respondeu ${type}, não uma imagem`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  const kb = (bytes.byteLength / 1024).toFixed(0);
  if (bytes.byteLength > MAX_BYTES) {
    throw new Error(`${kb} KB, acima do limite de ${MAX_BYTES / 1024} KB`);
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  return bytes.byteLength;
}

interface RecipeFile {
  id: string;
  name: string;
  description?: string;
  image?: string;
  imageCredit?: ReturnType<typeof toCredit>;
  [key: string]: unknown;
}

/**
 * Põe `image` e `imageCredit` logo a seguir a `description`, que é onde o schema os lista.
 *
 * Sem isto, reescrever a receita mandava-os para o fim do ficheiro e o diff parecia muito maior do
 * que a alteração — e diffs legíveis são metade da razão de os dados serem ficheiros.
 */
export function withImage(recipe: RecipeFile, candidate: ImageCandidate): RecipeFile {
  const image = `media/recipes/${recipe.id}.jpg`;
  const imageCredit = toCredit(candidate);

  const updated: RecipeFile = {} as RecipeFile;
  for (const [key, value] of Object.entries(recipe)) {
    if (key === 'image' || key === 'imageCredit') continue;
    updated[key] = value;
    if (key === 'description') {
      updated.image = image;
      updated.imageCredit = imageCredit;
    }
  }

  // Uma receita sem `description` fica com os campos no fim — melhor do que ficar sem eles.
  if (!updated.image) {
    updated.image = image;
    updated.imageCredit = imageCredit;
  }

  return updated;
}

async function findAndSave(recipe: RecipeFile, query: string): Promise<ImageCandidate | undefined> {
  const candidates = await searchFreeImages(query);
  if (candidates.length === 0) return undefined;

  const ranked = candidates
    .map((candidate, index) => ({ candidate, points: scoreCandidate(candidate, index, recipe.name) }))
    .filter((entry): entry is { candidate: ImageCandidate; points: number } => entry.points !== undefined)
    .sort((a, b) => b.points - a.points);

  if (ranked.length === 0) {
    console.log(`  ${candidates.length} candidata(s), nenhuma convincente`);
    return undefined;
  }

  const target = path.join(paths.media, 'recipes', `${recipe.id}.jpg`);

  // Tenta pela ordem: a primeira que descarregue dentro do limite ganha.
  for (const { candidate } of ranked) {
    try {
      const bytes = await download(candidate, target);
      const credit = toCredit(candidate);
      console.log(`  ✓ ${candidate.provider}: "${candidate.title ?? '(sem título)'}"`);
      console.log(`    ${(bytes / 1024).toFixed(0)} KB · ${credit.license} · ${credit.author ?? 'autor não indicado'}`);
      console.log(`    ${credit.sourceUrl ?? candidate.url}`);
      return candidate;
    } catch (error) {
      console.warn(`  ✗ "${candidate.title ?? '?'}": ${String(error)}`);
    }
  }

  return undefined;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  /*
   * `--query` troca o termo de procura, e é o que torna os bancos curados úteis: eles indexam em
   * inglês, e "cod gratin with potatoes" traz muito melhor fotografia do que "bacalhau com natas".
   * Só faz sentido com uma receita de cada vez.
   */
  const queryAt = args.indexOf('--query');
  const query = queryAt >= 0 ? args[queryAt + 1] : undefined;

  const only = args.filter((arg, index) => !arg.startsWith('-') && index !== queryAt + 1);

  if (query && only.length !== 1) {
    console.error('O --query serve para uma receita de cada vez. Diz qual.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(paths.recipes)
    .filter((file) => file.endsWith('.json'))
    .filter((file) => only.length === 0 || only.includes(path.basename(file, '.json')));

  let found = 0;
  let skipped = 0;
  let missing = 0;

  for (const file of files) {
    const full = path.join(paths.recipes, file);
    const recipe = JSON.parse(fs.readFileSync(full, 'utf8')) as RecipeFile;

    if (recipe.image && !force) {
      console.log(`— ${recipe.name}: já tem imagem`);
      skipped++;
      continue;
    }

    console.log(`\n${recipe.name}${query ? `  (a procurar "${query}")` : ''}`);
    const candidate = await findAndSave(recipe, query ?? recipe.name);

    if (!candidate) {
      console.log('  nada aproveitável em nenhum banco');
      missing++;
      continue;
    }

    fs.writeFileSync(full, `${JSON.stringify(withImage(recipe, candidate), null, 2)}\n`, 'utf8');
    console.log(`  → ${rel(full)}`);
    found++;
  }

  console.log(`\n✓ ${found} nova(s), ${skipped} já tinha(m), ${missing} sem resultado`);
  console.log('Falta a parte que uma máquina não faz: confirmar que cada foto mostra o prato certo.');
}

// Só corre como programa. Importado por testes, não faz nada.
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
