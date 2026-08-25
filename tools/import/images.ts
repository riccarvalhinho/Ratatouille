/**
 * Procura imagens de licença livre para servirem de thumbnail.
 *
 * A foto de uma receita num site é obra protegida como qualquer outra, e este repositório é público.
 * Uma imagem CC é usável — desde que a atribuição seja guardada, e é para isso que existe o campo
 * `imageCredit` no schema.
 *
 * ## Os dois bancos, e porquê estes
 *
 * | Banco | Chave? | Licenças | Papel |
 * |---|---|---|---|
 * | **Wikimedia Commons** | não | CC BY, CC BY-SA, CC0, domínio público | Primeiro. Licença explícita por ficheiro e boa cobertura de pratos com nome próprio |
 * | **Openverse** | não | Só CC e domínio público, por construção | Segundo. Agrega Flickr e outros; apanha o que ao Commons falta |
 *
 * Ficaram de fora o Pexels, o Unsplash e o Pixabay. Têm melhor fotografia de comida, mas **exigem
 * uma chave de API** — ou seja, uma conta e um segredo no repositório. Um projeto que existe para
 * não depender de serviços que adormecem (ADR 0002) não deve ganhar uma dependência dessas para ter
 * thumbnails. E a licença própria de cada um deles é mais difícil de cumprir num repositório
 * público do que um CC com atribuição.
 */
export interface ImageCandidate {
  title?: string;
  url: string;
  thumbnailUrl?: string;
  creator?: string;
  license: string;
  licenseVersion?: string;
  licenseUrl?: string;
  sourceUrl?: string;
  provider?: string;
  width?: number;
  height?: number;
}

/**
 * Licenças que se aceitam. Exclui as `nd` (sem derivações), porque redimensionar e recortar para
 * thumbnail é uma derivação, e as `nc` ficam de fora por precaução — o uso é doméstico, mas o
 * repositório é público e não vale a pena a discussão.
 */
const ACCEPTED = ['cc0', 'pdm', 'by', 'by-sa'];

const ENDPOINT = 'https://api.openverse.org/v1/images/';

export async function searchImages(query: string, limit = 6): Promise<ImageCandidate[]> {
  const params = new URLSearchParams({
    q: query,
    license: ACCEPTED.join(','),
    page_size: String(limit),
    // Grande que chegue para uma thumbnail nítida num ecrã de 224 ppi.
    size: 'medium,large',
    mature: 'false',
  });

  const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: {
      'User-Agent': 'RatatouilleImporter/1.0 (https://github.com/riccarvalhinho/Ratatouille)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`O Openverse respondeu ${response.status}.`);
  }

  const data = (await response.json()) as { results?: Record<string, unknown>[] };

  return (data.results ?? []).map((r) => ({
    title: str(r.title),
    url: str(r.url) ?? '',
    thumbnailUrl: str(r.thumbnail),
    creator: str(r.creator),
    license: str(r.license) ?? 'desconhecida',
    licenseVersion: str(r.license_version),
    licenseUrl: str(r.license_url),
    sourceUrl: str(r.foreign_landing_url),
    provider: str(r.provider),
    width: num(r.width),
    height: num(r.height),
  }));
}

const str = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);
const num = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);

/** Largura pedida ao Commons. O cartão maior da app tem 320px; 1200 chega para ecrãs densos. */
const THUMB_WIDTH = 1200;

const USER_AGENT = 'RatatouilleImporter/1.0 (https://github.com/riccarvalhinho/Ratatouille)';

/** Os textos do Commons vêm em HTML — o autor costuma ser um link. */
function stripHtml(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const text = value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return text || undefined;
}

/** Recusa o que não se pode recortar. A app usa `object-fit: cover`, portanto recorta sempre. */
function forbidsDerivatives(license: string): boolean {
  return /\bnd\b|no.?deriv/i.test(license);
}

interface CommonsImageInfo {
  thumburl?: string;
  url?: string;
  width?: number;
  height?: number;
  descriptionurl?: string;
  extmetadata?: Record<string, { value?: string }>;
}

/**
 * Procura no Wikimedia Commons.
 *
 * Uma só chamada: `generator=search` procura e `prop=imageinfo` traz, para cada resultado, a URL já
 * redimensionada e os metadados de licença. Sem isto seriam N+1 pedidos.
 */
export async function searchCommons(query: string, limit = 12): Promise<ImageCandidate[]> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    // Namespace 6 é "File:". O filtro `filetype:bitmap` deixa de fora SVGs e PDFs.
    gsrnamespace: '6',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: String(THUMB_WIDTH),
  });

  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });

  if (!response.ok) throw new Error(`O Commons respondeu ${response.status}.`);

  const data = (await response.json()) as {
    query?: { pages?: Record<string, { title?: string; imageinfo?: CommonsImageInfo[] }> };
  };

  return Object.values(data.query?.pages ?? {}).flatMap((page): ImageCandidate[] => {
    const info = page.imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    const license = stripHtml(meta.LicenseShortName?.value) ?? stripHtml(meta.License?.value);
    const url = info?.thumburl ?? info?.url;

    if (!url || !license || forbidsDerivatives(license)) return [];

    const candidate: ImageCandidate = { url, license, provider: 'wikimedia' };
    if (page.title) candidate.title = page.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '');
    const creator = stripHtml(meta.Artist?.value);
    if (creator) candidate.creator = creator;
    const licenseUrl = stripHtml(meta.LicenseUrl?.value);
    if (licenseUrl) candidate.licenseUrl = licenseUrl;
    if (info?.descriptionurl) candidate.sourceUrl = info.descriptionurl;
    if (info?.width) candidate.width = info.width;
    if (info?.height) candidate.height = info.height;

    return [candidate];
  });
}

/**
 * Procura nos dois bancos, Commons primeiro.
 *
 * Um banco em baixo não faz falhar o outro: se um deitar erro, fica um aviso e continua-se. Vale
 * mais uma thumbnail do que nenhuma.
 */
export async function searchFreeImages(query: string, limit = 12): Promise<ImageCandidate[]> {
  const banks: [string, () => Promise<ImageCandidate[]>][] = [
    ['Commons', () => searchCommons(query, limit)],
    ['Openverse', () => searchImages(query, limit)],
  ];

  const found: ImageCandidate[] = [];
  for (const [name, search] of banks) {
    try {
      found.push(...(await search()));
    } catch (error) {
      console.warn(`  ${name} falhou em "${query}": ${String(error)}`);
    }
  }
  return found;
}

/** Como a atribuição tem de ficar guardada na receita para a licença ser cumprida. */
export function toCredit(image: ImageCandidate): {
  author?: string;
  license: string;
  licenseUrl?: string;
  sourceUrl?: string;
} {
  // O Openverse dá "by-sa" + "4.0" em campos separados; o Commons já dá "CC BY-SA 4.0" feito.
  const license = image.licenseVersion
    ? `${image.license.toUpperCase()} ${image.licenseVersion}`
    : image.license;
  return {
    ...(image.creator ? { author: image.creator } : {}),
    license,
    ...(image.licenseUrl ? { licenseUrl: image.licenseUrl } : {}),
    ...(image.sourceUrl ? { sourceUrl: image.sourceUrl } : {}),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const query = process.argv.slice(2).join(' ');
  if (!query) {
    console.error('Falta o que procurar. Uso: npm run import:image -- "caldo verde"');
    process.exit(1);
  }

  const results = await searchImages(query);
  if (results.length === 0) {
    console.log('\nSem resultados de licença livre para essa pesquisa.\n');
    process.exit(0);
  }

  console.log(`\n${results.length} imagens de licença livre para "${query}":\n`);
  for (const [i, image] of results.entries()) {
    const credit = toCredit(image);
    console.log(`  ${i + 1}. ${image.title ?? '(sem título)'}`);
    console.log(`     ${image.width ?? '?'}×${image.height ?? '?'}  ${credit.license}  ${image.provider ?? ''}`);
    console.log(`     autor: ${credit.author ?? 'não indicado'}`);
    console.log(`     ${image.url}`);
    console.log('');
  }
  console.log('Escolher uma e gravar a atribuição em imageCredit. Sem atribuição, a licença não é cumprida.\n');
}
