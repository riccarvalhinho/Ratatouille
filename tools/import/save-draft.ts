/**
 * Grava uma receita a partir de um rascunho JSON, com validação.
 *
 *   npm run import:save -- rascunho.json
 *   npm run import:save -- rascunho.json timing.prepMinutes   # campos que o humano disse não ter
 *
 * É o único caminho por onde uma receita importada entra em data/recipes/. Faz três coisas que não
 * se devem fazer à mão: calcula o estado e os buracos declarados, confirma que há id, e recusa
 * gravar se faltar alguma coisa bloqueante.
 */
import fs from 'node:fs';
import path from 'node:path';
import { canSave, draftStatus, findGaps, type RecipeDraft } from '../../app/src/domain/gaps.ts';
import { paths, rel } from '../paths.ts';

const [file, ...rest] = process.argv.slice(2);
if (!file) {
  console.error('Falta o ficheiro de rascunho. Uso: npm run import:save -- rascunho.json');
  process.exit(1);
}

/** Campos que o humano disse não ter — contam como respondidos e não mantêm a receita em rascunho. */
const answered = rest.filter((a) => !a.startsWith('--'));

const draft = JSON.parse(fs.readFileSync(file, 'utf8')) as RecipeDraft;
const gaps = findGaps(draft);

if (!canSave(draft)) {
  const blocking = gaps.filter((g) => g.severity === 'bloqueante');
  console.error(`\n✗ Não dá para gravar. Falta responder a ${blocking.length}:\n`);
  for (const gap of blocking) console.error(`  ${gap.field}\n    ${gap.question}\n`);
  process.exit(1);
}

if (!draft.id) {
  console.error('✗ O rascunho não tem id. Sem id não há nome de ficheiro.');
  process.exit(1);
}

const { status, gaps: declared } = draftStatus(draft, answered);
const today = new Date().toISOString().slice(0, 10);
const recipe: RecipeDraft = {
  ...draft,
  ...(status === 'rascunho' ? { status, gaps: declared } : {}),
  createdAt: draft.createdAt ?? today,
  updatedAt: today,
};

const target = path.join(paths.recipes, `${draft.id}.json`);
if (fs.existsSync(target)) {
  console.error(`✗ Já existe ${rel(target)}. Muda o id ou apaga o ficheiro primeiro.`);
  process.exit(1);
}

fs.writeFileSync(target, `${JSON.stringify(recipe, null, 2)}\n`, 'utf8');

console.log(`\n✓ ${rel(target)} — ${status}`);
if (declared.length > 0) console.log(`  buracos declarados: ${declared.join(', ')}`);

const optional = gaps.filter((g) => g.severity === 'opcional');
if (optional.length > 0) {
  console.log('\n  Por responder, sem urgência:');
  for (const gap of optional) console.log(`    ${gap.question}`);
}
console.log('\nA seguir: npm run validate\n');
