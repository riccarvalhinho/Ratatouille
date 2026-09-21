import type { Recipe } from '../domain/types.ts';
import type { Catalogue } from '../data/catalogue.ts';
import { activeMinutes, formatMinutes, formatPrepAhead, formatYield } from '../data/catalogue.ts';
import { LabelChip } from './LabelChip.tsx';
import { IconPlus } from './icons.tsx';
import styles from './RecipeCard.module.css';

/** Máximo de labels no cartão, conforme a spec 001. No detalhe aparecem todas. */
const MAX_LABELS = 3;

interface RecipeCardProps {
  recipe: Recipe;
  catalogue: Catalogue;
  onOpen?: (recipe: Recipe) => void;
  /**
   * Planear a receita sem passar pelo detalhe. Quando existe, o cartão ganha um "+" no canto da
   * imagem — permanente, porque num tablet não há hover para revelar nada (ver CLAUDE.md, regra 4).
   *
   * É opcional porque nem todos os sítios onde o cartão aparece têm plano a que adicionar: dentro do
   * seletor do planeamento o cartão inteiro já é a escolha, e um "+" lá dentro seria a mesma ação
   * duas vezes.
   */
  onPlan?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, catalogue, onOpen, onPlan }: RecipeCardProps) {
  const labels = recipe.labels
    .slice(0, MAX_LABELS)
    .map((id) => catalogue.labelsById.get(id)?.name ?? id);

  return (
    /*
     * O cartão é uma div com um botão por dentro, e não um botão só: o "+" de planear é uma segunda
     * ação e um botão dentro de outro não é HTML válido. Quem abre continua a ser a área toda menos
     * o canto do "+".
     */
    <div className={styles.card}>
      <button type="button" className={styles.open} onClick={() => onOpen?.(recipe)}>
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
            <span>{formatYield(recipe)}</span>
            {recipe.timing.prepAhead && (
              <span className={styles.ahead}>{formatPrepAhead(recipe.timing.prepAhead.minutes)}</span>
            )}
            {/*
              Informação, não aviso. Fica na mesma linha e com o mesmo peso dos outros factos do
              cartão — de propósito sem a cor de `ahead`, que existe para o que muda o planeamento da
              véspera. Isto não muda: diz-se, e quem planeia decide.
            */}
            {recipe.needsSide && <span>pede acompanhamento</span>}
          </span>

          <span className={styles.labels}>
            {labels.map((label) => (
              <LabelChip key={label}>{label}</LabelChip>
            ))}
          </span>
        </div>
      </button>

      {onPlan && (
        <button
          type="button"
          className={styles.plan}
          onClick={() => onPlan(recipe)}
          aria-label={`Planear ${recipe.name}`}
        >
          <IconPlus />
        </button>
      )}
    </div>
  );
}
