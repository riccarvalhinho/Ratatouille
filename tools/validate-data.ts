/**
 * Valida tudo o que está em data/.
 *
 * Duas camadas:
 *  1. Forma — cada ficheiro bate certo com o seu schema em data/schema/.
 *  2. Integridade referencial — os ids que os ficheiros referem existem mesmo.
 *
 * A segunda é a que apanha os erros a sério: uma receita que aponta para um ingrediente
 * inexistente passa no schema e parte a lista de compras.
 */
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { paths, rel } from './paths.ts';
import { readJson, loadAll, type LoadedFile } from './load-data.ts';
// Uma implementação só, testada uma vez: app/src/domain/planning.test.ts.
import { isoWeekOf } from '../app/src/domain/planning.ts';

const problems: string[] = [];
function fail(where: string, message: string) {
  problems.push(`${where}: ${message}`);
}

// ---------------------------------------------------------------- camada 1: schemas

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemas = {
  recipe: readJson(path.join(paths.schemas, 'recipe.schema.json')).data,
  plan: readJson(path.join(paths.schemas, 'plan.schema.json')).data,
  state: readJson(path.join(paths.schemas, 'state.schema.json')).data,
  taxonomy: readJson(path.join(paths.schemas, 'taxonomy.schema.json')).data,
};

const validators = {
  recipe: ajv.compile(schemas.recipe as object),
  plan: ajv.compile(schemas.plan as object),
  state: ajv.compile(schemas.state as object),
  taxonomy: ajv.compile(schemas.taxonomy as object),
};

function checkSchema(kind: keyof typeof validators, entry: LoadedFile) {
  const validate = validators[kind];
  if (validate(entry.data)) return;
  for (const error of validate.errors ?? []) {
    const at = error.instancePath || '(raiz)';
    fail(entry.name, `${at} ${error.message ?? 'inválido'}`);
  }
}

const data = loadAll();

for (const recipe of data.recipes) checkSchema('recipe', recipe);
for (const plan of data.plans) checkSchema('plan', plan);
for (const taxonomy of [data.labels, data.ingredients, data.equipment]) checkSchema('taxonomy', taxonomy);
for (const state of [data.favourites, data.history]) checkSchema('state', state);

// ---------------------------------------------------- camada 2: integridade referencial

type WithItems = { items: { id: string }[] };
const labelIds = new Set((data.labels.data as WithItems).items.map((item) => item.id));
const ingredientIds = new Set((data.ingredients.data as WithItems).items.map((item) => item.id));
const equipmentIds = new Set((data.equipment.data as WithItems).items.map((item) => item.id));

interface RecipeShape {
  id: string;
  status?: string;
  labels?: string[];
  equipment?: string[];
  image?: string;
  ingredients?: { ref: string }[];
  steps?: { ingredientRefs?: string[] }[];
}

const recipeIds = new Set<string>();
let drafts = 0;

for (const entry of data.recipes) {
  const recipe = entry.data as RecipeShape;
  if (typeof recipe.id !== 'string') continue; // já reportado pela camada 1

  if (recipe.id !== entry.stem) {
    fail(entry.name, `o campo id ("${recipe.id}") tem de ser igual ao nome do ficheiro ("${entry.stem}")`);
  }
  if (recipeIds.has(recipe.id)) fail(entry.name, `id duplicado: ${recipe.id}`);
  recipeIds.add(recipe.id);

  // Um rascunho é um estado legítimo, não um erro — conta-se, não se chumba.
  if (recipe.status === 'rascunho') drafts += 1;

  for (const label of recipe.labels ?? []) {
    if (!labelIds.has(label)) fail(entry.name, `label desconhecida "${label}" — acrescentar a data/taxonomies/labels.json`);
  }
  for (const item of recipe.equipment ?? []) {
    if (!equipmentIds.has(item)) fail(entry.name, `equipamento desconhecido "${item}" — acrescentar a data/taxonomies/equipment.json`);
  }

  const usedIngredients = new Set<string>();
  for (const ingredient of recipe.ingredients ?? []) {
    if (!ingredientIds.has(ingredient.ref)) {
      fail(entry.name, `ingrediente desconhecido "${ingredient.ref}" — acrescentar a data/taxonomies/ingredients.json`);
    }
    if (usedIngredients.has(ingredient.ref)) {
      fail(entry.name, `ingrediente repetido "${ingredient.ref}" — juntar numa linha só, senão a lista de compras conta duas vezes`);
    }
    usedIngredients.add(ingredient.ref);
  }

  recipe.steps?.forEach((step, index) => {
    for (const ref of step.ingredientRefs ?? []) {
      if (!usedIngredients.has(ref)) {
        fail(entry.name, `passo ${index + 1} refere "${ref}", que não está na lista de ingredientes desta receita`);
      }
    }
  });

  if (recipe.image) {
    const expected = `media/recipes/${recipe.id}.`;
    if (!recipe.image.startsWith(expected)) {
      fail(entry.name, `a imagem devia chamar-se ${expected}<ext>, e não "${recipe.image}"`);
    }
  }
}

interface PlanShape {
  week: string;
  days?: { date: string; blocks?: Record<string, { recipeId: string }[]> }[];
}

for (const entry of data.plans) {
  const plan = entry.data as PlanShape;
  if (typeof plan.week !== 'string') continue;

  if (plan.week !== entry.stem) {
    fail(entry.name, `o campo week ("${plan.week}") tem de ser igual ao nome do ficheiro ("${entry.stem}")`);
  }

  const seenDates = new Set<string>();
  for (const day of plan.days ?? []) {
    if (seenDates.has(day.date)) fail(entry.name, `dia repetido: ${day.date}`);
    seenDates.add(day.date);

    let actualWeek: string;
    try {
      actualWeek = isoWeekOf(day.date);
    } catch {
      fail(entry.name, `data inválida: ${day.date}`);
      continue;
    }
    if (actualWeek !== plan.week) {
      fail(entry.name, `${day.date} pertence à semana ${actualWeek}, não a ${plan.week}`);
    }

    for (const [block, entries] of Object.entries(day.blocks ?? {})) {
      for (const item of entries) {
        if (!recipeIds.has(item.recipeId)) {
          fail(entry.name, `${day.date} / ${block}: receita desconhecida "${item.recipeId}"`);
        }
      }
    }
  }
}

const favourites = data.favourites.data as { recipeIds?: string[] };
for (const id of favourites.recipeIds ?? []) {
  if (!recipeIds.has(id)) fail(data.favourites.name, `receita desconhecida "${id}"`);
}

const history = data.history.data as { entries?: { recipeId: string }[] };
for (const item of history.entries ?? []) {
  if (!recipeIds.has(item.recipeId)) fail(data.history.name, `receita desconhecida "${item.recipeId}"`);
}

// ------------------------------------------------------------------------- resultado

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} problema(s) em ${rel(path.join(paths.recipes, '..'))}:\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error('');
  process.exit(1);
}

console.log(
  `✓ dados válidos — ${data.recipes.length} receita(s), ${data.plans.length} semana(s), ` +
    `${ingredientIds.size} ingrediente(s), ${labelIds.size} label(s), ${equipmentIds.size} equipamento(s)`,
);

if (drafts > 0) {
  console.log(`  ${drafts} receita(s) por rever — ver o campo gaps de cada uma`);
}
