/**
 * Detalhe da receita. Ver docs/specs/002-detalhe-receita.md.
 *
 * Segue a spec como está escrita: um painel com secções empilhadas e scroll. A alternativa — abas,
 * como o Cookidoo faz — está em revisão na conversa 3. As secções estão separadas de propósito, para
 * que passar a abas seja mudar o invólucro e não reescrever o conteúdo.
 */
import { useEffect } from 'react';
import type { Catalogue } from '../../data/catalogue.ts';
import { describeIngredient, formatMinutes, formatYield, notableEquipment } from '../../data/catalogue.ts';
import { activeMinutes } from '../../domain/filters.ts';
import { formatLastCooked } from '../../domain/planning.ts';
import { COOKING_METHOD_NAMES, WEIGHT_NAMES, type Recipe } from '../../domain/types.ts';
import { formatPrepAhead } from '../../data/catalogue.ts';
import { navigate } from '../../data/router.ts';
import { LabelChip } from '../../ui/LabelChip.tsx';
import styles from './DetalheReceita.module.css';

interface DetalheReceitaProps {
  recipe: Recipe;
  catalogue: Catalogue;
  onClose: () => void;
}

export function DetalheReceita({ recipe, catalogue, onClose }: DetalheReceitaProps) {
  // Escape fecha. Não é para o tablet — é para quem estiver a mexer nisto de um computador.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const equipment = notableEquipment(recipe, catalogue);
  const appliances = equipment.filter((item) => item.kind === 'eletrodomestico');
  const utensils = equipment.filter((item) => item.kind !== 'eletrodomestico');
  const lastCooked = catalogue.lastCookedByRecipe.get(recipe.id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={recipe.name}
      >
        <div className={styles.bar}>
          {/* Favoritos e planear precisam de escrita para o repositório — é o M2. */}
          <button type="button" className={styles.action} disabled title="Favoritos chegam no M2">
            ♡
          </button>
          <button type="button" className={styles.action} disabled title="Planear chega no M3">
            +
          </button>
          <button
            type="button"
            className={styles.cook}
            onClick={() => navigate({ screen: 'receitas', recipeId: recipe.id, cooking: true })}
          >
            Cozinhar
          </button>
          <button type="button" className={`${styles.action} ${styles.close}`} onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.top}>
            {recipe.image ? (
              <img className={styles.thumb} src={recipe.image} alt="" />
            ) : (
              <div className={styles.thumbFallback} aria-hidden="true">
                🍲
              </div>
            )}

            <div>
              <h2 className={styles.name}>{recipe.name}</h2>
              {recipe.description && <p className={styles.description}>{recipe.description}</p>}

              <ul className={styles.metaList}>
                <MetaRow label="Rendimento">{formatYield(recipe)}</MetaRow>
                <MetaRow label="Preparação">{formatMinutes(recipe.timing.prepMinutes)}</MetaRow>
                <MetaRow label="Confeção">{formatMinutes(recipe.timing.cookMinutes)}</MetaRow>
                <MetaRow label="Total">{formatMinutes(activeMinutes(recipe))}</MetaRow>
                {recipe.timing.prepAhead && (
                  <MetaRow label="Antecedência">
                    {`${formatPrepAhead(recipe.timing.prepAhead.minutes)} — ${recipe.timing.prepAhead.description}`}
                  </MetaRow>
                )}
                <MetaRow label="Como se faz">
                  {recipe.methods.map((m) => COOKING_METHOD_NAMES[m]).join(', ')}
                </MetaRow>
                {recipe.weight && <MetaRow label="Peso">{WEIGHT_NAMES[recipe.weight]}</MetaRow>}
                <MetaRow label="Última vez">{formatLastCooked(lastCooked, today)}</MetaRow>
              </ul>

              <div className={styles.chips}>
                {recipe.labels.map((id) => (
                  <LabelChip key={id}>{catalogue.labelsById.get(id)?.name ?? id}</LabelChip>
                ))}
              </div>
            </div>
          </div>

          <div className={`${styles.section} ${styles.columns}`}>
            <div>
              <h3 className={styles.sectionTitle}>Ingredientes</h3>
              <ul className={styles.ingredients}>
                {recipe.ingredients.map((item) => {
                  const { name, amount } = describeIngredient(item, catalogue.ingredientsById.get(item.ref));
                  return (
                    <li key={item.ref} className={styles.ingredient}>
                      <span>
                        {name}
                        {item.note && <span className={styles.ingredientNote}>{item.note}</span>}
                      </span>
                      <span className={styles.quantity}>{amount}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              {appliances.length > 0 && (
                <>
                  <h3 className={styles.sectionTitle}>Precisas de</h3>
                  <ul className={styles.equipment}>
                    {appliances.map((item) => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                </>
              )}
              {utensils.length > 0 && (
                <>
                  <h3 className={`${styles.sectionTitle} ${styles.section}`}>Utensílios</h3>
                  <ul className={styles.equipment}>
                    {utensils.map((item) => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Preparação</h3>
            <ol className={styles.steps}>
              {recipe.steps.map((step, index) => (
                <li key={index} className={styles.step}>
                  <span>
                    {step.text}
                    {(step.durationMinutes || step.temperatureC) && (
                      <span className={styles.stepMeta}>
                        {step.temperatureC && <span>{step.temperatureC} °C</span>}
                        {step.durationMinutes && <span>{formatMinutes(step.durationMinutes)}</span>}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.nutrition && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Nutrição, por dose</h3>
              <div className={styles.nutrition}>
                <NutritionRow label="Energia" value={recipe.nutrition.calories} unit="kcal" />
                <NutritionRow label="Proteína" value={recipe.nutrition.proteinGrams} unit="g" />
                <NutritionRow label="Hidratos" value={recipe.nutrition.carbsGrams} unit="g" />
                <NutritionRow label="Gordura" value={recipe.nutrition.fatGrams} unit="g" />
                <NutritionRow label="das quais saturadas" value={recipe.nutrition.saturatedFatGrams} unit="g" />
                <NutritionRow label="Fibra" value={recipe.nutrition.fibreGrams} unit="g" />
                <NutritionRow label="Sal" value={recipe.nutrition.saltGrams} unit="g" />
              </div>
              {recipe.nutrition.method === 'estimado' && (
                <p className={styles.estimated}>Valores estimados, não calculados a partir dos ingredientes.</p>
              )}
            </div>
          )}

          {recipe.narrative && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>A receita seguida</h3>
              <p className={styles.narrative}>{recipe.narrative}</p>
            </div>
          )}

          <p className={styles.pending}>
            Favoritos, planear e o modo cozinha ainda não estão ligados. E falta decidir se este ecrã
            fica assim, com scroll, ou passa a abas como o Cookidoo — conversa 3.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: string }) {
  return (
    <li className={styles.metaRow}>
      <span className={styles.metaLabel}>{label}</span>
      <span>{children}</span>
    </li>
  );
}

function NutritionRow({ label, value, unit }: { label: string; value?: number; unit: string }) {
  if (value === undefined) return null;
  return (
    <>
      <span className={styles.nutritionLabel}>{label}</span>
      <span className={styles.nutritionValue}>
        {String(value).replace('.', ',')} {unit}
      </span>
    </>
  );
}
