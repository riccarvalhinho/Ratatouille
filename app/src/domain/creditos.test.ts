import { describe, expect, it } from 'vitest';
import { creditoDaReceita, fonteDoCartao } from './creditos.ts';

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

describe('fonteDoCartao', () => {
  it('marca tudo o que não foi gerado, incluindo o que é desta casa', () => {
    expect(fonteDoCartao({ kind: 'familia', author: 'Sogros' })).toEqual({
      kind: 'familia',
      nome: 'Família',
    });
    expect(fonteDoCartao({ kind: 'propria' })).toEqual({ kind: 'propria', nome: 'Nossa' });
    expect(fonteDoCartao({ kind: 'web' })).toEqual({ kind: 'web', nome: 'Site' });
  });

  it('não marca o que foi gerado — seriam 231 cartões a dizer o mesmo', () => {
    expect(fonteDoCartao({ kind: 'gerada', author: 'Claude' })).toBeUndefined();
  });

  it('não marca quem não diz de onde veio', () => {
    expect(fonteDoCartao(undefined)).toBeUndefined();
    expect(fonteDoCartao({ author: 'Alguém' })).toBeUndefined();
  });

  it('usa o nome do critério e nunca o autor, que é texto livre', () => {
    // "The Golden Grace Kitchen" no cartão parte a linha dos factos em duas.
    expect(fonteDoCartao({ kind: 'web', author: 'The Golden Grace Kitchen' })?.nome).toBe('Site');
  });

  it('a regra do cartão não é a do crédito, e as duas convivem', () => {
    // Uma receita da família marca-se no cartão e não se credita no rodapé: é desta casa.
    const sogros = { kind: 'familia', author: 'Sogros' } as const;
    expect(fonteDoCartao(sogros)).toBeDefined();
    expect(creditoDaReceita(sogros)).toBeUndefined();
  });
});
