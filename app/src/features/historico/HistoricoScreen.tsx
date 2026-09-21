/**
 * Histórico do que se cozinhou. Ver docs/specs/008-historico.md.
 *
 * Um destino próprio, e não uma subtab do catálogo como a spec 001 previa. Foram os dois a mesma
 * coisa enquanto o histórico era uma lista de nomes; deixaram de ser quando passou a ter datas e
 * contagens. Vem-se aqui responder a "o que é que andámos a comer?", que é uma pergunta sobre o
 * passado — e não a "o que faço hoje?", que é o catálogo.
 *
 * Cada entrada é um retângulo pequeno com fotografia, nome, quando foi, e quantas vezes aquele prato
 * já se fez. A fotografia não é enfeite: reconhece-se um prato por ela muito antes de se ler o nome,
 * e numa lista que se percorre de relance isso é a diferença entre ler e ver.
 */
import { useMemo } from 'react';
import type { Catalogue } from '../../data/catalogue.ts';
import type { LocalStore } from '../../data/local-store.ts';
import { navigate } from '../../data/router.ts';
import { buildHistory, countDistinctRecipes, formatTotalCooked } from '../../domain/history.ts';
import { formatDayMonth, formatLastCooked, weekdayShort } from '../../domain/planning.ts';
import { MEAL_BLOCK_NAMES } from '../../domain/types.ts';
import styles from './HistoricoScreen.module.css';

interface HistoricoScreenProps {
  catalogue: Catalogue;
  store: LocalStore;
  /** Data de hoje em ISO, para o "ontem" e o "há 3 semanas" serem calculados contra o dia certo. */
  today: string;
}

export function HistoricoScreen({ catalogue, store, today }: HistoricoScreenProps) {
  const recipesById = useMemo(
    () => new Map(catalogue.recipes.map((recipe) => [recipe.id, recipe])),
    [catalogue.recipes],
  );

  const items = useMemo(
    () => buildHistory(store.history, recipesById),
    [store.history, recipesById],
  );

  const distintas = countDistinctRecipes(store.history);

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Histórico</h2>
        <span className={styles.count}>
          {items.length === 0
            ? 'nada registado ainda'
            : `${items.length} ${items.length === 1 ? 'refeição' : 'refeições'} · ${distintas} ${
                distintas === 1 ? 'receita' : 'receitas'
              }`}
        </span>
      </div>

      {items.length === 0 ? (
        /*
          O vazio explica como se enche. Um histórico em branco num ecrã novo parece avaria, e a
          pergunta que fica é sempre a mesma: "então e o que eu cozinhei ontem?".
        */
        <p className={styles.vazio}>
          Ainda não há nada aqui. Uma receita entra no histórico quando a marcas como cozinhada — no
          fim do modo cozinha, ou no "Já fiz isto hoje" do detalhe da receita. Chegar ao último passo
          não chega: ver os passos não é cozinhar.
        </p>
      ) : (
        <ul className={styles.lista}>
          {items.map(({ key, entry, recipe, total }) => {
            const nome = recipe?.name ?? entry.recipeId;

            const conteudo = (
              <>
                {recipe?.image ? (
                  <img className={styles.thumb} src={recipe.image} alt="" loading="lazy" />
                ) : (
                  <div className={styles.thumbFallback} aria-hidden="true">
                    🍲
                  </div>
                )}

                <div className={styles.body}>
                  <span className={styles.nome}>{nome}</span>

                  <span className={styles.quando}>
                    {/* Primeiro o relativo, que responde a "já vai longe?". A data exata por baixo. */}
                    <span className={styles.relativo}>{formatLastCooked(entry.date, today)}</span>
                    <span>
                      {weekdayShort(entry.date)}, {formatDayMonth(entry.date, today)}
                    </span>
                  </span>

                  {/*
                    O bloco e a contagem na mesma linha, por baixo da data. Estiveram os três na linha
                    do "quando" e a linha partia a meio nuns cartões e não noutros — numa grelha, isso
                    lê-se como desalinhamento e não como conteúdo diferente.
                  */}
                  <span className={styles.rodape}>
                    {entry.block && <span>{MEAL_BLOCK_NAMES[entry.block]}</span>}
                    <span>{formatTotalCooked(total)}</span>
                  </span>

                  {/*
                    Uma entrada cujo `recipeId` já não existe em data/recipes/ — apagada, ou com o
                    slug mudado. O histórico é um facto e não se reescreve por causa disso; o que se
                    faz é dizê-lo, em vez de mostrar um slug cru como se fosse um nome de prato.
                  */}
                  {!recipe && <span className={styles.semReceita}>já não está no catálogo</span>}
                </div>
              </>
            );

            return (
              <li key={key}>
                {recipe ? (
                  <button
                    type="button"
                    className={styles.cartao}
                    onClick={() => navigate({ screen: 'historico', recipeId: recipe.id })}
                  >
                    {conteudo}
                  </button>
                ) : (
                  <div className={`${styles.cartao} ${styles.cartaoMorto}`}>{conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
