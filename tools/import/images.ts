/**
 * Procura imagens de licença livre para servirem de thumbnail.
 *
 * Usa o **Openverse**, o agregador da WordPress Foundation: só devolve conteúdo Creative Commons ou
 * de domínio público, traz a licença e a atribuição em cada resultado, e não exige chave de API.
 *
 * É por isso que serve onde a fotografia da fonte não serve. A foto de uma receita num site é obra
 * protegida como qualquer outra, e este repositório é público. Uma imagem CC é usável — desde que a
 * atribuição seja guardada, e é para isso que existe o campo `imageCredit` no schema.
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

/** Como a atribuição tem de ficar guardada na receita para a licença ser cumprida. */
export function toCredit(image: ImageCandidate): {
  author?: string;
  license: string;
  licenseUrl?: string;
  sourceUrl?: string;
} {
  const license = image.licenseVersion
    ? `${image.license.toUpperCase()} ${image.licenseVersion}`
    : image.license.toUpperCase();
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
