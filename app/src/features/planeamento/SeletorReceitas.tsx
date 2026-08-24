/**
 * Seletor de receitas para um bloco do plano. Ver docs/specs/003-planeamento-semanal.md.
 *
 * A spec pede "os mesmos filtros do catálogo". Esses filtros ainda não existem — dependem da
 * conversa 2 — portanto por agora isto é a grelha do catálogo tal como ela está. Quando os filtros
 * chegarem à spec 001, entram aqui pelo mesmo componente e não por uma segunda cópia.
 */
import type { Catalogue } from '../../data/catalogue.ts';
import { dayOfMonth, weekdayShort } from '../../domain/planning.ts';
import { MEAL_BLOCK_NAMES, type MealBlock } from '../../domain/types.ts';
import { RecipeCard } from '../../ui/RecipeCard.tsx';
import { IconDismiss } from '../../ui/icons.tsx';
import styles from './SeletorReceitas.module.css';

interface SeletorReceitasProps {
  catalogue: Catalogue;
  block: MealBlock;
  date: string;
  onPick: (recipeId: string) => void;
  onClose: () => void;
}

export function SeletorReceitas({ catalogue, block, date, onPick, onClose }: SeletorReceitasProps) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Escolher receita">
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{MEAL_BLOCK_NAMES[block]}</h3>
            <span className={styles.when}>
              {weekdayShort(date)}, {dayOfMonth(date)}
            </span>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            <IconDismiss />
          </button>
        </div>

        <ul className={styles.grid}>
          {catalogue.recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} catalogue={catalogue} onOpen={() => onPick(recipe.id)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
