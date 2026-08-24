import { describe, expect, it } from 'vitest';
import { cleanVtt } from '../../../tools/import/video.ts';

/**
 * As legendas automáticas do YouTube e do TikTok repetem cada linha no bloco seguinte, por causa do
 * efeito de rolagem. Sem limpar isso, a transcrição fica com tudo a dobrar e é ilegível.
 */
const vttReal = `WEBVTT
Kind: captions
Language: pt

00:00:00.120 --> 00:00:02.480
começamos por picar duas cebolas

00:00:02.480 --> 00:00:05.000
começamos por picar duas cebolas
e três dentes de alho

00:00:05.000 --> 00:00:08.240
e três dentes de alho
levamos ao lume com azeite
`;

describe('cleanVtt', () => {
  it('tira cabeçalhos, marcas de tempo e numeração', () => {
    const result = cleanVtt(vttReal);
    expect(result).not.toContain('WEBVTT');
    expect(result).not.toContain('-->');
    expect(result).not.toContain('Kind:');
  });

  it('tira as repetições do efeito de rolagem', () => {
    const result = cleanVtt(vttReal);
    expect(result).toBe(
      'começamos por picar duas cebolas e três dentes de alho levamos ao lume com azeite',
    );
  });

  it('tira as etiquetas de tempo dentro da linha', () => {
    const comTags = `WEBVTT

00:00:01.000 --> 00:00:03.000
junte <00:00:01.500><c>o</c> sal
`;
    expect(cleanVtt(comTags)).toBe('junte o sal');
  });

  it('devolve vazio para legendas vazias, sem estoirar', () => {
    expect(cleanVtt('WEBVTT\n\n')).toBe('');
  });
});
