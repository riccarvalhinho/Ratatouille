import { describe, expect, it } from 'vitest';
import {
  matchAll,
  matchIngredient,
  parseIngredientLine,
  proposeIngredient,
} from './ingredient-matching.ts';
import type { Ingredient } from './types.ts';

const catalogue: Ingredient[] = [
  { id: 'cebola', name: 'Cebola', plural: 'Cebolas', aisle: 'frutas-e-legumes', unitGramsPerUnit: 120 },
  { id: 'dente-de-alho', name: 'Dente de alho', plural: 'Dentes de alho', aisle: 'frutas-e-legumes' },
  { id: 'azeite', name: 'Azeite', aisle: 'mercearia', staple: true },
  { id: 'bacalhau-salgado', name: 'Bacalhau salgado', aisle: 'peixaria' },
  { id: 'batata', name: 'Batata', plural: 'Batatas', aisle: 'frutas-e-legumes' },
  { id: 'natas', name: 'Natas', aisle: 'laticinios-e-ovos' },
  { id: 'sal', name: 'Sal', aisle: 'mercearia', staple: true },
  { id: 'limao', name: 'Limão', plural: 'Limões', aisle: 'frutas-e-legumes' },
];

describe('parseIngredientLine', () => {
  it('separa quantidade, unidade e nome', () => {
    expect(parseIngredientLine('600 g de batata')).toMatchObject({
      quantity: 600,
      unit: 'g',
      name: 'batata',
    });
  });

  it('assume unidades quando há número sem unidade', () => {
    expect(parseIngredientLine('2 cebolas')).toMatchObject({ quantity: 2, unit: 'un', name: 'cebolas' });
  });

  it('percebe colheres de sopa', () => {
    expect(parseIngredientLine('4 colheres de sopa de azeite')).toMatchObject({
      quantity: 4,
      unit: 'csopa',
      name: 'azeite',
    });
  });

  it('percebe as abreviaturas que os sites portugueses usam mesmo', () => {
    // apanhado a importar uma página real: "2 unid. cebola" e "2,5 dl leite"
    expect(parseIngredientLine('2 unid. cebola')).toMatchObject({ quantity: 2, unit: 'un', name: 'cebola' });
    expect(parseIngredientLine('2,5 dl leite')).toMatchObject({ quantity: 250, unit: 'ml', name: 'leite' });
    expect(parseIngredientLine('5 cl vinho')).toMatchObject({ quantity: 50, unit: 'ml' });
  });

  it('percebe frações', () => {
    expect(parseIngredientLine('1/2 cebola roxa')).toMatchObject({ quantity: 0.5, unit: 'un' });
  });

  it('reconhece "q.b." e as suas variantes, e não lhes inventa quantidade', () => {
    for (const line of ['sal q.b.', 'sal qb', 'sal a gosto', 'pimenta quanto baste']) {
      const parsed = parseIngredientLine(line);
      expect(parsed.unit).toBe('qb');
      expect(parsed.quantity).toBeUndefined();
    }
  });

  it('separa a preparação para a nota, tirando-a do nome', () => {
    const parsed = parseIngredientLine('1 cebola, picada');
    expect(parsed.name).toBe('cebola');
    expect(parsed.note).toBe('picada');
  });

  it('separa a preparação mesmo sem vírgula, que é como a maioria das receitas escreve', () => {
    expect(parseIngredientLine('1 cebola picada')).toMatchObject({ name: 'cebola', note: 'picada' });
    expect(parseIngredientLine('600 g de batatas descascadas')).toMatchObject({
      name: 'batatas',
      note: 'descascadas',
    });
  });

  it('não confunde parte do nome com preparação', () => {
    // "roxa" não é preparação — tem de ficar no nome
    expect(parseIngredientLine('1 cebola roxa').name).toBe('cebola roxa');
  });

  it('tira parênteses para a nota', () => {
    const parsed = parseIngredientLine('400 g de mistura de legumes (cortados em pedaços)');
    expect(parsed.note).toBe('cortados em pedaços');
    expect(parsed.name).toBe('mistura de legumes');
  });

  it('aguenta bullets e espaços a mais', () => {
    expect(parseIngredientLine('  -  300 g   de  bacalhau  ')).toMatchObject({
      quantity: 300,
      unit: 'g',
      name: 'bacalhau',
    });
  });

  it('guarda sempre o texto original', () => {
    expect(parseIngredientLine('2 cebolas grandes').raw).toBe('2 cebolas grandes');
  });
});

describe('matchIngredient', () => {
  const match = (line: string) => matchIngredient(parseIngredientLine(line), catalogue);

  it('acerta no singular e no plural', () => {
    expect(match('2 cebolas')).toMatchObject({ ref: 'cebola', confidence: 'exata' });
    expect(match('1 cebola')).toMatchObject({ ref: 'cebola', confidence: 'exata' });
    expect(match('3 limões')).toMatchObject({ ref: 'limao', confidence: 'exata' });
  });

  it('ignora adjetivos de tamanho e frescura', () => {
    expect(match('2 cebolas grandes')).toMatchObject({ ref: 'cebola', confidence: 'exata' });
    expect(match('1 batata média')).toMatchObject({ ref: 'batata', confidence: 'exata' });
  });

  it('acerta em nomes compostos', () => {
    expect(match('3 dentes de alho')).toMatchObject({ ref: 'dente-de-alho', confidence: 'exata' });
  });

  it('dá correspondência provável quando o nome traz palavras a mais', () => {
    const result = match('azeite virgem extra');
    expect(result.ref).toBe('azeite');
    expect(result.confidence).toBe('provavel');
  });

  it('encontra o bacalhau salgado a partir de "bacalhau demolhado"', () => {
    const result = match('600 g de bacalhau demolhado');
    expect(result.suggestions).toContain('bacalhau-salgado');
  });

  it('não inventa referência quando não conhece o ingrediente', () => {
    const result = match('200 g de tofu fumado');
    expect(result.ref).toBeUndefined();
    expect(result.confidence).toBe('nenhuma');
  });

  it('devolve sugestões para quem tem de decidir', () => {
    expect(match('natas para bater').suggestions).toContain('natas');
  });
});

describe('matchAll', () => {
  it('processa uma lista de receita real', () => {
    const results = matchAll(
      [
        '600 g de batata, descascadas e em cubos',
        '1 cebola picada',
        '2 dentes de alho',
        '4 colheres de sopa de azeite',
        'sal q.b.',
        '200 g de tofu fumado',
      ],
      catalogue,
    );

    expect(results.map((r) => r.ref)).toEqual([
      'batata',
      'cebola',
      'dente-de-alho',
      'azeite',
      'sal',
      undefined,
    ]);
    // Só o desconhecido fica por resolver — é a única pergunta a fazer ao humano.
    expect(results.filter((r) => !r.ref)).toHaveLength(1);
  });
});

describe('proposeIngredient', () => {
  it('propõe um id em slug a partir do nome', () => {
    expect(proposeIngredient('tofu fumado')).toMatchObject({ id: 'tofu-fumado', name: 'Tofu fumado' });
  });

  it('adivinha a zona do supermercado pelo nome', () => {
    expect(proposeIngredient('lombo de porco').aisle).toBe('talho');
    expect(proposeIngredient('salmão fresco').aisle).toBe('peixaria');
    expect(proposeIngredient('queijo da serra').aisle).toBe('laticinios-e-ovos');
    expect(proposeIngredient('curgete').aisle).toBe('frutas-e-legumes');
    // sem pista, cai em mercearia, que é o mais provável
    expect(proposeIngredient('massa folhada').aisle).toBe('mercearia');
  });
});
