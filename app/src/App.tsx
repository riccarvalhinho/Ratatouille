import { useEffect, useMemo, useState } from 'react';
import { loadBundle, type BundleOrigin } from './data/bundle.ts';
import { buildCatalogue, type Catalogue } from './data/catalogue.ts';
import type { DataBundle } from './domain/types.ts';
import { RecipeCard } from './ui/RecipeCard.tsx';
import styles from './App.module.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; bundle: DataBundle; origin: BundleOrigin }
  | { status: 'error'; message: string };

export function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

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

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ratatouille</h1>
        <span className={styles.subtitle}>
          {catalogue ? `${catalogue.recipes.length} receitas` : 'Assistente de cozinha'}
        </span>
        {state.status === 'ready' && (
          <span className={styles.origin}>
            {state.origin === 'cache' ? 'offline · dados guardados' : 'atualizado'}
          </span>
        )}
      </header>

      <main className={styles.main}>
        {state.status === 'loading' && (
          <div className={styles.state}>
            <p className={styles.stateTitle}>A carregar as receitas…</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className={styles.state}>
            <p className={styles.stateTitle}>Não foi possível carregar as receitas</p>
            <p className={styles.stateDetail}>{state.message}</p>
            <p className={styles.stateDetail}>
              Se for a primeira abertura, é preciso rede uma vez. Depois disso a app funciona offline.
            </p>
          </div>
        )}

        {state.status === 'ready' && catalogue && (
          <ul className={styles.grid}>
            {catalogue.recipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} catalogue={catalogue} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className={styles.footer}>
        M0 — fundação. Os filtros, o detalhe da receita e o planeamento chegam em M1 e M3.
        Ver <code>docs/product/roadmap.md</code>.
      </footer>
    </div>
  );
}
