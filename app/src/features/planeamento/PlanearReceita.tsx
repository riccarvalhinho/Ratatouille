/**
 * Escolher quando cozinhar uma receita. Ver docs/specs/002-detalhe-receita.md, "Planear a partir do
 * detalhe".
 *
 * Isto é o caminho inverso do `SeletorReceitas`: lá parte-se de um bloco do plano e escolhe-se a
 * receita; aqui parte-se da receita — a que se está a ver na lista ou no detalhe — e escolhe-se o
 * bloco. É o gesto natural de quem anda a navegar o catálogo e decide ali que aquilo é o jantar de
 * quinta, sem ter de ir ao planeamento abrir o seletor curto e sem filtros.
 *
 * A semana inteira cabe aqui dentro pela mesma razão que cabe no ecrã de planeamento: decidir "quando"
 * é comparar os dias uns com os outros, e uma lista de dias um a um obrigaria a lembrar o que já lá
 * estava.
 *
 * **Um segundo toque na mesma célula desfaz.** Tirar é a leitura óbvia de voltar a tocar no que se
 * acabou de planear, e sem isto um engano obrigava a ir ao ecrã de planeamento corrigir. Quem quer
 * mesmo a receita duas vezes no mesmo bloco — que é como se dobra a quantidade — faz isso no
 * planeamento, pelo "+" do bloco, onde a repetição é explícita.
 */
import { Fragment, useEffect, useState } from 'react';
import type { LocalStore } from '../../data/local-store.ts';
import { entriesOfBlock, indexOfRecipe } from '../../domain/plan-edit.ts';
import {
  dayOfMonth,
  datesOfIsoWeek,
  formatWeekRange,
  isoWeekOf,
  shiftIsoWeek,
  weekdayShort,
} from '../../domain/planning.ts';
import { MEAL_BLOCKS, MEAL_BLOCK_NAMES, type MealBlock, type Recipe } from '../../domain/types.ts';
import { IconCheck, IconNext, IconPlus, IconPrev } from '../../ui/icons.tsx';
import styles from './PlanearReceita.module.css';

interface PlanearReceitaProps {
  recipe: Recipe;
  store: LocalStore;
  /** Data de hoje em ISO, para abrir na semana certa e destacar o dia. */
  today: string;
  onClose: () => void;
}

/** O que a última escolha fez, em texto, para o rodapé confirmar sem o painel se fechar. */
interface UltimaAcao {
  texto: string;
  tirou: boolean;
}

export function PlanearReceita({ recipe, store, today, onClose }: PlanearReceitaProps) {
  const [week, setWeek] = useState(() => isoWeekOf(today));
  const [ultima, setUltima] = useState<UltimaAcao | undefined>();

  // Escape fecha, como no detalhe: é para quem estiver a mexer nisto de um computador.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const plan = store.weekPlan(week);
  const dates = datesOfIsoWeek(week);
  const isCurrentWeek = week === isoWeekOf(today);

  const alternar = (date: string, block: MealBlock) => {
    const index = indexOfRecipe(plan, date, block, recipe.id);
    const quando = `${weekdayShort(date)}, ${dayOfMonth(date)} · ${MEAL_BLOCK_NAMES[block].toLowerCase()}`;

    if (index >= 0) {
      store.removeRecipe(week, date, block, index);
      setUltima({ texto: `Tirado de ${quando}`, tirou: true });
    } else {
      store.addRecipe(week, date, block, { recipeId: recipe.id });
      setUltima({ texto: `Planeado para ${quando}`, tirou: false });
    }
  };

  return (
    /*
     * O toque fora fecha só esta camada: o `stopPropagation` é por causa do detalhe, que também
     * fecha ao toque no fundo e está mesmo por baixo quando o "quando" abre a partir dele.
     */
    <div
      className={styles.backdrop}
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      role="presentation"
    >
      <div
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Planear ${recipe.name}`}
      >
        <div className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>Planear</span>
            <h3 className={styles.title}>{recipe.name}</h3>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className={styles.weekBar}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setWeek((w) => shiftIsoWeek(w, -1))}
            aria-label="Semana anterior"
          >
            <IconPrev />
          </button>
          <span className={styles.weekRange}>{formatWeekRange(week)}</span>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setWeek((w) => shiftIsoWeek(w, 1))}
            aria-label="Semana seguinte"
          >
            <IconNext />
          </button>
          <button
            type="button"
            className={styles.todayButton}
            onClick={() => setWeek(isoWeekOf(today))}
            disabled={isCurrentWeek}
          >
            Esta semana
          </button>
        </div>

        <div className={styles.grid}>
          {/* Canto vazio, por cima da coluna dos nomes dos blocos. */}
          <div />

          {dates.map((date) => (
            <div
              key={date}
              className={date === today ? `${styles.dayHead} ${styles.dayToday}` : styles.dayHead}
            >
              <span className={styles.dayName}>{weekdayShort(date)}</span>
              <span className={styles.dayNumber}>{dayOfMonth(date)}</span>
            </div>
          ))}

          {/* Fragment e não uma linha própria: as células têm de ser filhas diretas da grelha. */}
          {MEAL_BLOCKS.map((block) => (
            <Fragment key={block}>
              <span className={styles.blockName}>{MEAL_BLOCK_NAMES[block]}</span>

              {dates.map((date) => {
                const entries = entriesOfBlock(plan, date, block);
                const planeada = entries.some((entry) => entry.recipeId === recipe.id);
                /*
                 * Quantas outras receitas já lá estão. Não se mostram os nomes — a esta largura não
                 * cabiam — mas o número evita planear às cegas por cima de um bloco já cheio.
                 */
                const outras = entries.filter((entry) => entry.recipeId !== recipe.id).length;
                const quando = `${weekdayShort(date)} ${dayOfMonth(date)}, ${MEAL_BLOCK_NAMES[block].toLowerCase()}`;

                return (
                  <button
                    key={`${date}-${block}`}
                    type="button"
                    className={[
                      styles.slot,
                      planeada ? styles.slotPlaneada : '',
                      date === today ? styles.slotToday : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => alternar(date, block)}
                    aria-pressed={planeada}
                    aria-label={
                      planeada
                        ? `Tirar ${recipe.name} de ${quando}`
                        : `Planear ${recipe.name} para ${quando}`
                    }
                  >
                    <span className={styles.slotMark} aria-hidden="true">
                      {planeada ? <IconCheck /> : <IconPlus />}
                    </span>
                    {outras > 0 && (
                      <span className={styles.slotCount}>
                        {outras === 1 ? '+1 receita' : `+${outras} receitas`}
                      </span>
                    )}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>

        {/*
          A confirmação fica aqui e o painel não se fecha: planear a mesma receita para dois dias é
          normal, e é a spec 002 que o pede.
        */}
        <div className={styles.footer}>
          {/* Só o "planeado" ganha a cor do acento: tirar é uma correção, não uma conquista. */}
          <span
            className={ultima && !ultima.tirou ? `${styles.status} ${styles.statusFeito}` : styles.status}
            role="status"
          >
            {ultima?.texto ?? 'Toca num dia para planear. Toca outra vez para tirar.'}
          </span>
          <button type="button" className={styles.done} onClick={onClose}>
            Pronto
          </button>
        </div>
      </div>
    </div>
  );
}
