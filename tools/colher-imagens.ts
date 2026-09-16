/**
 * Colhe candidatas a fotografia, sem escolher nenhuma.
 *
 *   npm run imagens:colher                 # todas as receitas sem imagem
 *   npm run imagens:colher -- arroz-de-pato
 *
 * A diferença para o `buscar-imagens.ts` é toda: aquele pede uma dúzia de candidatas a cada banco,
 * commita a primeira e deita as outras fora sem ninguém as ver. A taxa de acerto medida foi de 45%
 * — e essa é a taxa de **acertar à primeira, às cegas**, não a de haver uma boa fotografia no
 * monte. Este guarda o monte inteiro e compõe uma folha de contacto por receita, para a escolha ser
 * feita a olhar.
 *
 * O que sai daqui vive em `colheita/`, que é material de trabalho e **não entra no `main`**.
 *
 * Depois de escolher, `colheita/escolhas.json` leva `{ "<id>": <número na folha> }` — ou `null`
 * para "nenhuma serve" — e o `aplicar-escolhas.ts` trata do resto.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { searchFreeImages, type ImageCandidate } from './import/images.ts';
import { comporFolha, type Celula } from './folha-de-contacto.ts';
import { readJsonDir } from './load-data.ts';
import { paths, repoRoot, rel } from './paths.ts';

const CONSULTAS = path.join(path.dirname(fileURLToPath(import.meta.url)), 'consultas-de-imagem.json');
const COLHEITA = path.join(repoRoot, 'colheita');

/** Uma folha de 4×3. Mais do que isto e as miniaturas ficam pequenas de mais para julgar. */
const POR_RECEITA = 12;

/** Miniaturas, não fotografias: o que se julga aqui é o prato, e para isso 300px chegam. */
const MAX_MINIATURA = 600 * 1024;

interface Receita {
  id: string;
  name: string;
  image?: string;
  source?: { kind?: string };
}

/**
 * Receitas de família não entram, e não é por esquecimento.
 *
 * Uma fotografia de banco de costelas parecidas não é a mesma receita: punha o prato de outra
 * pessoa com o nome dos sogros por cima. Para estas a única via é a fotografia própria — está
 * escrito em `docs/ops/imagens.md` e é a razão de a regra viver aqui no código, onde não se perde.
 */
function elegivel(receita: Receita): boolean {
  if (receita.image) return false;
  return receita.source?.kind !== 'familia';
}

function termosPara(id: string): string[] {
  const consultas = JSON.parse(fs.readFileSync(CONSULTAS, 'utf8')) as Record<string, string[] | string>;
  const entrada = consultas[id];
  if (!entrada) return [];
  return Array.isArray(entrada) ? entrada : [entrada];
}

/**
 * Intercala os bancos em vez de os concatenar.
 *
 * Concatenados, as doze primeiras candidatas eram sempre do primeiro banco a responder e a folha
 * mostrava doze variações do mesmo engano. Intercalados, a folha mostra o que cada banco tem de
 * melhor — e foi precisamente o Commons, que ficava para o fim, que teve a melhor taxa de acerto.
 */
export function intercalarPorBanco(candidatas: ImageCandidate[]): ImageCandidate[] {
  const porBanco = new Map<string, ImageCandidate[]>();
  for (const candidata of candidatas) {
    const banco = candidata.provider ?? 'desconhecido';
    const lista = porBanco.get(banco) ?? [];
    lista.push(candidata);
    porBanco.set(banco, lista);
  }

  const filas = [...porBanco.values()];
  const saida: ImageCandidate[] = [];
  for (let volta = 0; saida.length < candidatas.length; volta += 1) {
    let houve = false;
    for (const fila of filas) {
      const proxima = fila[volta];
      if (proxima) {
        saida.push(proxima);
        houve = true;
      }
    }
    if (!houve) break;
  }
  return saida;
}

/** A mesma fotografia aparece em bancos diferentes e com o mesmo termo em consultas diferentes. */
export function semRepetidas(candidatas: ImageCandidate[]): ImageCandidate[] {
  const vistas = new Set<string>();
  return candidatas.filter((candidata) => {
    const chave = candidata.sourceUrl ?? candidata.url;
    if (vistas.has(chave)) return false;
    vistas.add(chave);
    return true;
  });
}

async function descarregarMiniatura(candidata: ImageCandidate, destino: string): Promise<boolean> {
  const origem = candidata.thumbnailUrl ?? candidata.url;
  try {
    const resposta = await fetch(origem, {
      headers: { 'User-Agent': 'RatatouilleImporter/1.0 (https://github.com/riccarvalhinho/Ratatouille)' },
    });
    if (!resposta.ok) throw new Error(`${resposta.status}`);
    if (!(resposta.headers.get('content-type') ?? '').startsWith('image/')) {
      throw new Error('não é uma imagem');
    }
    const bytes = new Uint8Array(await resposta.arrayBuffer());
    if (bytes.byteLength > MAX_MINIATURA) throw new Error(`${(bytes.byteLength / 1024) | 0} KB`);
    fs.writeFileSync(destino, bytes);
    return true;
  } catch (erro) {
    console.warn(`    miniatura falhou (${origem.slice(0, 60)}): ${String(erro)}`);
    return false;
  }
}

async function colher(receita: Receita): Promise<number> {
  const termos = termosPara(receita.id);
  if (termos.length === 0) {
    console.log(`  ${receita.id}: sem consulta em consultas-de-imagem.json — saltada`);
    return 0;
  }

  // Todos os termos, e não o primeiro que der resultado: o objetivo aqui é largura de escolha.
  const todas: ImageCandidate[] = [];
  for (const termo of termos) {
    try {
      todas.push(...(await searchFreeImages(termo)));
    } catch (erro) {
      console.warn(`    "${termo}" falhou: ${String(erro)}`);
    }
  }

  const escolhidas = intercalarPorBanco(semRepetidas(todas)).slice(0, POR_RECEITA);
  if (escolhidas.length === 0) {
    console.log(`  ${receita.id}: nenhuma candidata com licença aceitável`);
    return 0;
  }

  const pasta = path.join(COLHEITA, receita.id);
  fs.rmSync(pasta, { recursive: true, force: true });
  fs.mkdirSync(pasta, { recursive: true });

  const celulas: Celula[] = [];
  const manifesto: (ImageCandidate & { numero: number })[] = [];
  for (const [indice, candidata] of escolhidas.entries()) {
    const numero = indice + 1;
    const ficheiro = path.join(pasta, `${String(numero).padStart(2, '0')}.jpg`);
    if (!(await descarregarMiniatura(candidata, ficheiro))) continue;
    celulas.push({
      ficheiro,
      // O mesmo número que vai para o manifesto, e não a posição na folha. Ver `Celula.numero`.
      numero,
      legenda: `${candidata.provider ?? '?'} · ${candidata.title ?? 'sem título'}`,
    });
    manifesto.push({ ...candidata, numero });
  }

  if (celulas.length === 0) {
    console.log(`  ${receita.id}: nenhuma miniatura descarregou`);
    return 0;
  }

  fs.writeFileSync(
    path.join(pasta, 'candidatas.json'),
    `${JSON.stringify({ id: receita.id, name: receita.name, termos, candidatas: manifesto }, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(pasta, 'folha.jpg'), comporFolha(celulas));

  console.log(`  ✓ ${receita.id}: ${celulas.length} candidata(s) → ${rel(path.join(pasta, 'folha.jpg'))}`);
  return celulas.length;
}

async function main(): Promise<void> {
  const pedidos = process.argv.slice(2).filter((argumento) => !argumento.startsWith('--'));
  const receitas = readJsonDir<Receita>(paths.recipes)
    .map((entrada) => entrada.data)
    .filter((receita) => (pedidos.length > 0 ? pedidos.includes(receita.id) : elegivel(receita)))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (receitas.length === 0) {
    console.error(
      pedidos.length > 0 ? 'Nenhuma dessas receitas existe.' : 'Nenhuma receita sem imagem.',
    );
    process.exit(1);
  }

  console.log(`A colher candidatas para ${receitas.length} receita(s).\n`);

  let comFolha = 0;
  for (const receita of receitas) {
    const quantas = await colher(receita);
    if (quantas > 0) comFolha += 1;
    // Os bancos não gostam de rajadas, e esta corrida não tem pressa nenhuma.
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n${comFolha} de ${receitas.length} com folha de contacto em ${rel(COLHEITA)}/.`);
  console.log('Escolher a olhar, e escrever colheita/escolhas.json com { "<id>": <número> | null }.');
}

// Só corre como programa. Importado por testes, não faz nada.
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
