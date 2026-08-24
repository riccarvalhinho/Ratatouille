/**
 * Que perguntas fazer sobre uma receita importada.
 *
 * A regra do produto é que **nada fica em branco em silêncio**: o que não se conseguiu extrair é
 * perguntado, e o que fica por responder mantém a receita em rascunho com o buraco declarado.
 *
 * Este ficheiro decide **o que falta** e **por que ordem perguntar**. Perguntar por ordem de impacto
 * importa: um ingrediente que não existe na taxonomia parte a lista de compras e tem de ser
 * resolvido; o Nutri… a nutrição pode esperar.
 */
import type { Recipe } from './types.ts';

export type GapSeverity = 'bloqueante' | 'importante' | 'opcional';

export interface Gap {
  /** Caminho do campo, tal como vai para o array `gaps` da receita. */
  field: string;
  severity: GapSeverity;
  /** A pergunta a fazer, escrita para ser lida ou ouvida. */
  question: string;
}

const SEVERITY_ORDER: Record<GapSeverity, number> = {
  bloqueante: 0,
  importante: 1,
  opcional: 2,
};

/** Um rascunho de receita: tudo opcional, porque tudo pode faltar. */
export type RecipeDraft = Partial<Recipe> & { id?: string };

export function findGaps(draft: RecipeDraft): Gap[] {
  const gaps: Gap[] = [];

  if (!draft.name?.trim()) {
    gaps.push({ field: 'name', severity: 'bloqueante', question: 'Como se chama a receita?' });
  }

  if (!draft.ingredients || draft.ingredients.length === 0) {
    gaps.push({
      field: 'ingredients',
      severity: 'bloqueante',
      question: 'Não consegui extrair ingredientes nenhuns. Quais são?',
    });
  } else {
    // Ingredientes sem referência canónica partem a lista de compras — resolvem-se sempre.
    draft.ingredients.forEach((item, index) => {
      if (!item.ref) {
        gaps.push({
          field: `ingredients[${index}].ref`,
          severity: 'bloqueante',
          question: `O ingrediente "${item.note ?? index}" não existe na taxonomia. Qual é, ou acrescento um novo?`,
        });
      } else if (item.quantity === undefined && item.unit !== 'qb') {
        gaps.push({
          field: `ingredients[${index}].quantity`,
          severity: 'importante',
          question: `Que quantidade de ${item.ref}? Se for a gosto, digo "q.b.".`,
        });
      }
    });
  }

  if (!draft.steps || draft.steps.length === 0) {
    gaps.push({
      field: 'steps',
      severity: 'bloqueante',
      question: 'Não consegui extrair o passo a passo. Como se faz?',
    });
  }

  if (draft.servings === undefined && !draft.yield) {
    gaps.push({
      field: 'servings',
      severity: 'importante',
      question: 'Para quantas pessoas dá? Se render unidades em vez de pessoas, quantas — trinta bolachas, um bolo?',
    });
  }

  if (!draft.timing || draft.timing.prepMinutes === undefined) {
    gaps.push({
      field: 'timing.prepMinutes',
      severity: 'importante',
      question: 'Quanto tempo demora a preparação, sem contar com a confeção?',
    });
  }
  if (!draft.timing || draft.timing.cookMinutes === undefined) {
    gaps.push({
      field: 'timing.cookMinutes',
      severity: 'importante',
      question: 'Quanto tempo demora a cozinhar?',
    });
  }

  if (!draft.methods || draft.methods.length === 0) {
    gaps.push({
      field: 'methods',
      severity: 'importante',
      question: 'Como se confeciona — forno, tacho, frigideira, grelhador, air fryer, micro-ondas, ou nada disso?',
    });
  }

  if (!draft.labels || draft.labels.length === 0) {
    gaps.push({
      field: 'labels',
      severity: 'importante',
      question: 'Que tipo de prato é?',
    });
  }

  // O tipo de cozinha pergunta-se sempre, e "não tem" é resposta válida — não é um buraco.
  gaps.push({
    field: 'labels.origem',
    severity: 'opcional',
    question: 'Tem uma origem de cozinha própria — italiana, indiana, portuguesa? Ou não é de lado nenhum?',
  });

  if (!draft.weight) {
    gaps.push({
      field: 'weight',
      severity: 'opcional',
      question: 'Diria que é leve, equilibrada ou substancial, comparada com outras do mesmo tipo?',
    });
  }

  if (!draft.image) {
    gaps.push({ field: 'image', severity: 'opcional', question: 'Tens fotografia do prato?' });
  }

  if (!draft.nutrition) {
    gaps.push({
      field: 'nutrition',
      severity: 'opcional',
      question: 'Queres que estime a informação nutricional, ou deixamos em branco?',
    });
  }

  return gaps.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/** Uma receita só pode ser gravada quando não sobra nenhum buraco bloqueante. */
export function canSave(draft: RecipeDraft): boolean {
  return !findGaps(draft).some((gap) => gap.severity === 'bloqueante');
}

/**
 * O estado com que a receita deve ser gravada.
 * Sobrando buracos declarados, fica rascunho — utilizável, mas honesta sobre o que lhe falta.
 */
export function draftStatus(draft: RecipeDraft, answeredFields: string[] = []): {
  status: 'rascunho' | 'revisto';
  gaps: string[];
} {
  const remaining = findGaps(draft)
    .filter((gap) => gap.severity !== 'opcional')
    .filter((gap) => !answeredFields.includes(gap.field))
    .map((gap) => gap.field);

  return remaining.length > 0 ? { status: 'rascunho', gaps: remaining } : { status: 'revisto', gaps: [] };
}
