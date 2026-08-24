import { useEffect, useMemo, useState } from 'react';
import { loadBundle, type BundleOrigin } from './data/bundle.ts';
import { buildCatalogue, type Catalogue } from './data/catalogue.ts';
import { navigate, useRoute } from './data/router.ts';
import type { DataBundle } from './domain/types.ts';
import { CatalogoScreen } from './features/catalogo/CatalogoScreen.tsx';
import { ModoCozinha } from './features/cozinha/ModoCozinha.tsx';
import { DetalheReceita } from './features/detalhe/DetalheReceita.tsx';
import { NavRail } from './ui/NavRail.tsx';
import { PorConstruir } from './ui/PorConstruir.tsx';
import styles from './App.module.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; bundle: DataBundle; origin: BundleOrigin }
  | { status: 'error'; message: string };

export function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const route = useRoute();

  useEffect(() => {
    let cancelled = false;

    loadBundle()
      .then(({ bundle, origin }) => {
        if (!cancelled) setState({ status: 'ready', bundle, origin });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const catalogue: Catalogue | undefined = useMemo(
    () => (state.status === 'ready' ? buildCatalogue(state.bundle) : undefined),
    [state],
  );

  if (state.status === 'loading') {
    return (
      <div className={styles.state}>
        <p className={styles.stateTitle}>A carregar as receitas…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.state}>
        <p className={styles.stateTitle}>Não foi possível carregar as receitas</p>
        <p className={styles.stateDetail}>{state.message}</p>
        <p className={styles.stateDetail}>
          Se for a primeira abertura, é preciso rede uma vez. Depois disso a app funciona offline.
        </p>
      </div>
    );
  }

  const openRecipe = route.recipeId
    ? catalogue?.recipes.find((r) => r.id === route.recipeId)
    : undefined;

  // O modo cozinha ocupa o ecrã todo — sem painel de navegação, porque a cozinhar não se navega.
  if (route.cooking && openRecipe && catalogue) {
    return (
      <ModoCozinha
        recipe={openRecipe}
        catalogue={catalogue}
        onLeave={() => navigate({ screen: 'receitas', recipeId: openRecipe.id })}
      />
    );
  }

  return (
    <div className={styles.app}>
      <NavRail current={route.screen} />

      <div className={styles.main}>
        <header className={styles.header}>
          <span className={styles.brand}>Ratatouille</span>
          <span className={styles.origin}>
            {state.origin === 'cache' ? 'offline · dados guardados' : 'atualizado'}
          </span>
        </header>

        <main className={styles.content}>
          {route.screen === 'receitas' && catalogue && <CatalogoScreen catalogue={catalogue} />}

          {route.screen === 'home' && (
            <PorConstruir
              title="Hoje"
              spec="docs/specs/006-home.md"
              milestone="M3"
              conversa="docs/conversas/05-ui-planeamento.md"
            >
              Vai mostrar as refeições de hoje por bloco do dia, o resto da semana em resumo, e o que
              se cozinhou nos últimos dias. Sem plano, um convite a planear.
            </PorConstruir>
          )}

          {route.screen === 'planeamento' && (
            <PorConstruir
              title="Semana"
              spec="docs/specs/003-planeamento-semanal.md"
              milestone="M3"
              conversa="docs/conversas/05-ui-planeamento.md"
            >
              A semana inteira num ecrã, em blocos do dia, para arrastar receitas para os dias. A
              lógica das semanas já está feita e testada; falta decidir quantos blocos e como se
              adiciona.
            </PorConstruir>
          )}

          {route.screen === 'compras' && (
            <PorConstruir title="Compras" spec="docs/specs/004-lista-de-compras.md" milestone="M4">
              A lista sai sozinha do plano da semana, agrupada por zona do supermercado. A agregação
              já está feita e testada — soma o mesmo ingrediente entre receitas e converte unidades.
              Falta o ecrã e um plano com receitas suficientes para valer a pena.
            </PorConstruir>
          )}
        </main>
      </div>

      {openRecipe && catalogue && (
        <DetalheReceita
          recipe={openRecipe}
          catalogue={catalogue}
          onClose={() => navigate({ screen: route.screen })}
        />
      )}
    </div>
  );
}
