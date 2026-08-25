/**
 * Procura imagens de licença livre para servirem de thumbnail.
 *
 * A foto de uma receita num site é obra protegida como qualquer outra, e este repositório é público.
 * Uma imagem CC é usável — desde que a atribuição seja guardada, e é para isso que existe o campo
 * `imageCredit` no schema.
 *
 * ## Os quatro bancos
 *
 * | Banco | Chave? | Licença | Papel |
 * |---|---|---|---|
 * | **Pexels** | sim, grátis | Pexels License: usar, modificar, alojar, sem pagar | Primeiro **quando há chave**. É de longe o que tem fotografia de estúdio |
 * | **Pixabay** | sim, grátis | Pixabay Content License, semelhante | Segundo com chave |
 * | **Wikimedia Commons** | não | CC BY, CC BY-SA, CC0, domínio público | Sempre. Cobre pratos com nome próprio |
 * | **Openverse** | não | Só CC e domínio público | Sempre, por último. Agrega Flickr |
 *
 * ### Porque é que os dois primeiros entraram, depois de eu os ter excluído
 *
 * Excluí-os na primeira versão com o argumento de que "um segredo no repositório" contraria o
 * espírito do projeto. **Estava errado em duas coisas.**
 *
 * A chave não vai para o repositório: vai para os *repository secrets* do GitHub, que é onde os
 * segredos devem estar e nunca aparecem no código. Confundi as duas coisas.
 *
 * E a ADR 0002 — não depender de serviços que adormecem — não se aplica aqui. Estes bancos são
 * consultados **uma vez por receita, ao importar**, não em tempo de execução. Se o Pexels fechar
 * amanhã, as fotografias já descarregadas continuam no repositório e a app nem dá por isso.
 *
 * O custo verdadeiro é outro, e é pequeno: uma conta gratuita e uma chave colada nos segredos do
 * repositório, uma vez. Sem chave, o programa salta estes bancos e usa só os outros dois.
 *
 * ### A obrigação que vem com eles
 *
 * As duas licenças dispensam atribuição para uso normal, **mas os termos das APIs pedem que se diga
 * de onde a imagem veio**. Por isso o crédito é guardado em `imageCredit` e — desde esta versão —
 * **mostrado no ecrã de detalhe**. Vale para os quatro bancos: as licenças CC BY e CC BY-SA exigem
 * crédito de qualquer maneira, e guardá-lo só no JSON não era cumprir.
 *
 * O Unsplash continua de fora. A fotografia é a melhor das quatro, mas os termos da API pedem que as
 * imagens sejam servidas a partir deles e que cada descarga seja notificada — o que não combina com
 * uma app que tem de funcionar offline numa cozinha.
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

/** Chaves opcionais. Sem elas, o banco correspondente é simplesmente saltado. */
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_KEY = process.env.PIXABAY_API_KEY;

/**
 * Pexels. É o que tem fotografia de estúdio a sério.
 *
 * `orientation=landscape` porque todos os sítios onde a imagem aparece são mais largos do que altos:
 * o cartão do catálogo é 4:3, a thumbnail do plano é 320×64, e o detalhe é 4:3. Uma fotografia
 * vertical seria recortada até não sobrar prato.
 */
export async function searchPexels(query: string, limit = 12): Promise<ImageCandidate[]> {
  if (!PEXELS_KEY) return [];

  const params = new URLSearchParams({
    query,
    per_page: String(limit),
    orientation: 'landscape',
  });

  const response = await fetch(`https://api.pexels.com/v1/search?${params.toString()}`, {
    headers: { Authorization: PEXELS_KEY, 'User-Agent': USER_AGENT },
  });

  if (!response.ok) throw new Error(`O Pexels respondeu ${response.status}.`);

  const data = (await response.json()) as {
    photos?: {
      alt?: string;
      photographer?: string;
      url?: string;
      width?: number;
      height?: number;
      src?: { large?: string; medium?: string };
    }[];
  };

  return (data.photos ?? []).flatMap((photo): ImageCandidate[] => {
    const url = photo.src?.large ?? photo.src?.medium;
    if (!url) return [];

    const candidate: ImageCandidate = {
      url,
      license: 'Pexels License',
      licenseUrl: 'https://www.pexels.com/license/',
      provider: 'pexels',
      // O `alt` do Pexels descreve a fotografia; serve de título e alimenta a verificação.
      title: photo.alt ?? query,
    };
    if (photo.photographer) candidate.creator = photo.photographer;
    if (photo.url) candidate.sourceUrl = photo.url;
    if (photo.width) candidate.width = photo.width;
    if (photo.height) candidate.height = photo.height;
    return [candidate];
  });
}

/** Pixabay. Segundo dos bancos com chave; produção mais irregular do que a do Pexels. */
export async function searchPixabay(query: string, limit = 12): Promise<ImageCandidate[]> {
  if (!PIXABAY_KEY) return [];

  const params = new URLSearchParams({
    key: PIXABAY_KEY,
    q: query,
    per_page: String(limit),
    image_type: 'photo',
    orientation: 'horizontal',
    category: 'food',
    safesearch: 'true',
  });

  const response = await fetch(`https://pixabay.com/api/?${params.toString()}`, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) throw new Error(`O Pixabay respondeu ${response.status}.`);

  const data = (await response.json()) as {
    hits?: {
      tags?: string;
      user?: string;
      pageURL?: string;
      largeImageURL?: string;
      webformatURL?: string;
      imageWidth?: number;
      imageHeight?: number;
    }[];
  };

  return (data.hits ?? []).flatMap((hit): ImageCandidate[] => {
    const url = hit.webformatURL ?? hit.largeImageURL;
    if (!url) return [];

    const candidate: ImageCandidate = {
      url,
      license: 'Pixabay Content License',
      licenseUrl: 'https://pixabay.com/service/license-summary/',
      provider: 'pixabay',
      // O Pixabay não dá título; as tags são o que mais se aproxima de uma descrição.
      title: hit.tags ?? query,
    };
    if (hit.user) candidate.creator = hit.user;
    if (hit.pageURL) candidate.sourceUrl = hit.pageURL;
    if (hit.imageWidth) candidate.width = hit.imageWidth;
    if (hit.imageHeight) candidate.height = hit.imageHeight;
    return [candidate];
  });
}

/**
 * Procura nos quatro bancos.
 *
 * Um banco em baixo não faz falhar o outro: se um deitar erro, fica um aviso e continua-se. Vale
 * mais uma thumbnail do que nenhuma.
 */
export async function searchFreeImages(query: string, limit = 12): Promise<ImageCandidate[]> {
  const banks: [string, () => Promise<ImageCandidate[]>][] = [
    ['Pexels', () => searchPexels(query, limit)],
    ['Pixabay', () => searchPixabay(query, limit)],
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
