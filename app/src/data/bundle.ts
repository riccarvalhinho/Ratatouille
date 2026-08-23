/**
 * Carregamento do bundle de dados.
 *
 * Estratégia: mostrar a cache primeiro se existir (a app abre instantânea e funciona sem rede), e
 * tentar a rede a seguir para atualizar. Nunca deixar uma falha de rede impedir a app de abrir.
 */
import type { DataBundle } from '../domain/types.ts';
import { SUPPORTED_BUNDLE_FORMAT } from '../domain/types.ts';
import { readCachedBundle, writeCachedBundle } from './cache.ts';

const BUNDLE_URL = `${import.meta.env.BASE_URL}data/bundle.json`;

export type BundleOrigin = 'rede' | 'cache';

export interface BundleResult {
  bundle: DataBundle;
  origin: BundleOrigin;
}

function assertSupported(bundle: DataBundle): DataBundle {
  if (bundle.formatVersion !== SUPPORTED_BUNDLE_FORMAT) {
    throw new Error(
      `O bundle está no formato ${bundle.formatVersion} e esta versão da app lê o formato ${SUPPORTED_BUNDLE_FORMAT}.`,
    );
  }
  return bundle;
}

/** Cabeçalho que o service worker acrescenta quando serve uma resposta da cache. Ver app/public/sw.js. */
const CACHE_HEADER = 'X-Ratatouille-Cache';

async function fetchBundle(): Promise<BundleResult> {
  const response = await fetch(BUNDLE_URL, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`O servidor respondeu ${response.status} ao pedir os dados.`);

  // Um fetch bem-sucedido não quer dizer que houve rede: o service worker pode ter respondido da
  // cache. Se não distinguirmos, a app diz "atualizado" com dados de há três dias.
  const origin: BundleOrigin = response.headers.get(CACHE_HEADER) === 'hit' ? 'cache' : 'rede';

  return { bundle: assertSupported((await response.json()) as DataBundle), origin };
}

/**
 * Devolve o bundle mais recente que conseguir, e diz de onde veio.
 * Só lança se não houver nem rede nem cache — aí não há mesmo nada a mostrar.
 */
export async function loadBundle(): Promise<BundleResult> {
  const cached = await readCachedBundle();

  try {
    const result = await fetchBundle();
    void writeCachedBundle(result.bundle);
    return result;
  } catch (error) {
    if (cached) {
      console.info('Sem rede; a usar os dados guardados localmente.', error);
      return { bundle: cached, origin: 'cache' };
    }
    throw error;
  }
}
