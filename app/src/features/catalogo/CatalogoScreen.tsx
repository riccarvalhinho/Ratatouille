/** Catálogo de receitas. Ver docs/specs/001-catalogo-receitas.md. */
import { useMemo, useState } from 'react';
import type { Catalogue } from '../../data/catalogue.ts';
import type { LocalStore } from '../../data/local-store.ts';
import { navigate } from '../../data/router.ts';
import {
  EMPTY_FILTERS,
  applyFilters,
  hasActiveFilters,
  type CatalogueFilters,
} from '../../domain/filters.ts';
import { criteriosDeTriagem } from '../../domain/triagem.ts';
import { TriagemPanel } from '../triagem/TriagemPanel.tsx';
import { IconDismiss, IconHeart, IconSearch } from '../../ui/icons.tsx';
import { icones } from '../../ui/icones-triagem.tsx';
import { RecipeCard } from '../../ui/RecipeCard.tsx';
import styles from './CatalogoScreen.module.css';

interface CatalogoScreenProps {
  catalogue: Catalogue;
  /**
   * Para os favoritos. Vem do `local-store` e não do catálogo porque o catálogo é o bundle: favoritar
   * uma receita no tablet tem de se ver no filtro antes de o commit chegar ao GitHub.
   */
  store: LocalStore;
  /** Aberto pela rota `#/apetece`, para a navegação lhe poder chegar com um link. */
  abrirTriagem?: boolean;
}

/** Uma pastilha por filtro ligado, com o mesmo ícone que o painel usou. Tocar tira-o. */
interface PastilhaAtiva {
  chave: string;
  nome: string;
  /** Os escalões de tempo não têm ícone: a pastilha fica só com o número, que é o que eles são. */
  icone?: string;
  tirar: (f: CatalogueFilters) => CatalogueFilters;
}

function pastilhasAtivas(catalogue: Catalogue, filters: CatalogueFilters): PastilhaAtiva[] {
  return criteriosDeTriagem(catalogue).flatMap((criterio) =>
    criterio.opcoes
      .filter((opcao) => opcao.escolhida(filters))
      .map((opcao) => ({
        chave: `${criterio.id}:${opcao.id}`,
        nome: opcao.nome,
        icone: opcao.icone,
        tirar: opcao.alternar,
      })),
  );
}

/** O coração está ligado sozinho? Muda o que o estado vazio diz. */
function hasOutrosFiltros(filters: CatalogueFilters): boolean {
  return hasActiveFilters({ ...filters, favouritos: false });
}

export function CatalogoScreen({ catalogue, store, abrirTriagem }: CatalogoScreenProps) {
  /*
   * Os filtros vivem aqui, e o painel de triagem escreve neste mesmo estado. É a regra que a
   * conversa 2 fixou: duas entradas para o mesmo estado não fazem mal, dois estados fariam.
   */
  const [filters, setFilters] = useState<CatalogueFilters>(EMPTY_FILTERS);
  const [painelAberto, setPainelAberto] = useState(abrirTriagem ?? false);

  const favoritas = store.favourites;

  const receitas = useMemo(
    () => applyFilters(catalogue.recipes, filters, favoritas),
    [catalogue.recipes, filters, favoritas],
  );
  const pastilhas = useMemo(() => pastilhasAtivas(catalogue, filters), [catalogue, filters]);

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Receitas</h2>
        <span className={styles.count}>
          {hasActiveFilters(filters)
            ? `${receitas.length} de ${catalogue.recipes.length}`
            : catalogue.recipes.length}
        </span>

        {/*
          O coração é um interruptor e não um critério do painel: os favoritos não são uma apetência
          de hoje, são um juízo que já foi feito — "gosto disto" (spec 001). Por isso fica aqui, à
          vista, a um toque, e não atrás de dois níveis de mosaicos.

          Escreve nos mesmos filtros que tudo o resto: ligado com "forno" escolhido, dá as favoritas
          de forno, e a contagem do painel já conta com ele.
        */}
        <button
          type="button"
          className={
            filters.favouritos ? `${styles.favoritos} ${styles.ligado}` : styles.favoritos
          }
          onClick={() => setFilters({ ...filters, favouritos: !filters.favouritos })}
          aria-pressed={filters.favouritos}
          aria-label={filters.favouritos ? 'Mostrar todas as receitas' : 'Mostrar só os favoritos'}
        >
          <IconHeart filled={filters.favouritos} />
        </button>

        {/*
          A porta lateral para o painel de triagem. Fica no topo da lista e não na navegação: a lista
          completa continua a ser o ecrã principal, e isto abre-se a partir dela.
        */}
        <button type="button" className={styles.apetece} onClick={() => setPainelAberto(true)}>
          <IconSearch />
          Apetece-me algo
        </button>
      </div>

      {pastilhas.length > 0 && (
        <ul className={styles.pastilhas}>
          {pastilhas.map((p) => {
            const Icone = p.icone ? icones[p.icone as keyof typeof icones] : undefined;
            return (
              <li key={p.chave}>
                {/* Aqui os ícones estão a 24px, que é o tamanho onde falham primeiro. */}
                <button
                  type="button"
                  className={styles.pastilha}
                  onClick={() => setFilters(p.tirar(filters))}
                  aria-label={`Tirar o filtro ${p.nome}`}
                >
                  {Icone && <Icone style={{ fontSize: 24 }} aria-hidden="true" />}
                  {p.nome}
                  <IconDismiss />
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className={styles.limparTudo}
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Limpar tudo
            </button>
          </li>
        </ul>
      )}

      {receitas.length === 0 ? (
        <p className={styles.vazio}>
          {/*
            Com o coração ligado o vazio quase nunca é dos filtros — é de ainda não haver favoritos,
            ou de os que há não serem disto. Dizer "tira um filtro" a quem só carregou no coração
            manda procurar um filtro que não existe.
          */}
          {filters.favouritos && !hasOutrosFiltros(filters)
            ? 'Ainda não há favoritos. O coração está no canto de cada receita, no ecrã de detalhe.'
            : filters.favouritos
              ? 'Nenhum favorito com estes filtros. Tira um, ou desliga o coração para ver o catálogo todo.'
              : 'Nada com estes filtros. Tira um e volta a ver — ou abre o "Apetece-me algo" outra vez, que mostra a contagem de cada escolha antes de a fazeres.'}
        </p>
      ) : (
        <ul className={styles.grid}>
          {receitas.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                catalogue={catalogue}
                onOpen={() => navigate({ screen: 'receitas', recipeId: recipe.id })}
              />
            </li>
          ))}
        </ul>
      )}

      {painelAberto && (
        <TriagemPanel
          catalogue={catalogue}
          filters={filters}
          favoritas={favoritas}
          onChange={setFilters}
          onClose={() => {
            setPainelAberto(false);
            // Veio da rota: repô-la, senão recarregar a página reabria o painel.
            if (abrirTriagem) navigate({ screen: 'receitas' });
          }}
        />
      )}
    </>
  );
}
