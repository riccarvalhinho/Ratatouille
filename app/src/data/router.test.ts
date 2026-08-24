import { describe, expect, it } from 'vitest';
import { parseHash, toHash } from './router.ts';

describe('parseHash', () => {
  it('lê os ecrãs conhecidos', () => {
    expect(parseHash('#/receitas')).toEqual({ screen: 'receitas' });
    expect(parseHash('#/planeamento')).toEqual({ screen: 'planeamento' });
    expect(parseHash('#/compras')).toEqual({ screen: 'compras' });
  });

  it('cai na home quando o hash está vazio ou é desconhecido', () => {
    expect(parseHash('')).toEqual({ screen: 'home' });
    expect(parseHash('#/')).toEqual({ screen: 'home' });
    expect(parseHash('#/inventado')).toEqual({ screen: 'home' });
  });

  it('lê a receita aberta por cima do ecrã', () => {
    expect(parseHash('#/receitas/caldo-verde')).toEqual({
      screen: 'receitas',
      recipeId: 'caldo-verde',
    });
    // o detalhe abre de qualquer ecrã e tem de saber a que ecrã voltar
    expect(parseHash('#/planeamento/arroz-doce')).toEqual({
      screen: 'planeamento',
      recipeId: 'arroz-doce',
    });
  });

  it('tolera barras a mais e a menos', () => {
    expect(parseHash('#receitas')).toEqual({ screen: 'receitas' });
    expect(parseHash('#//receitas//caldo-verde/')).toEqual({
      screen: 'receitas',
      recipeId: 'caldo-verde',
    });
  });
});

describe('toHash', () => {
  it('volta ao formato de origem', () => {
    for (const route of [
      { screen: 'home' as const },
      { screen: 'receitas' as const },
      { screen: 'receitas' as const, recipeId: 'caldo-verde' },
    ]) {
      expect(parseHash(toHash(route))).toEqual(route);
    }
  });
});
