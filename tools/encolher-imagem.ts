/**
 * Encolhe uma fotografia até caber no limite do repositório.
 *
 * Existe porque a alternativa era pior. O `aplicar-escolhas.ts` recusava qualquer imagem acima de
 * 300 KB, e na primeira aplicação isso deitou fora **oito fotografias que estavam certas** — o
 * cabrito assado, as favas com chouriço, os peixinhos da horta — só por terem 350 ou 500 KB. Uma
 * receita ficar sem imagem porque o ficheiro é grande não é uma decisão editorial, é um acidente.
 *
 * As medidas são as que `docs/ops/imagens.md` já manda aplicar às fotografias próprias: **1200px
 * de largura no máximo, à volta de 200 KB**. O tablet tem 1920×1200 e mostra estas imagens num
 * cartão de grelha; acima disso são bytes que ninguém vê e que ficam no Git para sempre.
 */
import { correrEExtrairImagem } from './chromium.ts';

/** O que `docs/ops/imagens.md` fixa para as fotografias próprias, e vale para todas. */
export const LARGURA_MAXIMA = 1200;

/**
 * Qualidades a tentar, por ordem.
 *
 * Começa alta porque a maior parte das fotografias cabe só com a redução de largura; as seguintes
 * são para as poucas em que não chega. Abaixo de 0,55 os artefactos começam a ver-se num prato
 * com molho, e aí é preferível ficar sem imagem do que mostrar uma emplastrada.
 */
const QUALIDADES = [0.85, 0.75, 0.65, 0.55];

/**
 * Devolve a imagem dentro do limite, ou lança se nem na qualidade mais baixa lá chegar.
 *
 * Recebe e devolve JPEG. A imagem entra em base64 na própria página — é feio, mas evita ter de
 * servir ficheiros ao Chromium e mantém isto numa chamada só.
 */
export function encolher(original: Buffer, maxBytes: number): Buffer {
  let ultima: Buffer | undefined;

  for (const qualidade of QUALIDADES) {
    const encolhida = reencodar(original, qualidade);
    ultima = encolhida;
    if (encolhida.byteLength <= maxBytes) return encolhida;
  }

  const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;
  throw new Error(
    `nem a ${QUALIDADES.at(-1)} de qualidade desce de ${kb(ultima?.byteLength ?? 0)} para ${kb(maxBytes)}`,
  );
}

function reencodar(original: Buffer, qualidade: number): Buffer {
  const html = `<!doctype html><html><body><script>
const imagem = new Image();
imagem.onload = () => {
  // Só reduz; uma fotografia pequena não é esticada para 1200px, que só acrescentaria bytes.
  const escala = Math.min(1, ${LARGURA_MAXIMA} / imagem.width);
  const tela = document.createElement('canvas');
  tela.width = Math.round(imagem.width * escala);
  tela.height = Math.round(imagem.height * escala);
  tela.getContext('2d').drawImage(imagem, 0, 0, tela.width, tela.height);
  document.body.textContent = tela.toDataURL('image/jpeg', ${qualidade});
};
imagem.onerror = () => { document.body.textContent = 'erro a abrir a imagem'; };
imagem.src = 'data:image/jpeg;base64,${original.toString('base64')}';
</script></body></html>`;

  return correrEExtrairImagem(html);
}
