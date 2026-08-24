import { describe, expect, it } from 'vitest';
import { canSave, draftStatus, findGaps, type RecipeDraft } from './gaps.ts';

const completa: RecipeDraft = {
  id: 'sopa',
  name: 'Sopa',
  servings: 4,
  labels: ['sopa'],
  methods: ['tacho'],
  weight: 'leve',
  image: 'media/recipes/sopa.jpg',
  nutrition: { method: 'estimado', calories: 200 },
  timing: { prepMinutes: 10, cookMinutes: 20 },
  ingredients: [{ ref: 'batata', quantity: 500, unit: 'g' }],
  steps: [{ text: 'Cozer.' }],
};

const fields = (d: RecipeDraft) => findGaps(d).map((g) => g.field);

describe('findGaps', () => {
  it('não encontra nada numa receita completa, tirando a origem, que se pergunta sempre', () => {
    expect(fields(completa)).toEqual(['labels.origem']);
  });

  it('trata como bloqueante o que impede a receita de existir', () => {
    const vazia: RecipeDraft = {};
    const bloqueantes = findGaps(vazia).filter((g) => g.severity === 'bloqueante').map((g) => g.field);
    expect(bloqueantes).toEqual(['name', 'ingredients', 'steps']);
  });

  it('um ingrediente sem referência canónica é bloqueante — parte a lista de compras', () => {
    const draft = { ...completa, ingredients: [{ ref: '', quantity: 1, unit: 'un' as const }] };
    const gap = findGaps(draft).find((g) => g.field === 'ingredients[0].ref');
    expect(gap?.severity).toBe('bloqueante');
  });

  it('não reclama de quantidade em falta quando a unidade é "q.b."', () => {
    const comQb = { ...completa, ingredients: [{ ref: 'sal', unit: 'qb' as const }] };
    expect(fields(comQb)).not.toContain('ingredients[0].quantity');
  });

  it('reclama de quantidade em falta quando não é "q.b."', () => {
    const semQuantidade = { ...completa, ingredients: [{ ref: 'sal', unit: 'g' as const }] };
    expect(fields(semQuantidade)).toContain('ingredients[0].quantity');
  });

  it('aceita rendimento em unidades em vez de pessoas', () => {
    const bolachas = { ...completa, servings: undefined, yield: '30 bolachas' };
    expect(fields(bolachas)).not.toContain('servings');
  });

  it('pergunta o rendimento quando não há nem pessoas nem unidades', () => {
    const semNada = { ...completa, servings: undefined, yield: undefined };
    expect(fields(semNada)).toContain('servings');
  });

  it('pergunta sempre a origem de cozinha, mesmo numa receita completa', () => {
    expect(fields(completa)).toContain('labels.origem');
  });

  it('ordena por impacto: bloqueantes primeiro, opcionais no fim', () => {
    const severidades = findGaps({ name: 'X' }).map((g) => g.severity);
    const indiceUltimoBloqueante = severidades.lastIndexOf('bloqueante');
    const indicePrimeiroOpcional = severidades.indexOf('opcional');
    expect(indiceUltimoBloqueante).toBeLessThan(indicePrimeiroOpcional);
  });

  it('escreve perguntas legíveis, não nomes de campos', () => {
    for (const gap of findGaps({})) {
      expect(gap.question.length).toBeGreaterThan(10);
      expect(gap.question).toMatch(/\?$|\.$/);
    }
  });
});

describe('canSave', () => {
  it('deixa gravar quando não sobra nada bloqueante', () => {
    expect(canSave(completa)).toBe(true);
    expect(canSave({ ...completa, servings: undefined, yield: undefined })).toBe(true);
  });

  it('não deixa gravar sem nome, sem ingredientes ou sem passos', () => {
    expect(canSave({})).toBe(false);
    expect(canSave({ ...completa, steps: [] })).toBe(false);
  });
});

describe('draftStatus', () => {
  it('marca como revista uma receita sem buracos que interessem', () => {
    expect(draftStatus(completa)).toEqual({ status: 'revisto', gaps: [] });
  });

  it('marca como rascunho e declara os buracos quando algo ficou por responder', () => {
    const semTempos = { ...completa, timing: undefined };
    const result = draftStatus(semTempos);
    expect(result.status).toBe('rascunho');
    expect(result.gaps).toContain('timing.prepMinutes');
    expect(result.gaps).toContain('timing.cookMinutes');
  });

  it('respostas "não tenho" contam como respondidas e não impedem a receita de ficar revista', () => {
    const semTempos = { ...completa, timing: undefined };
    const result = draftStatus(semTempos, ['timing.prepMinutes', 'timing.cookMinutes']);
    expect(result).toEqual({ status: 'revisto', gaps: [] });
  });

  it('os opcionais nunca mantêm uma receita em rascunho', () => {
    const semImagem = { ...completa, image: undefined, weight: undefined, nutrition: undefined };
    expect(draftStatus(semImagem).status).toBe('revisto');
  });
});
