/**
 * Os nove critérios do painel "Apetece-me algo". Ver `docs/conversas/07-vocabulario-labels.md`.
 *
 * Este ficheiro é só a **descrição** dos critérios: que opções tem cada um, de onde vêm, e como cada
 * escolha mexe nos filtros do catálogo. Não sabe desenhar nada.
 *
 * A regra que o governa: **o painel escreve nos mesmos filtros que a barra do catálogo mostra.** Duas
 * entradas para o mesmo estado não fazem mal nenhum; dois estados fariam. É por isso que aqui não há
 * estado próprio — cada opção é uma função que devolve os filtros com aquilo dentro ou fora.
 *
 * Cinco dos nove são labels e saem da taxonomia em tempo de execução, para uma label nova aparecer no
 * painel sem passar por aqui. Os outros quatro não são labels: o método sai de `methods`, o tempo de
 * `timing`, o apetite de `weight`, e a proveniência de `source.kind`.
 *
 * **O coração dos favoritos não está aqui**, e é de propósito: escolhe-se uma vez por receita e não
 * por apetência, e vive na barra do catálogo. Escreve no mesmo `CatalogueFilters` na mesma — ver
 * `filters.favouritos`.
 */
import type { Catalogue } from '../data/catalogue.ts';
import {
  DURATION_BAND_NAMES,
  type CatalogueFilters,
  type DurationBand,
  hasLabel,
  matchesFilters,
  toggleFilter,
  toggleLabel,
} from './filters.ts';
import {
  SOURCE_KIND_NAMES,
  type CookingMethod,
  type Recipe,
  type RecipeSourceKind,
  type Weight,
} from './types.ts';

/** A chave do ícone. Tem de existir em `app/src/ui/icones-triagem.tsx`. */
export type ChaveIcone = string;

export interface OpcaoTriagem {
  id: string;
  nome: string;
  /**
   * Sem ícone quando a opção **é** um número. Os escalões de tempo não levam desenho de propósito:
   * o tempo é uma quantidade, e quatro relógios com ponteiros diferentes são a pior maneira de dizer
   * 20, 40 e 60. Ver `docs/design/icones-triagem.md`.
   */
  icone?: ChaveIcone;
  /** Está escolhida nos filtros atuais? */
  escolhida: (filters: CatalogueFilters) => boolean;
  /** Liga ou desliga. Nunca substitui os outros critérios. */
  alternar: (filters: CatalogueFilters) => CatalogueFilters;
}

export interface CriterioTriagem {
  id: string;
  nome: string;
  icone: ChaveIcone;
  opcoes: OpcaoTriagem[];
  /**
   * O regime corta por regra e não estreita por apetência — fica visualmente à parte, e é o único
   * que não se limpa ao fechar o painel. Ver a conversa 7.
   */
  eRegra?: boolean;
}

const METODOS: { id: CookingMethod; nome: string }[] = [
  { id: 'tacho', nome: 'Tacho' },
  { id: 'forno', nome: 'Forno' },
  { id: 'frigideira', nome: 'Frigideira' },
  { id: 'grelhador', nome: 'Grelhador' },
  { id: 'airfryer', nome: 'Airfryer' },
  { id: 'micro-ondas', nome: 'Micro-ondas' },
  { id: 'sem-confecao', nome: 'Sem cozinhar' },
];

const APETITES: { id: Weight; nome: string }[] = [
  { id: 'leve', nome: 'Leve' },
  { id: 'equilibrado', nome: 'Equilibrado' },
  { id: 'substancial', nome: 'Substancial' },
];

/**
 * De quem é a receita. A ordem vai **de dentro de casa para fora** — nossa, família, amigos, e só
 * depois o que veio de um livro ou de um ecrã — porque é essa a ordem por que se pensa nelas.
 *
 * A `gerada` fica no fim por ser hoje a esmagadora maioria do catálogo: pô-la à frente fazia o
 * critério parecer que só tem uma resposta.
 */
const PROVENIENCIAS = Object.keys(SOURCE_KIND_NAMES) as RecipeSourceKind[];

const TEMPOS = Object.keys(DURATION_BAND_NAMES) as DurationBand[];

function opcaoDeLista<T extends string>(
  id: T,
  nome: string,
  campo: 'methods' | 'weights' | 'durations' | 'sources',
): OpcaoTriagem {
  return {
    id,
    nome,
    icone: id,
    escolhida: (f) => (f[campo] as string[]).includes(id),
    alternar: (f) => toggleFilter(f, campo, id as never),
  };
}

/**
 * Monta os nove critérios a partir do catálogo carregado.
 *
 * Os grupos de labels saem da taxonomia e não de uma lista escrita aqui: acrescentar uma cultura ao
 * `labels.json` põe-na no painel sem tocar em código. A ordem dentro de cada grupo é a do ficheiro,
 * que é onde ela se decide.
 */
export function criteriosDeTriagem(catalogue: Catalogue): CriterioTriagem[] {
  const porGrupo = new Map<string, OpcaoTriagem[]>();
  for (const label of catalogue.labelsById.values()) {
    const opcoes = porGrupo.get(label.group) ?? [];
    opcoes.push({
      id: label.id,
      nome: label.name,
      icone: label.id,
      escolhida: (f) => hasLabel(f, label.group, label.id),
      alternar: (f) => toggleLabel(f, label.group, label.id),
    });
    porGrupo.set(label.group, opcoes);
  }

  /** Um critério feito de um grupo de labels. O ícone é o de uma das opções, quando não tem próprio. */
  const deLabels = (
    grupo: string,
    nome: string,
    icone: ChaveIcone,
    eRegra?: boolean,
  ): CriterioTriagem => ({ id: grupo, nome, icone, opcoes: porGrupo.get(grupo) ?? [], eRegra });

  // A ordem do painel: o que se decide primeiro à esquerda, a regra no fim.
  return [
    deLabels('tipo-de-prato', 'Tipo de refeição', 'tipo-refeicao'),
    deLabels('ingrediente', 'Ingrediente principal', 'aves'),
    {
      id: 'metodo',
      nome: 'Método',
      icone: 'frigideira',
      opcoes: METODOS.map((m) => opcaoDeLista(m.id, m.nome, 'methods')),
    },
    {
      id: 'tempo',
      nome: 'Tempo de confeção',
      icone: 'relogio',
      opcoes: [
        /*
         * Os escalões montam-se aqui e não pelo `opcaoDeLista` por uma razão só: **não levam
         * ícone**. O mosaico mostra o número, e o relógio do critério serve de motivo aos quatro.
         */
        ...TEMPOS.map((band) => {
          const semIcone = opcaoDeLista(band, DURATION_BAND_NAMES[band], 'durations');
          return { ...semIcone, icone: undefined };
        }),
        {
          // Não é um escalão: é outro tipo de tempo, e por isso é um interruptor.
          id: 'sem-vespera',
          nome: 'Sem véspera',
          icone: 'sem-vespera',
          escolhida: (f) => f.semVespera,
          alternar: (f) => ({ ...f, semVespera: !f.semVespera }),
        },
      ],
    },
    deLabels('cultura', 'Cultura', 'cultura'),
    {
      id: 'apetite',
      nome: 'Apetite',
      icone: 'equilibrado',
      opcoes: APETITES.map((a) => opcaoDeLista(a.id, a.nome, 'weights')),
    },
    deLabels('ocasiao', 'Ocasião', 'festa'),
    {
      /*
       * "De quem é a receita" — o critério que o Cookidoo não tem porque lá as receitas são todas
       * da casa. Aqui não são: há o que veio dos sogros, o que veio de um amigo, o que se viu num
       * vídeo, e as que foram geradas. Chamar-lhe "Origem" colidia com a Cultura, que é a origem
       * da *cozinha* e não da *receita* — e foi exatamente essa colisão que a conversa 7 desfez ao
       * renomear o grupo `origem` para `cultura`. Não vale a pena voltar a criá-la.
       *
       * Fica depois da Ocasião e antes do Regime: decide-se tarde, quando já se sabe o que apetece.
       */
      id: 'proveniencia',
      nome: 'Proveniência',
      icone: 'familia',
      opcoes: PROVENIENCIAS.map((k) => opcaoDeLista(k, SOURCE_KIND_NAMES[k], 'sources')),
    },
    deLabels('regime', 'Regime', 'vegetariano', true),
  ];
}

/**
 * Quantas receitas sobram se esta opção for ligada, sem mexer no resto.
 *
 * É o número que aparece por baixo de cada ícone, e o que impede alguém de investir quatro toques
 * numa combinação que devolve zero — ver o benchmark do Cookidoo. Conta-se **sobre o catálogo
 * inteiro com os filtros atuais mais este**, e não sobre o que já está filtrado: assim o zero aparece
 * antes da escolha e não depois dela.
 */
export function contagemSe(
  recipes: Recipe[],
  filters: CatalogueFilters,
  opcao: OpcaoTriagem,
  favouritas?: ReadonlySet<string>,
): number {
  const comEsta = opcao.escolhida(filters) ? filters : opcao.alternar(filters);
  return recipes.filter((r) => matchesFilters(r, comEsta, favouritas)).length;
}

/**
 * Tira tudo o que é apetência e deixa o que não é.
 *
 * Ficam duas coisas. O **regime**, que corta por regra e é pegajoso entre sessões. E o **coração
 * dos favoritos**, por uma razão diferente: não está neste painel, e um botão que limpa o que está
 * noutro ecrã apaga uma escolha que quem carregou não está sequer a ver.
 */
export function limparApetencias(filters: CatalogueFilters): CatalogueFilters {
  return {
    durations: [],
    methods: [],
    weights: [],
    labels: filters.labels.regime ? { regime: filters.labels.regime } : {},
    semVespera: false,
    sources: [],
    favouritos: filters.favouritos,
  };
}
