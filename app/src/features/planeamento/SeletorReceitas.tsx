/**
 * Seletor de receitas para um bloco do plano. Ver docs/specs/003-planeamento-semanal.md.
 *
 * A spec pede "os mesmos filtros do catálogo". Eles já existem no catálogo — a triagem da conversa 2
 * — mas ainda não aqui dentro: isto continua a ser a grelha toda, num painel mais curto.
 *
 * Quem precisa de filtrar tem agora o caminho inverso, que é o melhor dos dois de qualquer maneira:
 * filtra na lista, que é onde a triagem vive e onde os cartões têm tamanho de ler, e planeia dali
 * pelo "+" do cartão (`PlanearReceita`). Ligar a triagem também aqui é trabalho a fazer uma vez que
 * se saiba que este caminho se usa mesmo — ver "O que falta" na spec 003.
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
