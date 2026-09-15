/**
 * Suspeitas de desleixo nas receitas, em série.
 *
 *   npm run import:sanidade              # todas
 *   npm run import:sanidade -- bitoque   # só estas
 *
 * Isto **não** é o validador. O `npm run validate` diz o que está inválido e é a autoridade; este
 * diz o que está estranho, e pode enganar-se nos dois sentidos. Existe por causa da escala: dez
 * receitas leem-se com atenção, cento e dez não, e os erros de uma geração em série são sempre os
 * mesmos meia dúzia — um título que repete o texto, um ingrediente que nenhum passo usa, um tempo
 * que não bate certo.
 *
 * Preferiu-se apanhar de mais a apanhar de menos: cada suspeita custa dez segundos a despachar, e
 * um erro que passe fica no catálogo até alguém dar por ele com o tacho ao lume.
 */
import { readJsonDir } from '../load-data.ts';
import { paths } from '../paths.ts';

/** Minúsculas e sem acentos, para comparar títulos com texto sem tropeçar em "confeção"/"confecao". */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Passo {
  title?: string;
  text: string;
  durationMinutes?: number;
  passive?: boolean;
  ingredientRefs?: string[];
}

interface Receita {
  id: string;
  status?: string;
  ingredients: { ref: string }[];
  steps: Passo[];
  timing: { prepMinutes: number; cookMinutes: number; prepAhead?: { minutes: number } };
  nutrition?: { calories?: number };
}

/**
 * Calorias por dose fora deste intervalo são quase de certeza um engano de estimativa. Um granizado
 * de fruta anda pelas 90 e um bitoque completo pelas 950 — é de propósito largo, porque o objetivo
 * é apanhar o zero que ficou por preencher e a casa decimal a mais, não discutir nutrição.
 */
const CALORIAS_MIN = 50;
const CALORIAS_MAX = 1200;

/** Acima desta proporção entre a soma dos passos e o tempo total, vale a pena ir ver. */
const FOLGA_DE_TEMPOS = 1.6;

function suspeitas(receita: Receita): string[] {
  const achados: string[] = [];
  const declarados = new Set(receita.ingredients.map((item) => item.ref));
  const usados = new Set<string>();

  receita.steps.forEach((passo, indice) => {
    const numero = indice + 1;
    for (const ref of passo.ingredientRefs ?? []) {
      usados.add(ref);
      if (!declarados.has(ref)) {
        achados.push(`passo ${numero}: usa "${ref}", que não está na lista de ingredientes`);
      }
    }

    // O título e o texto têm de dizer coisas diferentes — é a regra mais fácil de aplicar mal, e a
    // única destas suspeitas que é sobre escrita e não sobre dados.
    const titulo = normalizar(passo.title ?? '');
    if (titulo && normalizar(passo.text).includes(titulo)) {
      achados.push(`passo ${numero}: o título está contido no texto, portanto um dos dois sobra`);
    }
  });

  for (const ref of declarados) {
    if (!usados.has(ref)) {
      achados.push(`"${ref}" está nos ingredientes e nenhum passo o usa`);
    }
  }

  if (!receita.steps.some((passo) => passo.durationMinutes)) {
    achados.push('nenhum passo tem duração — o modo cozinha fica sem temporizador nenhum');
  }

  /*
   * Os passos passivos ficam sempre de fora desta conta. `prepMinutes` e `cookMinutes` medem tempo
   * na cozinha, e um passo passivo é por definição tempo em que não se está lá — o granizado a
   * congelar, o brownie a arrefecer, a massa a levedar. Contá-los dava um falso positivo garantido
   * em qualquer receita com espera. Ver "A antecedência vira passo, ou não?" na skill.
   */
  const contam = receita.steps.filter((passo) => !passo.passive);
  const somaDosPassos = contam.reduce((total, passo) => total + (passo.durationMinutes ?? 0), 0);
  const total = receita.timing.prepMinutes + receita.timing.cookMinutes;
  if (total > 0 && somaDosPassos > total * FOLGA_DE_TEMPOS) {
    achados.push(`os passos somam ${somaDosPassos} min para um total declarado de ${total} min`);
  }

  if (receita.timing.prepMinutes === 0 && receita.ingredients.length > 4) {
    achados.push('preparação a zero numa receita com ingredientes que alguém tem de cortar');
  }

  const calorias = receita.nutrition?.calories;
  if (calorias !== undefined && (calorias < CALORIAS_MIN || calorias > CALORIAS_MAX)) {
    achados.push(`${calorias} kcal por dose — fora do intervalo plausível`);
  }

  return achados;
}

const pedidos = process.argv.slice(2).filter((argumento) => !argumento.startsWith('--'));
const receitas = readJsonDir<Receita>(paths.recipes).filter(
  (entrada) => pedidos.length === 0 || pedidos.includes(entrada.data.id),
);

if (receitas.length === 0) {
  console.error(
    pedidos.length > 0 ? `Não encontrei nenhuma de: ${pedidos.join(', ')}` : 'Não há receitas.',
  );
  process.exit(1);
}

let comSuspeitas = 0;
for (const { data } of receitas) {
  const achados = suspeitas(data);
  if (achados.length === 0) {
    console.log(`  ✓  ${data.id}`);
    continue;
  }
  comSuspeitas += 1;
  console.log(`  ?  ${data.id}`);
  for (const achado of achados) console.log(`       ${achado}`);
}

console.log(
  `\n${receitas.length} receita(s), ${comSuspeitas} com suspeitas.` +
    (comSuspeitas > 0 ? ' Suspeitas, não erros — confirmar uma a uma antes de mexer.\n' : '\n'),
);

process.exit(comSuspeitas > 0 ? 1 : 0);
