import { useEffect, useMemo, useState } from 'react';
import { loadBundle, type BundleOrigin } from './data/bundle.ts';
import { buildCatalogue, type Catalogue } from './data/catalogue.ts';
import { useLocalStore } from './data/local-store.ts';
import { useOutbox } from './data/outbox-store.ts';
import { useShoppingChecks } from './data/shopping-checks.ts';
import { navigate, useRoute } from './data/router.ts';
import { todayIso } from './domain/planning.ts';
import type { DataBundle } from './domain/types.ts';
import { CatalogoScreen } from './features/catalogo/CatalogoScreen.tsx';
import { ModoCozinha } from './features/cozinha/ModoCozinha.tsx';
import { DetalheReceita } from './features/detalhe/DetalheReceita.tsx';
import { ComprasScreen } from './features/compras/ComprasScreen.tsx';
import { DefinicoesScreen } from './features/definicoes/DefinicoesScreen.tsx';
import { PlaneamentoScreen } from './features/planeamento/PlaneamentoScreen.tsx';
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

  const outbox = useOutbox();
  const store = useLocalStore(state.status === 'ready' ? state.bundle : undefined, outbox);
  const checks = useShoppingChecks();

  // Recalculado a cada render em vez de memorizado: o tablet fica horas ligado e um "hoje" fixado
  // no arranque destacaria o dia errado depois da meia-noite.
  const today = todayIso();

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
        store={store}
        today={today}
        onLeave={() => navigate({ screen: 'receitas', recipeId: openRecipe.id })}
      />
    );
  }

  return (
    <div className={styles.app}>
      <NavRail current={route.screen} pending={outbox.status.pending} />

      <div className={styles.main}>
        <header className={styles.header}>
          <span className={styles.brand}>Ratatouille</span>
          <span className={styles.origin}>
            {state.origin === 'cache' ? 'offline · dados guardados' : 'atualizado'}
          </span>
          {/* O que está por enviar é informação de estado, não um alarme: fica ao lado da origem. */}
          {outbox.status.pending > 0 && (
            <span className={styles.pending}>
              {outbox.syncing
                ? 'a enviar…'
                : `${outbox.status.pending} por enviar${outbox.hasToken ? '' : ' · sem token'}`}
            </span>
          )}
        </header>

        <main className={styles.content}>
          {route.screen === 'receitas' && catalogue && (
            <CatalogoScreen catalogue={catalogue} abrirTriagem={route.triagem} />
          )}

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

          {route.screen === 'planeamento' && catalogue && store.ready && (
            <PlaneamentoScreen catalogue={catalogue} store={store} today={today} />
          )}

          {route.screen === 'definicoes' && <DefinicoesScreen outbox={outbox} />}

          {route.screen === 'compras' && catalogue && store.ready && checks.ready && (
            <ComprasScreen catalogue={catalogue} store={store} checks={checks} today={today} />
          )}

        </main>
      </div>

      {openRecipe && catalogue && (
        <DetalheReceita
          recipe={openRecipe}
          catalogue={catalogue}
          store={store}
          today={today}
          onClose={() => navigate({ screen: route.screen })}
        />
      )}
    </div>
  );
}
