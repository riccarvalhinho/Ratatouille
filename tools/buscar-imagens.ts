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
 *   npx tsx tools/buscar-imagens.ts                  # todas as que não têm imagem
 *   npx tsx tools/buscar-imagens.ts caldo-verde      # só esta
 *   npx tsx tools/buscar-imagens.ts --force          # substitui as que já têm
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

/** Palavras do nome que valem a pena procurar. "com", "de" e "e" apareceriam em tudo. */
export function termsOf(name: string): string[] {
  return normalise(name).split(' ').filter((term) => term.length > 3);
}

/**
 * Decide se uma candidata serve, e quanto.
 *
 * A primeira versão só contava palavras do nome no título, e trouxe um **biryani indiano** para o
 * "Arroz de frango": o ficheiro chamava-se "Paparis, apas, achares e arroz biriani de frango" e
 * casou "arroz" e "frango". Duas palavras certas, prato errado.
 *
 * A regra que isso ensinou: o que distingue um acerto de uma coincidência é o nome aparecer
 * **inteiro e seguido**, ou o título ser curto o suficiente para não estar a falar de outra coisa.
 * Daí as duas portas:
 *
 * 1. o título contém o nome da receita como frase — "Arroz doce - Jul 2008" entra por aqui;
 * 2. ou tem todas as palavras significativas **e** não mais de três palavras a mais.
 *
 * O biryani falha as duas: não tem "arroz de frango" seguido, e traz cinco palavras a mais.
 *
 * Quem não passa é recusado, não é despromovido. **Nenhuma imagem é melhor do que a errada** — a app
 * já mostra bem uma receita sem fotografia, e uma fotografia errada mente.
 */
export function scoreCandidate(
  candidate: ImageCandidate,
  position: number,
  recipeName: string,
): number | undefined {
  const title = normalise(candidate.title ?? '');
  if (!title) return undefined;

  const name = normalise(recipeName);
  const terms = termsOf(recipeName);

  const hasPhrase = title.includes(name);
  const present = terms.filter((term) => title.includes(term)).length;
  const extraWords = title.split(' ').length - name.split(' ').length;

  const complete = terms.length > 0 && present === terms.length;
  if (!hasPhrase && !(complete && extraWords <= 3)) return undefined;

  const bigEnough = (candidate.width ?? 0) >= 800 ? 3 : 0;
  return (hasPhrase ? 25 : 0) + present * 5 + bigEnough - position - Math.max(0, extraWords);
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

async function findAndSave(recipe: RecipeFile): Promise<ImageCandidate | undefined> {
  const candidates = await searchFreeImages(recipe.name);
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
  const only = args.filter((arg) => !arg.startsWith('-'));

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

    console.log(`\n${recipe.name}`);
    const candidate = await findAndSave(recipe);

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
