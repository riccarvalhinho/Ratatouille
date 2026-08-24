/**
 * Correspondência entre texto de receita e ingredientes canónicos.
 *
 * É o estrangulamento real de qualquer importação. Uma receita traz "2 cebolas grandes picadas",
 * "azeite virgem extra q.b." e "300g de bacalhau demolhado"; a taxonomia tem `cebola`, `azeite` e
 * `bacalhau-salgado`. Sem esta ponte, cada receita importada obriga a mapear tudo à mão.
 *
 * A regra que não se quebra: **nunca inventar uma referência**. Quando não há correspondência
 * segura, isso é reportado para alguém decidir — acrescentar à taxonomia ou escolher outra.
 */
import type { Aisle, Ingredient, Unit } from './types.ts';

export interface ParsedIngredientLine {
  /** O texto original, tal como veio da fonte. */
  raw: string;
  quantity?: number;
  unit?: Unit;
  /** O nome do ingrediente, já sem quantidade nem preparação. */
  name: string;
  /** "picada", "em cubos", "demolhado" — vai para o campo note. */
  note?: string;
}

export interface IngredientMatch {
  line: ParsedIngredientLine;
  /** O id canónico, quando houve correspondência com confiança suficiente. */
  ref?: string;
  /** Quão certa é a correspondência. Abaixo de `exata` convém confirmar. */
  confidence: 'exata' | 'provavel' | 'nenhuma';
  /** Candidatos a apresentar quando não houve certeza. */
  suggestions: string[];
}

/** Tira acentos, plural simples e ruído, para comparar maçãs com maçãs. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Plural português simples: cebolas→cebola, limões→limão, pastéis→pastel, mulheres→mulher.
 *
 * O `-es` só se tira quando o singular acabaria em consoante que o exige (mulher, luz, país). Sem
 * essa restrição, "grandes" virava "grand" em vez de "grande" — e deixava de ser reconhecido como
 * palavra a ignorar, estragando a comparação de "2 cebolas grandes".
 */
function singular(word: string): string {
  if (word.endsWith('oes') || word.endsWith('aes')) return `${word.slice(0, -3)}ao`;
  if (word.endsWith('eis')) return `${word.slice(0, -3)}el`;
  if (word.endsWith('ns')) return `${word.slice(0, -2)}m`;
  if (/(r|z|s|n|l)es$/.test(word) && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
  return word;
}

/** Palavras que não ajudam a identificar o ingrediente e só atrapalham a comparação. */
const NOISE = new Set([
  'de', 'do', 'da', 'dos', 'das', 'a', 'o', 'as', 'os', 'e', 'em', 'com', 'ao', 'à',
  'grande', 'grandes', 'pequeno', 'pequena', 'pequenos', 'pequenas', 'medio', 'media',
  'medios', 'medias', 'fresco', 'fresca', 'frescos', 'frescas', 'gosto', 'qb', 'quanto',
  'baste', 'cerca', 'aprox', 'aproximadamente', 'bem', 'muito', 'pouco',
]);

function tokens(text: string): string[] {
  return normalise(text)
    .split(/[\s-]+/)
    .map(singular)
    .filter((t) => t.length > 1 && !NOISE.has(t));
}

const UNIT_PATTERNS: [RegExp, Unit][] = [
  [/^(kg|quilos?|quilogramas?)$/, 'kg'],
  [/^(g|gr|gramas?)$/, 'g'],
  [/^(l|lt|litros?)$/, 'l'],
  [/^(ml|mililitros?)$/, 'ml'],
  [/^(c\.?\s*sopa|colheres?\s+de\s+sopa|csopa)$/, 'csopa'],
  [/^(c\.?\s*cha|colheres?\s+de\s+cha|ccha)$/, 'ccha'],
  [/^(pitadas?)$/, 'pitada'],
  [/^(un|unidades?|uns?|umas?)$/, 'un'],
];

/** Preparações que aparecem depois de vírgula e pertencem ao campo `note`, não ao nome. */
const PREP_HINT =
  /\b(picad|cortad|ralad|fatiad|em cubos|em rodelas|demolhad|escorrid|descascad|desfiad|batid|derretid|à temperatura|em juliana|em meias-luas|sem pele|sem grainhas|em pedaços)/i;

/**
 * Parte uma linha de ingrediente em quantidade, unidade, nome e preparação.
 * Deliberadamente tolerante: é melhor devolver um nome com ruído do que não devolver nada.
 */
export function parseIngredientLine(raw: string): ParsedIngredientLine {
  let rest = raw.trim().replace(/^[-•*]\s*/, '');
  let quantity: number | undefined;
  let unit: Unit | undefined;

  // "1/2", "1,5", "2" no início da linha
  const qtyMatch = /^(\d+\s*\/\s*\d+|\d+[.,]\d+|\d+)\s*/.exec(rest);
  if (qtyMatch?.[1]) {
    const text = qtyMatch[1].replace(/\s/g, '');
    quantity = text.includes('/')
      ? Number(text.split('/')[0]) / Number(text.split('/')[1])
      : Number(text.replace(',', '.'));
    rest = rest.slice(qtyMatch[0].length);
  }

  // "q.b." em qualquer sítio da linha
  if (/\bq\.?\s?b\.?\b|\ba gosto\b|\bquanto baste\b/i.test(rest)) {
    unit = 'qb';
    quantity = undefined;
    rest = rest.replace(/\bq\.?\s?b\.?\b|\ba gosto\b|\bquanto baste\b/gi, '');
  }

  if (!unit) {
    const unitMatch = /^([a-zA-Zç.]+(?:\s+de\s+(?:sopa|cha|chá))?)\s+(?:de\s+)?/.exec(rest);
    const candidate = unitMatch?.[1] ? normalise(unitMatch[1]) : '';
    for (const [pattern, value] of UNIT_PATTERNS) {
      if (pattern.test(candidate)) {
        unit = value;
        rest = rest.slice(unitMatch![0].length);
        break;
      }
    }
  }

  // Se houve quantidade mas nenhuma unidade reconhecida, são unidades soltas: "2 cebolas".
  if (quantity !== undefined && !unit) unit = 'un';

  // A preparação vem tipicamente depois de vírgula ou entre parênteses.
  let note: string | undefined;
  const commaSplit = rest.split(/,\s*/);
  if (commaSplit.length > 1) {
    const tail = commaSplit.slice(1).join(', ').trim();
    if (PREP_HINT.test(tail)) {
      note = tail;
      rest = commaSplit[0] ?? rest;
    }
  }
  const parens = /\(([^)]*)\)/.exec(rest);
  if (parens?.[1]) {
    note = note ? `${note}, ${parens[1]}` : parens[1];
    rest = rest.replace(parens[0], ' ');
  }

  let name = rest.replace(/\s+/g, ' ').trim().replace(/^de\s+/i, '');

  // Muitas receitas escrevem a preparação sem vírgula: "1 cebola picada", "batatas descascadas".
  // Enquanto a última palavra for claramente uma preparação, passa para a nota.
  const trailing: string[] = [];
  for (;;) {
    const match = /\s+(\S+)$/.exec(name);
    if (!match?.[1] || !PREP_HINT.test(match[1])) break;
    trailing.unshift(match[1]);
    name = name.slice(0, match.index);
  }
  if (trailing.length > 0) {
    const tail = trailing.join(' ');
    note = note ? `${tail}, ${note}` : tail;
  }

  const result: ParsedIngredientLine = { raw, name };
  if (quantity !== undefined) result.quantity = quantity;
  if (unit) result.unit = unit;
  if (note) result.note = note;
  return result;
}

/**
 * Compara a linha da receita com um nome canónico.
 *
 * São duas medidas diferentes e as duas importam. **Cobertura** é quanto do nome canónico aparece na
 * linha: "azeite virgem extra" cobre "azeite" a 100%. **Precisão** é quanto da linha foi explicado
 * pelo nome canónico: nesse caso só um terço, porque sobraram "virgem" e "extra".
 *
 * A cobertura decide se há correspondência; a precisão decide se é para confiar ou para perguntar.
 * Uma medida só — a sobreposição simples — punia qualificadores e falhava o caso mais comum de todos.
 */
function compare(line: string[], candidate: string[]): { coverage: number; precision: number } {
  if (line.length === 0 || candidate.length === 0) return { coverage: 0, precision: 0 };
  const lineSet = new Set(line);
  const shared = candidate.filter((t) => lineSet.has(t)).length;
  return { coverage: shared / candidate.length, precision: shared / line.length };
}

export function matchIngredient(
  line: ParsedIngredientLine,
  catalogue: Ingredient[],
): IngredientMatch {
  const lineTokens = tokens(line.name);
  if (lineTokens.length === 0) return { line, confidence: 'nenhuma', suggestions: [] };

  const scored = catalogue
    .map((ingredient) => {
      const names = [ingredient.name, ingredient.plural, ingredient.id].filter(
        (n): n is string => Boolean(n),
      );
      // Fica a melhor das grafias do ingrediente: singular, plural ou id.
      const best = names
        .map((n) => compare(lineTokens, tokens(n)))
        .reduce((a, b) =>
          b.coverage > a.coverage || (b.coverage === a.coverage && b.precision > a.precision) ? b : a,
        );
      return { ingredient, ...best };
    })
    .filter((s) => s.coverage > 0)
    .sort((a, b) => b.coverage - a.coverage || b.precision - a.precision);

  const top = scored[0];
  if (!top) return { line, confidence: 'nenhuma', suggestions: [] };

  const suggestions = scored.slice(0, 3).map((s) => s.ingredient.id);

  // O nome canónico inteiro aparece na linha, e a linha não trouxe mais nada: é o ingrediente.
  if (top.coverage === 1 && top.precision === 1) {
    return { line, ref: top.ingredient.id, confidence: 'exata', suggestions };
  }

  // O nome canónico aparece todo, mas sobraram palavras — ou aparece só em parte.
  // Nos dois casos é um bom palpite que merece confirmação.
  if (top.coverage >= 0.5) {
    return { line, ref: top.ingredient.id, confidence: 'provavel', suggestions };
  }

  return { line, confidence: 'nenhuma', suggestions };
}

export function matchAll(lines: string[], catalogue: Ingredient[]): IngredientMatch[] {
  return lines.map((raw) => matchIngredient(parseIngredientLine(raw), catalogue));
}

/**
 * Proposta de entrada nova na taxonomia, para os casos sem correspondência.
 * A zona do supermercado é um palpite a confirmar — nunca se grava sem revisão.
 */
export function proposeIngredient(name: string): { id: string; name: string; aisle: Aisle } {
  const clean = normalise(name)
    .split(/\s+/)
    .filter((t) => !NOISE.has(t))
    .join('-');
  return {
    id: clean || 'por-nomear',
    name: name.charAt(0).toUpperCase() + name.slice(1),
    aisle: guessAisle(name),
  };
}

const AISLE_HINTS: [RegExp, Aisle][] = [
  [/\b(vaca|porco|frango|peru|borrego|cabrito|coelho|bife|carne|chourico|salsicha|fiambre|presunto|entrecosto)\b/i, 'talho'],
  [/\b(bacalhau|peixe|salmao|atum fresco|polvo|lulas|camarao|ameijoas|mexilhao|sardinha|dourada|robalo|pescada)\b/i, 'peixaria'],
  [/\b(leite|queijo|iogurte|natas|manteiga|ovo|ovos|requeijao|creme de leite)\b/i, 'laticinios-e-ovos'],
  [/\b(congelad|gelado)\b/i, 'congelados'],
  [/\b(pao|broa|baguete|tosta)\b/i, 'padaria'],
  [/\b(vinho|cerveja|sumo|agua|refrigerante)\b/i, 'bebidas'],
  [/\b(cebola|alho|batata|cenoura|tomate|couve|alface|limao|laranja|maca|banana|salsa|coentros|pimento|curgete|beringela|abobora|espinafre|brocolo|feijao verde|cogumelo)\b/i, 'frutas-e-legumes'],
];

function guessAisle(name: string): Aisle {
  const normalised = normalise(name);
  for (const [pattern, aisle] of AISLE_HINTS) {
    if (pattern.test(normalised)) return aisle;
  }
  return 'mercearia';
}
