import { describe, expect, it } from 'vitest';
import { creditoDaReceita } from './creditos.ts';

describe('creditoDaReceita', () => {
  it('credita o autor e a obra de uma receita vinda de fora', () => {
    expect(
      creditoDaReceita({
        kind: 'web',
        author: 'The Golden Grace Kitchen',
        title: 'Marry Me Shrimp Pasta',
        url: 'https://exemplo.pt/receita',
      }),
    ).toEqual({
      texto: 'Receita original de The Golden Grace Kitchen, «Marry Me Shrimp Pasta», aqui reescrita e adaptada.',
      url: 'https://exemplo.pt/receita',
    });
  });

  it('diz sempre que foi adaptada, porque as instruções são reescritas', () => {
    expect(creditoDaReceita({ kind: 'video', author: 'Um canal' })?.texto).toContain(
      'reescrita e adaptada',
    );
  });

  it('não credita o que é desta casa', () => {
    for (const kind of ['propria', 'familia', 'gerada'] as const) {
      expect(creditoDaReceita({ kind, author: 'Claude' })).toBeUndefined();
    }
  });

  it('não inventa crédito quando a fonte não diz de quem é', () => {
    expect(creditoDaReceita({ kind: 'web' })).toBeUndefined();
    expect(creditoDaReceita(undefined)).toBeUndefined();
    expect(creditoDaReceita({ author: 'Alguém' })).toBeUndefined();
  });

  it('aguenta uma fonte só com título, ou só com link', () => {
    expect(creditoDaReceita({ kind: 'livro', title: 'Cozinha Tradicional' })?.texto).toBe(
      'Receita original de «Cozinha Tradicional», aqui reescrita e adaptada.',
    );
    expect(creditoDaReceita({ kind: 'importada', url: 'https://exemplo.pt/x' })).toEqual({
      texto: 'Receita original de outra cozinha, aqui reescrita e adaptada.',
      url: 'https://exemplo.pt/x',
    });
  });
});
