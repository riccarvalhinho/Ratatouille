/**
 * Compõe várias miniaturas numa só imagem numerada — uma "folha de contacto".
 *
 * Existe por causa do custo de olhar. Rever uma imagem de cada vez custa uma leitura por imagem, e
 * com uma dúzia de candidatas por receita isso são mais de mil leituras. Numa folha, doze
 * candidatas custam uma leitura só, e passa a ser possível **escolher** em vez de aceitar a
 * primeira — que é o erro que esta pasta já cometeu uma vez (ver `docs/ops/imagens.md`).
 *
 * A composição é feita pelo Chromium em modo headless, sem instalar nada: a página desenha as
 * miniaturas num `<canvas>`, chama `toDataURL('image/jpeg')` e o `--dump-dom` devolve o resultado
 * pela saída normal. JPEG e não PNG porque uma folha destas em PNG pesa dez vezes mais, e isto
 * vive num ramo de trabalho que ninguém quer ver crescer.
 */
import { correrEExtrairImagem } from './chromium.ts';

export interface Celula {
  /** Caminho absoluto da miniatura já descarregada. */
  ficheiro: string;
  /**
   * O número desenhado no canto, e **tem de ser o do manifesto**.
   *
   * Numerar as células por ordem parecia inofensivo e não é: uma miniatura que não descarregue sai
   * das duas listas, e a partir daí a folha diz 6 onde o manifesto diz 7. Quem escolhe está a ler
   * a folha, portanto é a folha que tem de falar a língua do manifesto. Aconteceu em 30 das 101
   * receitas da primeira colheita.
   */
  numero?: number;
  /** Uma linha por baixo do número: serve para saber de que banco veio sem abrir o manifesto. */
  legenda?: string;
}

interface Opcoes {
  colunas?: number;
  larguraCelula?: number;
  alturaCelula?: number;
  qualidade?: number;
}

/**
 * Desenha as células e devolve o JPEG.
 *
 * As imagens entram em `object-fit: cover` — recortadas, não deformadas —, porque o que se julga
 * numa folha destas é "é este o prato", e um prato esticado responde pior a essa pergunta do que
 * um prato cortado nas bordas.
 */
export function comporFolha(celulas: Celula[], opcoes: Opcoes = {}): Buffer {
  const colunas = opcoes.colunas ?? 4;
  const largura = opcoes.larguraCelula ?? 320;
  const altura = opcoes.alturaCelula ?? 240;
  const qualidade = opcoes.qualidade ?? 0.72;

  const pagina = `<!doctype html><html><body><script>
const celulas = ${JSON.stringify(
    celulas.map((c, i) => ({ src: `file://${c.ficheiro}`, numero: c.numero ?? i + 1, legenda: c.legenda ?? '' })),
  )};
const COLS = ${colunas}, W = ${largura}, H = ${altura};
const tela = document.createElement('canvas');
tela.width = W * COLS;
tela.height = H * Math.max(1, Math.ceil(celulas.length / COLS));
const ctx = tela.getContext('2d');
ctx.fillStyle = '#111';
ctx.fillRect(0, 0, tela.width, tela.height);

function desenhar(celula, indice) {
  return new Promise((resolve) => {
    const col = indice % COLS, linha = Math.floor(indice / COLS);
    const x0 = col * W, y0 = linha * H;
    const etiquetar = () => {
      ctx.fillStyle = 'rgba(0,0,0,.78)';
      ctx.fillRect(x0, y0, 46, 36);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(String(celula.numero), x0 + 13, y0 + 26);
      if (celula.legenda) {
        ctx.fillStyle = 'rgba(0,0,0,.72)';
        ctx.fillRect(x0, y0 + H - 22, W, 22);
        ctx.fillStyle = '#eee';
        ctx.font = '13px sans-serif';
        ctx.fillText(celula.legenda.slice(0, 54), x0 + 8, y0 + H - 7);
      }
      resolve();
    };
    const imagem = new Image();
    imagem.onload = () => {
      // cover: escala pelo lado que falta e recorta o resto, centrado.
      const escala = Math.max(W / imagem.width, H / imagem.height);
      const w = imagem.width * escala, h = imagem.height * escala;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, W, H);
      ctx.clip();
      ctx.drawImage(imagem, x0 + (W - w) / 2, y0 + (H - h) / 2, w, h);
      ctx.restore();
      etiquetar();
    };
    // Uma miniatura que não abra não pode deixar a folha por compor: fica a célula vazia numerada.
    imagem.onerror = etiquetar;
    imagem.src = celula.src;
  });
}

Promise.all(celulas.map(desenhar)).then(() => {
  document.body.textContent = tela.toDataURL('image/jpeg', ${qualidade});
});
</script></body></html>`;

  return correrEExtrairImagem(pagina);
}
