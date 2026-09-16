/**
 * Aplica as escolhas feitas em cima das folhas de contacto.
 *
 *   npm run imagens:aplicar
 *
 * Lê `colheita/escolhas.json`, que é o resultado de alguém ter olhado:
 *
 * ```json
 * {
 *   "arroz-de-pato": 3,
 *   "rojoes": 7,
 *   "vichyssoise": null
 * }
 * ```
 *
 * O número é o que está desenhado no canto da miniatura na `folha.jpg`; `null` quer dizer "vi as
 * doze e nenhuma serve", e é uma resposta legítima — **uma fotografia errada é pior do que
 * nenhuma**, porque quem monta a semana escolhe pelo cartão e não abre a receita.
 *
 * Só aqui é que a imagem em tamanho real é descarregada, e só a escolhida. As miniaturas da
 * colheita nunca entram em `media/`.
 */
import fs from 'node:fs';
import path from 'node:path';

import { MAX_BYTES, withImage } from './buscar-imagens.ts';
import { encolher } from './encolher-imagem.ts';
import { toCredit, type ImageCandidate } from './import/images.ts';
import { paths, repoRoot, rel } from './paths.ts';

const COLHEITA = path.join(repoRoot, 'colheita');
const ESCOLHAS = path.join(COLHEITA, 'escolhas.json');

/**
 * Teto do que se descarrega antes de encolher.
 *
 * O limite que interessa é o do repositório (`MAX_BYTES`), e esse aplica-se ao que fica em disco.
 * Este é só para não puxar um TIFF de 40 MB de um arquivo por engano.
 */
const MAX_DESCARGA = 12 * 1024 * 1024;

const USER_AGENT = 'RatatouilleImporter/1.0 (https://github.com/riccarvalhinho/Ratatouille)';

/**
 * Descarrega a escolhida e, se for grande de mais, encolhe-a em vez de a recusar.
 *
 * Recusar foi o que se fez à primeira, e deitou fora oito fotografias certas por terem 350 KB. O
 * que o repositório precisa é que o ficheiro seja pequeno, não que já tenha nascido pequeno.
 */
async function guardar(candidata: ImageCandidate, destino: string): Promise<[number, boolean]> {
  const resposta = await fetch(candidata.url, { headers: { 'User-Agent': USER_AGENT } });
  if (!resposta.ok) throw new Error(`${resposta.status} ao descarregar`);

  const tipo = resposta.headers.get('content-type') ?? '';
  if (!tipo.startsWith('image/')) throw new Error(`respondeu ${tipo}, não uma imagem`);

  const bytes = Buffer.from(await resposta.arrayBuffer());
  if (bytes.byteLength > MAX_DESCARGA) {
    throw new Error(`${(bytes.byteLength / 1024 / 1024).toFixed(1)} MB, grande de mais para tratar`);
  }

  const encolhida = bytes.byteLength > MAX_BYTES;
  const final = encolhida ? encolher(bytes, MAX_BYTES) : bytes;
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, final);
  return [final.byteLength, encolhida];
}

interface Manifesto {
  id: string;
  name: string;
  candidatas: (ImageCandidate & { numero: number })[];
}

interface Receita {
  id: string;
  name: string;
  description?: string;
  image?: string;
  imageCredit?: ReturnType<typeof toCredit>;
  [key: string]: unknown;
}

if (!fs.existsSync(ESCOLHAS)) {
  console.error(`Não há ${rel(ESCOLHAS)}. Corre primeiro a colheita e escolhe a olhar.`);
  process.exit(1);
}

const escolhas = JSON.parse(fs.readFileSync(ESCOLHAS, 'utf8')) as Record<string, number | null>;

let aplicadas = 0;
let dispensadas = 0;
const falhas: string[] = [];

for (const [id, numero] of Object.entries(escolhas)) {
  if (numero === null) {
    console.log(`— ${id}: nenhuma serve, fica sem imagem`);
    dispensadas += 1;
    continue;
  }

  const manifesto = path.join(COLHEITA, id, 'candidatas.json');
  if (!fs.existsSync(manifesto)) {
    falhas.push(`${id}: não há colheita nenhuma`);
    continue;
  }

  const { candidatas } = JSON.parse(fs.readFileSync(manifesto, 'utf8')) as Manifesto;
  const candidata = candidatas.find((entrada) => entrada.numero === numero);
  if (!candidata) {
    falhas.push(`${id}: não existe o número ${numero} nesta folha`);
    continue;
  }

  const ficheiroReceita = path.join(paths.recipes, `${id}.json`);
  if (!fs.existsSync(ficheiroReceita)) {
    falhas.push(`${id}: a receita não existe`);
    continue;
  }

  const destino = path.join(paths.media, 'recipes', `${id}.jpg`);
  try {
    const [bytes, encolhida] = await guardar(candidata, destino);
    const receita = JSON.parse(fs.readFileSync(ficheiroReceita, 'utf8')) as Receita;
    fs.writeFileSync(
      ficheiroReceita,
      `${JSON.stringify(withImage(receita, candidata), null, 2)}\n`,
      'utf8',
    );
    const credito = toCredit(candidata);
    const nota = encolhida ? ' (encolhida)' : '';
    console.log(`✓ ${id}: #${numero} · ${(bytes / 1024).toFixed(0)} KB${nota} · ${credito.license}`);
    aplicadas += 1;
  } catch (erro) {
    falhas.push(`${id}: #${numero} não entrou — ${String(erro)}`);
  }
}

console.log(`\n${aplicadas} imagem(ns) aplicada(s), ${dispensadas} receita(s) deixada(s) sem imagem.`);
if (falhas.length > 0) {
  console.log('\nPor resolver:');
  for (const falha of falhas) console.log(`  ${falha}`);
  process.exit(1);
}
