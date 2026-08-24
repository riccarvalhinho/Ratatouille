/** Catálogo de receitas. Ver docs/specs/001-catalogo-receitas.md. */
import type { Catalogue } from '../../data/catalogue.ts';
import { navigate } from '../../data/router.ts';
import { RecipeCard } from '../../ui/RecipeCard.tsx';
import styles from './CatalogoScreen.module.css';

interface CatalogoScreenProps {
  catalogue: Catalogue;
}

export function CatalogoScreen({ catalogue }: CatalogoScreenProps) {
  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Receitas</h2>
        <span className={styles.count}>{catalogue.recipes.length}</span>
      </div>

      {/* Os filtros são a spec 001 e dependem da conversa 2. */}
      <ul className={styles.grid}>
        {catalogue.recipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard
              recipe={recipe}
              catalogue={catalogue}
              onOpen={() => navigate({ screen: 'receitas', recipeId: recipe.id })}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
