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
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Onde procurar um Chromium, por ordem.
 *
 * Nas sessões de Claude Code o binário do Playwright já cá está; nos runners do GitHub está o
 * Chrome do sistema. Nenhum dos dois precisa de ser instalado, e é por isso que esta lista existe
 * em vez de uma dependência nova no `package.json`.
 */
const CANDIDATOS = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter((caminho): caminho is string => Boolean(caminho));

export function encontrarChromium(): string {
  for (const caminho of CANDIDATOS) {
    if (fs.existsSync(caminho)) return caminho;
  }
  const doPlaywright = procurarNoPlaywright();
  if (doPlaywright) return doPlaywright;
  throw new Error(
    'Não encontrei nenhum Chromium. Define CHROME_PATH com o caminho do binário.',
  );
}

/** O Playwright põe a versão no nome da pasta, portanto não dá para a escrever à mão. */
function procurarNoPlaywright(): string | undefined {
  const raiz = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  if (!fs.existsSync(raiz)) return undefined;
  for (const entrada of fs.readdirSync(raiz)) {
    const caminho = path.join(raiz, entrada, 'chrome-linux', 'chrome');
    if (fs.existsSync(caminho)) return caminho;
  }
  return undefined;
}

export interface Celula {
  /** Caminho absoluto da miniatura já descarregada. */
  ficheiro: string;
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
const celulas = ${JSON.stringify(celulas.map((c) => ({ src: `file://${c.ficheiro}`, legenda: c.legenda ?? '' })))};
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
      ctx.fillText(String(indice + 1), x0 + 13, y0 + 26);
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

  const temporario = fs.mkdtempSync(path.join(os.tmpdir(), 'folha-'));
  const html = path.join(temporario, 'folha.html');
  fs.writeFileSync(html, pagina);

  try {
    const saida = execFileSync(
      encontrarChromium(),
      [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        // Sem isto o canvas fica "tainted" pelas imagens em file:// e o toDataURL rebenta.
        '--allow-file-access-from-files',
        // Faz o Chromium esperar que as imagens carreguem antes de despejar o DOM, sem sleep.
        '--virtual-time-budget=30000',
        '--dump-dom',
        `file://${html}`,
      ],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
    );

    const marca = 'data:image/jpeg;base64,';
    const inicio = saida.indexOf(marca);
    if (inicio === -1) throw new Error('o Chromium não devolveu nenhuma imagem');
    const base64 = saida.slice(inicio + marca.length).match(/^[A-Za-z0-9+/=]+/)?.[0];
    if (!base64) throw new Error('a imagem devolvida veio truncada');
    return Buffer.from(base64, 'base64');
  } finally {
    fs.rmSync(temporario, { recursive: true, force: true });
  }
}
