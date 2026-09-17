/**
 * O crédito de quem escreveu a receita, para o rodapé do ecrã de detalhe.
 *
 * **Porque é que isto existe:** o `imageCredit` já se via no ecrã desde o início, mas o `source`
 * nunca se viu — estava em todos os ficheiros e não chegava a lado nenhum. O catálogo creditava
 * um estranho do Flickr pela fotografia e não creditava quem tinha escrito a receita que se
 * cozinhava. O ADR 0006 inverteu a política das imagens e isto é a outra metade da mesma decisão:
 * se a fotografia da fonte passa a poder entrar, o mínimo é a fonte ser nomeada onde se lê a
 * receita, e não só no JSON.
 *
 * Só credita quem é de fora. Uma receita `propria`, de `familia` ou `gerada` não tem dono externo
 * a nomear — creditar a casa a si própria é ruído, e creditar "Claude" por uma receita gerada dá
 * ares de autoria a um texto que ninguém cozinhou.
 */
import type { RecipeSource } from './types.ts';

export interface CreditoDaReceita {
  /** A frase já montada, pronta a ler. Nunca vazia. */
  texto: string;
  /** Para onde aponta o "ver original". Ausente quando a fonte não deixou link. */
  url?: string;
}

/** As proveniências que têm dono de fora. As outras são desta casa e não se creditam. */
const EXTERNAS = new Set(['livro', 'web', 'video', 'importada']);

/**
 * A nota de rodapé de uma receita, ou `undefined` quando não há nada de fora a creditar.
 *
 * O aviso de adaptação vai colado ao crédito de propósito: as instruções deste catálogo são sempre
 * reescritas e as medidas convertidas, portanto dizer só "receita de X" atribuiria a X um texto que
 * não é dele.
 */
export function creditoDaReceita(source?: RecipeSource): CreditoDaReceita | undefined {
  if (!source?.kind || !EXTERNAS.has(source.kind)) return undefined;

  const { author, title, url } = source;
  if (!author && !title && !url) return undefined;

  let quem: string;
  if (author && title) quem = `${author}, «${title}»`;
  else if (author) quem = author;
  else if (title) quem = `«${title}»`;
  else quem = 'outra cozinha';

  return { texto: `Receita original de ${quem}, aqui reescrita e adaptada.`, url };
}
