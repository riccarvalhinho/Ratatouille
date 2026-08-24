/**
 * Planeamento semanal. Ver docs/specs/003-planeamento-semanal.md.
 *
 * A semana inteira num ecrã, em forma de horário: os sete dias como colunas, os blocos do dia como
 * linhas. Sem scroll horizontal — é o requisito que manda no layout todo, porque a 1280×800, tirando
 * o painel de navegação e as margens, sobram cerca de 1130px para sete colunas. Cada dia fica com
 * ~140px, e é isso que decide o tamanho do cartão.
 *
 * Consequência assumida: o cartão do plano **não mostra labels**, ao contrário do que a spec dizia.
 * A 140px de largura, uma label legível a 70cm de distância comeria a linha do nome. O nome e a
 * imagem chegam para reconhecer o prato; as labels vêem-se no detalhe, a um toque.
 */
import { Fragment, useState } from 'react';
import type { Catalogue } from '../../data/catalogue.ts';
import type { PlanStore } from '../../data/plan-store.ts';
import { navigate } from '../../data/router.ts';
import { countEntries, emptyBlocksOfWeek } from '../../domain/plan-edit.ts';
import {
  dayOfMonth,
  datesOfIsoWeek,
  formatWeekRange,
  isoWeekOf,
  shiftIsoWeek,
  weekdayShort,
} from '../../domain/planning.ts';
import { MEAL_BLOCKS, MEAL_BLOCK_NAMES, type MealBlock } from '../../domain/types.ts';
import { IconDismiss, IconNext, IconPlus, IconPrev, IconSearch } from '../../ui/icons.tsx';
import { SeletorReceitas } from './SeletorReceitas.tsx';
import styles from './PlaneamentoScreen.module.css';

interface PlaneamentoScreenProps {
  catalogue: Catalogue;
  plans: PlanStore;
  /** Data de hoje em ISO. Vem de fora para o destaque do dia ser testável. */
  today: string;
}

/** O bloco que está à espera de uma receita, enquanto o seletor está aberto. */
interface PendingSlot {
  date: string;
  block: MealBlock;
}

/** A receita planeada que está com as ações à vista. */
interface SelectedEntry {
  date: string;
  block: MealBlock;
  index: number;
}

function isSameEntry(a: SelectedEntry | undefined, b: SelectedEntry): boolean {
  return a?.date === b.date && a?.block === b.block && a?.index === b.index;
}

export function PlaneamentoScreen({ catalogue, plans, today }: PlaneamentoScreenProps) {
  const [week, setWeek] = useState(() => isoWeekOf(today));
  const [pending, setPending] = useState<PendingSlot | undefined>();
  const [selected, setSelected] = useState<SelectedEntry | undefined>();

  const plan = plans.weekPlan(week);
  const dates = datesOfIsoWeek(week);
  const empty = emptyBlocksOfWeek(plan);
  const total = countEntries(plan);
  const isCurrentWeek = week === isoWeekOf(today);

  /*
   * Tocar em qualquer sítio fecha as ações do cartão aberto. Os toques que têm significado próprio
   * — outro cartão, um "+" — param a propagação e tratam disso eles mesmos.
   */
  return (
    <div className={styles.screen} onClick={() => setSelected(undefined)}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{formatWeekRange(week)}</h2>
          <span className={styles.count}>
            {total === 0 ? 'Semana por planear' : total === 1 ? '1 refeição' : `${total} refeições`}
          </span>
        </div>

        <div className={styles.weekNav}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setWeek((w) => shiftIsoWeek(w, -1))}
            aria-label="Semana anterior"
          >
            <IconPrev />
          </button>
          <button
            type="button"
            className={styles.todayButton}
            onClick={() => setWeek(isoWeekOf(today))}
            disabled={isCurrentWeek}
          >
            Esta semana
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setWeek((w) => shiftIsoWeek(w, 1))}
            aria-label="Semana seguinte"
          >
            <IconNext />
          </button>
        </div>
      </div>

      {/*
        As linhas são calculadas aqui e não no CSS: um bloco vazio na semana toda fica `auto` e
        encolhe para a altura de um alvo de toque, e os que têm receitas repartem o que sobra.
      */}
      <div
        className={styles.grid}
        style={{
          gridTemplateRows: `auto ${MEAL_BLOCKS.map((b) => (empty.has(b) ? 'auto' : 'minmax(0, 1fr)')).join(' ')}`,
        }}
      >
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

        {MEAL_BLOCKS.map((block) => {
          /*
           * Uma linha sem nada em sete dias encolhe. As quatro linhas estão sempre lá — não se
           * esconde um bloco só porque está vazio, ou nunca se planeava um pequeno-almoço — mas o
           * espaço vertical vai para onde há receitas, que a 800px de altura é escasso.
           */
          const compact = empty.has(block);

          return (
            <Fragment key={block}>
              <div className={compact ? `${styles.row} ${styles.rowCompact}` : styles.row}>
                <span className={styles.blockName}>{MEAL_BLOCK_NAMES[block]}</span>
              </div>

              {dates.map((date) => {
                const entries = plan?.days.find((d) => d.date === date)?.blocks[block] ?? [];
                const cellClass = [
                  styles.cell,
                  compact ? styles.cellCompact : '',
                  date === today ? styles.cellToday : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div key={`${date}-${block}`} className={cellClass}>
                    {entries.map((entry, index) => {
                      const recipe = catalogue.recipes.find((r) => r.id === entry.recipeId);
                      return (
                        <div
                          key={`${entry.recipeId}-${index}`}
                          className={recipe?.image ? `${styles.card} ${styles.cardWithImage}` : styles.card}
                        >
                          {recipe?.image && (
                            <img className={styles.thumb} src={recipe.image} alt="" loading="lazy" />
                          )}

                          <div className={styles.cardText}>
                            <span className={styles.cardName}>{recipe?.name ?? entry.recipeId}</span>
                          </div>

                          {/*
                            O cartão inteiro é o alvo, e o primeiro toque só revela as ações. Num
                            cartão de 122px de largura não cabia um "x" permanente sem roubar o
                            nome — e um "x" sempre à vista, ao alcance de um cotovelo, é o alvo que
                            menos se quer acertar por engano.
                          */}
                          <button
                            type="button"
                            className={styles.cardOpen}
                            onClick={(event) => {
                              event.stopPropagation();
                              const here = { date, block, index };
                              setSelected((current) => (isSameEntry(current, here) ? undefined : here));
                            }}
                            aria-label={`Ações de ${recipe?.name ?? entry.recipeId}`}
                            aria-expanded={isSameEntry(selected, { date, block, index })}
                          />

                          {isSameEntry(selected, { date, block, index }) && (
                            <div className={styles.cardActions}>
                              <button
                                type="button"
                                className={`${styles.cardAction} ${styles.cardDetail}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  navigate({ screen: 'planeamento', recipeId: entry.recipeId });
                                }}
                                aria-label={`Ver ${recipe?.name ?? entry.recipeId}`}
                              >
                                <IconSearch />
                              </button>
                              <button
                                type="button"
                                className={`${styles.cardAction} ${styles.cardRemove}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelected(undefined);
                                  plans.removeRecipe(week, date, block, index);
                                }}
                                aria-label={`Desplanear ${recipe?.name ?? entry.recipeId}`}
                              >
                                <IconDismiss />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/*
                      Num bloco vazio o alvo é a célula toda — é o alvo maior que este layout
                      permite, e a 140px de largura toda a área conta. Com receitas, o "+" fica uma
                      tira por baixo delas.
                    */}
                    <button
                      type="button"
                      className={entries.length === 0 ? styles.addWhole : styles.addStrip}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelected(undefined);
                        setPending({ date, block });
                      }}
                      aria-label={`Planear ${MEAL_BLOCK_NAMES[block].toLowerCase()} de ${weekdayShort(date)} ${dayOfMonth(date)}`}
                    >
                      <IconPlus />
                    </button>
                  </div>
                );
              })}
            </Fragment>
          );
        })}
      </div>

      <p className={styles.footnote}>
        O plano editado aqui fica guardado neste tablet e sobrevive a fechar a app, mas ainda não é
        enviado para o GitHub — isso é a outra metade da ADR 0004 e chega com o M2.
        {plans.localWeeks > 0 &&
          ` ${plans.localWeeks === 1 ? '1 semana está' : `${plans.localWeeks} semanas estão`} só aqui.`}
      </p>

      {pending && (
        <SeletorReceitas
          catalogue={catalogue}
          block={pending.block}
          date={pending.date}
          onPick={(recipeId) => {
            plans.addRecipe(week, pending.date, pending.block, { recipeId });
            setPending(undefined);
          }}
          onClose={() => setPending(undefined)}
        />
      )}
    </div>
  );
}
