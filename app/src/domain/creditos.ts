/**
 * O que se diz sobre a **fonte** de uma receita, nos dois sítios onde ela aparece: o crédito em
 * rodapé no ecrã de detalhe, e a marca de autor no cartão do catálogo.
 *
 * As duas regras são diferentes de propósito, e estão no mesmo ficheiro para a diferença se ver:
 * o **crédito** existe para nomear quem é de fora, e por isso só aparece para quem é de fora; a
 * **marca do cartão** existe para dizer que houve uma pessoa a escolher aquela receita, e por isso
 * aparece para tudo menos o que foi gerado.
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
import { SOURCE_KIND_NAMES, type RecipeSource, type RecipeSourceKind } from './types.ts';

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

/**
 * A marca de autor do cartão do catálogo, ou `undefined` quando não há nada a marcar.
 *
 * **Aparece em tudo menos no que foi gerado**, e é isso que a torna útil: hoje 231 das 233 receitas
 * são `gerada`, e marcar essas seria escrever a mesma palavra em todo o lado. Marcada fica a
 * exceção — a que veio dos sogros, a que se tirou de um site, a que é nossa. A ausência da marca
 * passa a querer dizer "esta foi escrita por um modelo", que é exatamente a informação que se quer.
 *
 * Uma receita sem `kind` não leva marca. Não se adivinha de onde veio uma receita, pela mesma regra
 * que o filtro segue em `matchesFilters`.
 *
 * O nome é o do critério e não o `source.author`: o autor é texto livre e "The Golden Grace
 * Kitchen" parte o cartão em duas linhas. Quem quiser o nome completo abre o detalhe, que é onde o
 * crédito vive.
 */
export function fonteDoCartao(source?: RecipeSource): { kind: RecipeSourceKind; nome: string } | undefined {
  const kind = source?.kind;
  if (!kind || kind === 'gerada') return undefined;
  return { kind, nome: SOURCE_KIND_NAMES[kind] };
}
