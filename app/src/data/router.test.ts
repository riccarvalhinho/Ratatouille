import { describe, expect, it } from 'vitest';
import { parseHash, toHash } from './router.ts';

describe('parseHash', () => {
  it('lê os ecrãs conhecidos', () => {
    expect(parseHash('#/receitas')).toEqual({ screen: 'receitas' });
    expect(parseHash('#/planeamento')).toEqual({ screen: 'planeamento' });
    expect(parseHash('#/compras')).toEqual({ screen: 'compras' });
  });

  it('abre nas receitas quando não há rota — é o ecrã que tem conteúdo', () => {
    // Abrir no "Hoje", que é só um marcador até ao M3, deixava a app pior do que era
    // antes de haver navegação.
    expect(parseHash('')).toEqual({ screen: 'receitas' });
    expect(parseHash('#/')).toEqual({ screen: 'receitas' });
    expect(parseHash('#/inventado')).toEqual({ screen: 'receitas' });
  });

  it('continua a saber ir ao "Hoje" quando pedido', () => {
    expect(parseHash('#/home')).toEqual({ screen: 'home' });
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

describe('o painel de triagem', () => {
  it('pertence ao catálogo e não a um ecrã próprio', () => {
    expect(parseHash('#/apetece')).toEqual({ screen: 'receitas', triagem: true });
  });
});

describe('toHash', () => {
  it('volta ao formato de origem', () => {
    for (const route of [
      { screen: 'home' as const },
      { screen: 'receitas' as const },
      { screen: 'receitas' as const, recipeId: 'caldo-verde' },
      { screen: 'receitas' as const, triagem: true },
    ]) {
      expect(parseHash(toHash(route))).toEqual(route);
    }
  });
});
