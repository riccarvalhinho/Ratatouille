import type { Recipe } from '../domain/types.ts';
import type { Catalogue } from '../data/catalogue.ts';
import { activeMinutes, formatMinutes, formatPrepAhead, formatYield } from '../data/catalogue.ts';
import { fonteDoCartao } from '../domain/creditos.ts';
import { LabelChip } from './LabelChip.tsx';
import { IconPlus } from './icons.tsx';
import { icones } from './icones-triagem.tsx';
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

  // Só o que não foi gerado leva marca — ver `fonteDoCartao`. O ícone é o mesmo do painel.
  const fonte = fonteDoCartao(recipe.source);
  const IconeFonte = fonte ? icones[fonte.kind] : undefined;

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
            {/*
              De quem é a receita, quando não foi gerada. Fica em último porque é o único facto
              desta linha que não é sobre cozinhar — os outros respondem a "quanto tempo, para
              quantos, preciso de mais alguma coisa"; este responde a "de onde veio".

              Mesmo peso e mesma cor dos outros, sem destaque: é informação e não aviso, que é a
              regra que a spec 001 fixou para o "pede acompanhamento". O ícone é o do painel de
              triagem de propósito — quem escolheu "Autor › Site" no filtro reconhece o globo aqui.
            */}
            {fonte && IconeFonte && (
              <span className={styles.fonte}>
                <IconeFonte aria-hidden="true" />
                {fonte.nome}
              </span>
            )}
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
