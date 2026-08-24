/**
 * Lista de compras. Ver docs/specs/004-lista-de-compras.md.
 *
 * A lista sai sozinha do plano da semana: a agregação já existia em `app/src/domain/shopping-list.ts`
 * desde o M0 — soma o mesmo ingrediente entre receitas e converte unidades — e o que faltava era o
 * ecrã e um plano de onde ela saísse.
 *
 * ## Este ecrã é o único que se usa no telemóvel
 *
 * Todos os outros são para um tablet de 10" na parede, em horizontal. Este usa-se dentro do
 * supermercado, com uma mão, num ecrã de 390px. É a "versão complementar para telemóvel" prevista no
 * PRD, e é por isso que o layout é uma coluna só e as linhas têm 56px de altura.
 *
 * Note-se que isso **inverte** o argumento do painel de navegação vertical: num tablet em horizontal
 * a altura é escassa e a largura sobra; num telemóvel em vertical é ao contrário. O painel passa a
 * uma barra em baixo abaixo dos 640px — não é contradizer a decisão do design system, é aplicar a
 * mesma razão a um ecrã com a forma oposta.
 *
 * ## O que ficou de fora, por agora
 *
 * A spec pede também acrescentar e remover itens manuais. Ficou para depois: o pedido foi uma lista
 * com um simples check, e um campo de texto num ecrã que se usa de mão cheia merece ser desenhado
 * quando houver necessidade a sério.
 */
import { useMemo, useState } from 'react';
import type { Catalogue } from '../../data/catalogue.ts';
import type { LocalStore } from '../../data/local-store.ts';
import type { ShoppingChecks } from '../../data/shopping-checks.ts';
import { formatWeekRange, isoWeekOf, shiftIsoWeek } from '../../domain/planning.ts';
import { buildShoppingList } from '../../domain/shopping-list.ts';
import { IconNext, IconPrev } from '../../ui/icons.tsx';
import styles from './ComprasScreen.module.css';

interface ComprasScreenProps {
  catalogue: Catalogue;
  store: LocalStore;
  checks: ShoppingChecks;
  today: string;
}

export function ComprasScreen({ catalogue, store, checks, today }: ComprasScreenProps) {
  const [week, setWeek] = useState(() => isoWeekOf(today));

  const plan = store.weekPlan(week);

  const groups = useMemo(() => {
    if (!plan) return [];
    const recipesById = new Map(catalogue.recipes.map((recipe) => [recipe.id, recipe]));
    return buildShoppingList(plan, recipesById, catalogue.ingredientsById);
  }, [plan, catalogue]);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const done = checks.countChecked(week);
  const left = Math.max(0, total - done);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>{formatWeekRange(week)}</h2>
          <span className={styles.count}>
            {total === 0
              ? 'Nada planeado nesta semana'
              : left === 0
                ? `${total} artigos · tudo no carrinho`
                : `${total} artigos · ${left} por comprar`}
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
            className={styles.navButton}
            onClick={() => setWeek((w) => shiftIsoWeek(w, 1))}
            aria-label="Semana seguinte"
          >
            <IconNext />
          </button>
        </div>
      </div>

      {total === 0 ? (
        <p className={styles.empty}>
          A lista sai do que estiver planeado. Planeia a semana e ela aparece aqui.
        </p>
      ) : (
        <>
          <ol className={styles.groups}>
            {groups.map((group) => (
              <li key={group.aisle}>
                <h3 className={styles.groupTitle}>{group.title}</h3>

                <ul className={styles.items}>
                  {group.items.map((item) => {
                    const checked = checks.isChecked(week, item.ingredientId);
                    return (
                      <li key={item.ingredientId}>
                        {/*
                          A linha inteira é o alvo. Uma caixa de 24px seria o alvo certo num rato e
                          o errado num corredor de supermercado com o telemóvel numa mão só.
                        */}
                        <label className={checked ? `${styles.item} ${styles.itemDone}` : styles.item}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={checked}
                            onChange={() => checks.toggle(week, item.ingredientId)}
                          />

                          <span className={styles.itemText}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemFrom}>
                              {item.fromRecipes.length === 1
                                ? item.fromRecipes[0]
                                : `${item.fromRecipes.length} receitas`}
                            </span>
                          </span>

                          <span className={styles.itemAmount}>
                            {item.amount || 'q.b.'}
                            {/*
                              Quantidades que não deram para somar — 2 cebolas mais 200 g de cebola —
                              aparecem em vez de se esconderem. Um total errado é pior do que dois
                              números à vista.
                            */}
                            {item.unmergedAmounts?.map((extra) => (
                              <span key={extra} className={styles.itemExtra}>
                                + {extra}
                              </span>
                            ))}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>

          {done > 0 && (
            <button type="button" className={styles.clear} onClick={() => checks.clearWeek(week)}>
              Desmarcar tudo
            </button>
          )}

          <p className={styles.note}>
            O que está marcado fica só neste aparelho — não vai para o repositório nem passa para o
            tablet. É estado de uma ida às compras, não dados do projeto.
          </p>
        </>
      )}
    </div>
  );
}
