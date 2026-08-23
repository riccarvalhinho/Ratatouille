import type { Recipe } from '../domain/types.ts';
import type { Catalogue } from '../data/catalogue.ts';
import { DIFFICULTY_NAMES, activeMinutes, formatMinutes, formatPrepAhead } from '../data/catalogue.ts';
import { LabelChip } from './LabelChip.tsx';
import styles from './RecipeCard.module.css';

/** Máximo de labels no cartão, conforme a spec 001. No detalhe aparecem todas. */
const MAX_LABELS = 3;

interface RecipeCardProps {
  recipe: Recipe;
  catalogue: Catalogue;
  onOpen?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, catalogue, onOpen }: RecipeCardProps) {
  const labels = recipe.labels
    .slice(0, MAX_LABELS)
    .map((id) => catalogue.labelsById.get(id)?.name ?? id);

  return (
    <button type="button" className={styles.card} onClick={() => onOpen?.(recipe)}>
      {recipe.image ? (
        <img className={styles.thumb} src={recipe.image} alt="" loading="lazy" />
      ) : (
        <div className={styles.thumbFallback} aria-hidden="true">
          🍲
        </div>
      )}

      <div className={styles.body}>
        <span className={styles.name}>{recipe.name}</span>

        <span className={styles.meta}>
          <span>{formatMinutes(activeMinutes(recipe))}</span>
          <span>{recipe.servings} pessoas</span>
          {recipe.timing.prepAhead && (
            <span className={styles.ahead}>{formatPrepAhead(recipe.timing.prepAhead.minutes)}</span>
          )}
        </span>

        <span className={styles.labels}>
          <LabelChip accent>{DIFFICULTY_NAMES[recipe.difficulty]}</LabelChip>
          {labels.map((label) => (
            <LabelChip key={label}>{label}</LabelChip>
          ))}
        </span>
      </div>
    </button>
  );
}
