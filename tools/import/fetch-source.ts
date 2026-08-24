/**
 * Vai buscar o conteúdo de um link de receita e deixa-o em data/inbox/, pronto a ser normalizado.
 *
 *   npm run import:fetch -- https://exemplo.pt/receita/bacalhau
 *
 * **Porque é que isto existe:** as sessões de Claude Code não conseguem abrir sites — o proxy de
 * saída bloqueia-os. Mas os runners do GitHub Actions têm internet normal. Este script é feito para
 * correr lá (ou no computador de quem importa), e o que ele grava no repositório já é legível por
 * uma sessão. Ver .github/workflows/importar-receita.yml.
 *
 * Não normaliza nada nem decide nada: só recolhe. A interpretação é feita depois, com revisão humana.
 */
import fs from 'node:fs';
import path from 'node:path';
import { paths, rel } from '../paths.ts';
import { fetchVideo } from './video.ts';

export interface FetchedSource {
  url: string;
  fetchedAt: string;
  /** Como é que o conteúdo foi obtido, para se saber quanta confiança lhe dar. */
  via: 'json-ld' | 'video' | 'oembed' | 'meta' | 'texto';
  title?: string;
  author?: string;
  description?: string;
  imageUrl?: string;
  /** JSON-LD schema.org/Recipe, quando o site o publica. É a fonte mais fiável de todas. */
  recipe?: Record<string, unknown>;
  /** Texto legível da página, quando não há estrutura. */
  text?: string;
  /** Transcrição das legendas, quando a fonte é vídeo. */
  transcript?: string;
  transcriptLanguage?: string;
  durationSeconds?: number;
  notes: string[];
}

const USER_AGENT =
  'Mozilla/5.0 (compatible; RatatouilleImporter/1.0; +https://github.com/riccarvalhinho/Ratatouille)';

/** Plataformas onde vale a pena tentar o yt-dlp antes de tratar a página como HTML. */
const VIDEO = /(?:youtube\.com|youtu\.be|tiktok\.com|instagram\.com\/(?:reel|p|tv))/i;

/** Plataformas de vídeo com oEmbed público, usado como rede de segurança se o yt-dlp falhar. */
const OEMBED: { test: RegExp; endpoint: (url: string) => string }[] = [
  {
    test: /(?:youtube\.com|youtu\.be)/i,
    endpoint: (u) => `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(u)}`,
  },
  {
    test: /tiktok\.com/i,
    endpoint: (u) => `https://www.tiktok.com/oembed?url=${encodeURIComponent(u)}`,
  },
];

async function get(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8' },
    redirect: 'follow',
  });
  return { ok: response.ok, status: response.status, body: await response.text() };
}

/** Procura um objeto schema.org/Recipe dentro de um bloco JSON-LD, incluindo @graph e arrays. */
function findRecipe(node: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecipe(item);
      if (found) return found;
    }
    return undefined;
  }
  if (!node || typeof node !== 'object') return undefined;

  const record = node as Record<string, unknown>;
  const type = record['@type'];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((t) => typeof t === 'string' && t.toLowerCase() === 'recipe')) return record;

  if (record['@graph']) return findRecipe(record['@graph']);
  return undefined;
}

function extractJsonLd(html: string): Record<string, unknown> | undefined {
  const blocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const block of blocks) {
    if (!block[1]) continue;
    try {
      const found = findRecipe(JSON.parse(block[1].trim()));
      if (found) return found;
    } catch {
      // JSON-LD partido é comum e não é motivo para desistir da página.
    }
  }
  return undefined;
}

function meta(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1]) return decode(match[1]);
  }
  return undefined;
}

function decode(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/** Texto legível da página, sem scripts, estilos nem navegação. Grosseiro de propósito. */
function readableText(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<(nav|header|footer|aside)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<li[^>]*>/gi, '\n- ')
      .replace(/<\/(p|div|h[1-6]|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

export async function fetchSource(url: string): Promise<FetchedSource> {
  const result: FetchedSource = { url, fetchedAt: new Date().toISOString(), via: 'texto', notes: [] };

  if (VIDEO.test(url)) {
    const video = fetchVideo(url);
    result.notes.push(...video.notes);

    if (video.transcript || video.description) {
      result.via = 'video';
      result.title = video.title;
      result.author = video.uploader;
      result.description = video.description;
      result.imageUrl = video.thumbnailUrl;
      result.transcript = video.transcript;
      result.transcriptLanguage = video.transcriptLanguage;
      result.durationSeconds = video.durationSeconds;
      return result;
    }
    // Sem transcrição nem descrição, ainda vale a pena o oEmbed para o título e o autor.
  }

  const oembed = OEMBED.find((o) => o.test.test(url));
  if (oembed) {
    try {
      const response = await get(oembed.endpoint(url));
      if (response.ok) {
        const data = JSON.parse(response.body) as Record<string, string>;
        result.via = 'oembed';
        result.title = data.title;
        result.author = data.author_name;
        result.imageUrl = data.thumbnail_url;
        result.notes.push(
          'Vídeo: o oEmbed dá título e autor, mas não dá a receita. A receita costuma estar na legenda ou no que é dito — pode ser preciso ver o vídeo e ditar.',
        );
        return result;
      }
      result.notes.push(`oEmbed respondeu ${response.status}.`);
    } catch (error) {
      result.notes.push(`oEmbed falhou: ${(error as Error).message}`);
    }
  }

  if (/instagram\.com/i.test(url)) {
    result.notes.push(
      'O Instagram exige token de API desde 2020 e bloqueia leitura anónima. A receita tem de vir da legenda copiada à mão, ou ditada.',
    );
  }

  const response = await get(url);
  if (!response.ok) {
    result.notes.push(`O site respondeu ${response.status}. Muitos bloqueiam pedidos de datacenter.`);
    return result;
  }

  const html = response.body;
  result.title = meta(html, 'og:title') ?? /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim();
  result.description = meta(html, 'og:description') ?? meta(html, 'description');
  result.imageUrl = meta(html, 'og:image');
  result.author = meta(html, 'article:author') ?? meta(html, 'author');

  const recipe = extractJsonLd(html);
  if (recipe) {
    result.via = 'json-ld';
    result.recipe = recipe;
    result.notes.push('Encontrado schema.org/Recipe — ingredientes e passos vêm estruturados.');
    return result;
  }

  result.via = result.description ? 'meta' : 'texto';
  result.text = readableText(html).slice(0, 20000);
  result.notes.push('Sem schema.org/Recipe. O texto da página vai em bruto, para ser interpretado.');
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2];
  if (!url) {
    console.error('Falta o link. Uso: npm run import:fetch -- https://exemplo.pt/receita');
    process.exit(1);
  }

  const source = await fetchSource(url);
  const name = slugify(source.title ?? new URL(url).pathname) || 'sem-nome';
  const target = path.join(paths.inbox, `${name}.json`);

  fs.mkdirSync(paths.inbox, { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(source, null, 2)}\n`, 'utf8');

  console.log(`\n✓ ${rel(target)}`);
  console.log(`  via: ${source.via}`);
  if (source.title) console.log(`  título: ${source.title}`);
  for (const note of source.notes) console.log(`  · ${note}`);
  console.log('');
}
