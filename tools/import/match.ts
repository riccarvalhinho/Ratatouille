/**
 * Corresponde linhas de ingredientes ao vocabulário canónico e diz o que falta resolver.
 *
 *   npm run import:match -- "600 g de batata" "1 cebola picada" "200 g de tofu fumado"
 *   npm run import:match -- --ficheiro ingredientes.txt
 *
 * Serve o passo mais chato de qualquer importação. O que não corresponder aparece com sugestões e
 * com uma proposta de entrada nova — que **nunca** é gravada sozinha.
 */
import fs from 'node:fs';
import { matchAll, proposeIngredient } from '../../app/src/domain/ingredient-matching.ts';
import { loadIngredients } from './taxonomies.ts';

const args = process.argv.slice(2);
const fileFlag = args.indexOf('--ficheiro');

const lines =
  fileFlag >= 0
    ? fs
        .readFileSync(args[fileFlag + 1] ?? '', 'utf8')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
    : args.filter((a) => !a.startsWith('--'));

if (lines.length === 0) {
  console.error('Nada para corresponder. Passa as linhas como argumentos ou usa --ficheiro.');
  process.exit(1);
}

const catalogue = loadIngredients();
const results = matchAll(lines, catalogue);

const resolved = results.filter((r) => r.confidence === 'exata');
const toConfirm = results.filter((r) => r.confidence === 'provavel');
const unknown = results.filter((r) => r.confidence === 'nenhuma');

console.log(`\n${resolved.length} resolvidos, ${toConfirm.length} a confirmar, ${unknown.length} desconhecidos\n`);

for (const r of resolved) {
  const q = r.line.quantity !== undefined ? `${r.line.quantity} ${r.line.unit}` : (r.line.unit ?? '');
  console.log(`  ✓ ${r.ref!.padEnd(24)} ${q.padEnd(10)} ${r.line.note ? `(${r.line.note})` : ''}`);
}

if (toConfirm.length > 0) {
  console.log('\nA confirmar — o nome canónico aparece na linha, mas sobraram palavras:');
  for (const r of toConfirm) {
    console.log(`  ? "${r.line.raw}"  →  ${r.ref}   outras hipóteses: ${r.suggestions.join(', ')}`);
  }
}

if (unknown.length > 0) {
  console.log('\nDesconhecidos — decidir antes de gravar, senão a lista de compras não os consegue somar:');
  for (const r of unknown) {
    const proposal = proposeIngredient(r.line.name);
    console.log(`  ✗ "${r.line.raw}"`);
    console.log(
      `      proposta para a taxonomia: ${JSON.stringify({ id: proposal.id, name: proposal.name, aisle: proposal.aisle })}`,
    );
    if (r.suggestions.length > 0) console.log(`      ou um destes: ${r.suggestions.join(', ')}`);
  }
}
console.log('');
