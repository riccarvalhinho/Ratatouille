/**
 * Onde encontrar um Chromium, e como o pôr a devolver uma imagem.
 *
 * Duas ferramentas precisam do mesmo truque — a folha de contacto e o encolhimento das fotografias
 * — e nenhuma das duas justifica uma dependência nova no `package.json`: nas sessões de Claude Code
 * o binário do Playwright já cá está e nos runners do GitHub está o Chrome do sistema.
 *
 * O caminho de saída é o `--dump-dom`: a página desenha num `<canvas>`, chama `toDataURL`, e o
 * resultado vem pela saída normal em base64.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CANDIDATOS = [
  process.env.CHROME_PATH,
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
  throw new Error('Não encontrei nenhum Chromium. Define CHROME_PATH com o caminho do binário.');
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

/**
 * Corre uma página que põe um data URL no `document.body` e devolve os bytes desse data URL.
 *
 * O `--virtual-time-budget` faz o Chromium esperar que as imagens carreguem antes de despejar o
 * DOM, sem `sleep` nenhum. O `--allow-file-access-from-files` é obrigatório: sem ele o canvas fica
 * "tainted" pelas imagens em `file://` e o `toDataURL` rebenta.
 */
export function correrEExtrairImagem(html: string): Buffer {
  const temporario = fs.mkdtempSync(path.join(os.tmpdir(), 'chromium-'));
  const ficheiro = path.join(temporario, 'pagina.html');
  fs.writeFileSync(ficheiro, html);

  try {
    const saida = execFileSync(
      encontrarChromium(),
      [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--allow-file-access-from-files',
        '--virtual-time-budget=30000',
        '--dump-dom',
        `file://${ficheiro}`,
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
