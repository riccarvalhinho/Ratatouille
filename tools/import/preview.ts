/**
 * Mostra uma receita como ela vai aparecer no ecrã de detalhe, em texto.
 *
 *   npm run import:preview -- costelas-no-forno
 *
 * É o último passo de uma importação, e existe porque o JSON não se lê. Um ficheiro pode passar no
 * schema e no validador e continuar errado das maneiras que só se veem lidas: um título de passo
 * que repete o texto, uma nota de ingrediente que devia ser quantidade, um tempo que não bate
 * certo com o que a receita diz. Ver a receita escrita apanha isso antes do commit; abrir a app
 * para o mesmo fim custa um build.
 *
 * **Reutiliza os formatadores da app de propósito** — `describeIngredient`, `formatMinutes`,
 * `formatYield`, `notableEquipment`. Se o preview tivesse formatação própria, divergia do ecrã real
 * na primeira alteração e passava a mentir, que é pior do que não existir.
 */
import { buildCatalogue, describeIngredient, formatMinutes, formatPrepAhead, formatYield, isDraft, notableEquipment } from '../../app/src/data/catalogue.ts';
import { activeMinutes } from '../../app/src/domain/filters.ts';
import { COOKING_METHOD_NAMES, WEIGHT_NAMES, type DataBundle, type Recipe } from '../../app/src/domain/types.ts';
import { loadAll } from '../load-data.ts';

const WIDTH = 76;

const rule = (char = '─') => char.repeat(WIDTH);

/** Quebra em linhas sem cortar palavras, com indentação opcional a partir da segunda. */
function wrap(text: string, indent = 0): string {
  const pad = ' '.repeat(indent);
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > WIDTH - indent) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.map((l, i) => (i === 0 ? l : pad + l)).join('\n');
}

/**
 * Rótulo à esquerda, valor à direita, como as MetaRow do detalhe. O `padEnd` não chega sozinho:
 * "das quais saturadas" é mais comprido do que a coluna e colava-se ao valor.
 */
const row = (label: string, value: string) => `  ${label.padEnd(16)}  ${value}`;

function render(recipe: Recipe, catalogue: ReturnType<typeof buildCatalogue>): string {
  const out: string[] = [];
  const equipment = notableEquipment(recipe, catalogue);

  out.push(rule('━'));
  out.push(recipe.name.toUpperCase());
  if (isDraft(recipe)) out.push(`RASCUNHO — falta: ${(recipe.gaps ?? []).join(', ')}`);
  out.push(rule('━'));

  if (recipe.description) out.push('', wrap(recipe.description));

  out.push('');
  out.push(row('Rendimento', formatYield(recipe)));
  out.push(row('Preparação', formatMinutes(recipe.timing.prepMinutes)));
  out.push(row('Confeção', formatMinutes(recipe.timing.cookMinutes)));
  out.push(row('Total', formatMinutes(activeMinutes(recipe))));
  if (recipe.timing.prepAhead) {
    out.push(
      row(
        'Antecedência',
        `${formatPrepAhead(recipe.timing.prepAhead.minutes)} — ${recipe.timing.prepAhead.description}`,
      ),
    );
  }
  out.push(row('Como se faz', recipe.methods.map((m) => COOKING_METHOD_NAMES[m]).join(', ')));
  if (recipe.weight) out.push(row('Peso', WEIGHT_NAMES[recipe.weight]));

  const labels = recipe.labels.map((id) => catalogue.labelsById.get(id)?.name ?? id);
  out.push('', `  ${labels.map((l) => `[ ${l} ]`).join('  ')}`);

  // A imagem não se vê em texto, mas a atribuição é obrigação da licença e tem de se poder conferir.
  out.push('', rule(), 'IMAGEM', rule());
  if (recipe.image) {
    out.push(`  ${recipe.image}`);
    const credit = recipe.imageCredit;
    out.push(
      credit
        ? `  crédito: ${credit.author ?? 'autor não indicado'} · ${credit.license}${credit.sourceUrl ? ` · ${credit.sourceUrl}` : ''}`
        : '  ⚠ sem imageCredit — se a imagem não é nossa, a licença não está a ser cumprida',
    );
  } else {
    out.push('  (sem imagem — a app mostra um marcador)');
  }

  out.push('', rule(), 'INGREDIENTES', rule());
  for (const item of recipe.ingredients) {
    const { name, amount } = describeIngredient(item, catalogue.ingredientsById.get(item.ref));
    const left = `  ${name}${item.note ? ` (${item.note})` : ''}${item.optional ? ' — opcional' : ''}`;
    const dots = Math.max(2, WIDTH - left.length - amount.length - 1);
    out.push(`${left} ${'.'.repeat(dots)}${amount}`);
  }

  if (equipment.length > 0) {
    out.push('', rule(), 'PRECISAS DE', rule());
    for (const item of equipment) out.push(`  ${item.name}`);
  }

  out.push('', rule(), 'PREPARAÇÃO', rule());
  recipe.steps.forEach((step, i) => {
    const meta = [
      step.temperatureC ? `${step.temperatureC} °C` : '',
      step.durationMinutes ? formatMinutes(step.durationMinutes) : '',
      step.passive ? 'sem estar a olhar' : '',
    ].filter(Boolean);
    const n = String(i + 1).padStart(2);
    out.push('');
    out.push(`${n}. ${step.title ?? '(sem título)'}${meta.length > 0 ? `   · ${meta.join(' · ')}` : ''}`);
    out.push(`    ${wrap(step.text, 4)}`);
  });

  if (recipe.nutrition) {
    out.push('', rule(), 'NUTRIÇÃO, POR DOSE', rule());
    const n = recipe.nutrition;
    const num = (v?: number) => (v === undefined ? undefined : String(v).replace('.', ','));
    for (const [label, value, unit] of [
      ['Energia', num(n.calories), 'kcal'],
      ['Proteína', num(n.proteinGrams), 'g'],
      ['Hidratos', num(n.carbsGrams), 'g'],
      ['Gordura', num(n.fatGrams), 'g'],
      ['das quais saturadas', num(n.saturatedFatGrams), 'g'],
      ['Fibra', num(n.fibreGrams), 'g'],
      ['Sal', num(n.saltGrams), 'g'],
    ] as [string, string | undefined, string][]) {
      if (value !== undefined) out.push(row(label, `${value} ${unit}`));
    }
    if (n.method === 'estimado') {
      out.push('', wrap('  Valores estimados, não calculados a partir dos ingredientes.'));
    }
  }

  if (recipe.narrative) {
    out.push('', rule(), 'A RECEITA SEGUIDA', rule(), '', wrap(recipe.narrative));
  }

  if (recipe.notes) out.push('', rule(), 'NOTAS', rule(), '', wrap(recipe.notes));

  if (recipe.source) {
    const { kind, author, title, url } = recipe.source;
    out.push(
      '',
      rule(),
      `Fonte: ${[kind, author, title, url].filter(Boolean).join(' · ')}`,
    );
  }

  return out.join('\n');
}

const id = process.argv[2];
if (!id) {
  console.error('Falta o id da receita. Uso: npm run import:preview -- costelas-no-forno');
  process.exit(1);
}

const data = loadAll();
const bundle = {
  recipes: data.recipes.map((entry) => entry.data),
  plans: data.plans.map((entry) => entry.data),
  taxonomies: {
    labels: (data.labels.data as { items: unknown[] }).items,
    ingredients: (data.ingredients.data as { items: unknown[] }).items,
    equipment: (data.equipment.data as { items: unknown[] }).items,
  },
  favourites: (data.favourites.data as { recipeIds: string[] }).recipeIds,
  history: (data.history.data as { entries: unknown[] }).entries,
} as unknown as DataBundle;

const catalogue = buildCatalogue(bundle);
const recipe = catalogue.recipes.find((r) => r.id === id);

if (!recipe) {
  console.error(`Não há receita com o id "${id}". Há: ${catalogue.recipes.map((r) => r.id).join(', ')}`);
  process.exit(1);
}

console.log(`\n${render(recipe, catalogue)}\n`);
