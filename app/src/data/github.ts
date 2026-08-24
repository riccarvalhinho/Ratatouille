/**
 * Escrita de ficheiros no repositório, pela Contents API do GitHub.
 *
 * Ver docs/adr/0004-escrita-via-github-api.md. Só escreve ficheiros — ler continua a ser o bundle
 * gerado no CI, que é um pedido em vez de duzentos.
 *
 * ## O token
 *
 * Um fine-grained personal access token, limitado a este repositório e a `Contents: read and write`,
 * guardado em `localStorage` do tablet. **Nunca é commitado e nunca sai daqui para lado nenhum além
 * de api.github.com.** O repositório é público (ADR 0005), portanto isto não é higiene, é crítico.
 *
 * Quem tiver o tablet na mão consegue extrair o token. É o risco assumido na ADR: tablet doméstico,
 * repositório pessoal, token limitado a um repositório. Mitiga-se com validade curta e revogação.
 */

const TOKEN_KEY = 'ratatouille.github-token';

/**
 * Dono, repositório e ramo.
 *
 * Vêm de variáveis de build para o mesmo código servir uma bifurcação sem editar ficheiros, mas os
 * valores por omissão são os deste projeto — não há configuração obrigatória para pôr a funcionar.
 */
export const repo = {
  owner: (import.meta.env.VITE_REPO_OWNER as string | undefined) ?? 'riccarvalhinho',
  name: (import.meta.env.VITE_REPO_NAME as string | undefined) ?? 'Ratatouille',
  branch: (import.meta.env.VITE_REPO_BRANCH as string | undefined) ?? 'main',
} as const;

export function readToken(): string | undefined {
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? undefined;
  } catch {
    // Modo privado ou armazenamento bloqueado: sem token, a app funciona à mesma, só não sincroniza.
    return undefined;
  }
}

export function writeToken(token: string | undefined): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn('Não foi possível guardar o token:', error);
  }
}

/**
 * Base64 de texto UTF-8, que é o que a Contents API quer.
 *
 * `btoa` só aceita bytes, e um "ç" ou um "ã" partem-no. O `TextEncoder` resolve isso; o ciclo por
 * blocos existe porque `String.fromCharCode(...bytes)` rebenta a pilha num ficheiro grande, e o
 * bundle de receitas há de lá chegar.
 */
export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

function apiUrl(path: string): string {
  // Os segmentos do caminho vão codificados, mas as barras têm de sobreviver.
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${encoded}`;
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/** Mensagem em português para os erros que se podem mesmo resolver. */
function describe(status: number, fallback: string): string {
  if (status === 401) return 'O token não é válido ou expirou.';
  if (status === 403) return 'O token não tem permissão de escrita neste repositório.';
  if (status === 404) return 'Repositório ou ramo não encontrado. Confirma o token e o repositório.';
  if (status === 409 || status === 422) return 'O ficheiro mudou no GitHub entretanto.';
  if (status >= 500) return 'O GitHub está com problemas. Tenta mais tarde.';
  return fallback;
}

/** O `sha` da versão atual de um ficheiro, ou `undefined` se ainda não existir. */
async function currentSha(path: string, token: string): Promise<string | undefined> {
  const response = await fetch(`${apiUrl(path)}?ref=${encodeURIComponent(repo.branch)}`, {
    headers: headers(token),
    cache: 'no-store',
  });

  // Um ficheiro que ainda não existe não é erro: é a primeira semana a ser planeada.
  if (response.status === 404) return undefined;
  if (!response.ok) throw new GitHubError(describe(response.status, 'Não foi possível ler o ficheiro.'), response.status);

  const body = (await response.json()) as { sha?: string };
  return body.sha;
}

async function put(
  file: { path: string; content: string; message: string },
  token: string,
  sha: string | undefined,
): Promise<void> {
  const response = await fetch(apiUrl(file.path), {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: file.message,
      content: toBase64(file.content),
      branch: repo.branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    throw new GitHubError(describe(response.status, `O GitHub respondeu ${response.status}.`), response.status);
  }
}

/**
 * Escreve um ficheiro, criando-o se não existir.
 *
 * Se o `sha` estiver desatualizado — o ficheiro mudou no GitHub desde que o lemos — relê e escreve
 * outra vez. **A última escrita ganha.** É o comportamento certo para um utilizador só (Q7); com
 * duas pessoas a planear ao mesmo tempo, isto tem de mudar.
 *
 * Uma só repetição, de propósito: se falhar duas vezes seguidas por conflito, alguma coisa está a
 * escrever em ciclo e insistir aqui só esconde o problema. A entrada volta para a fila e o recuo
 * exponencial trata do resto.
 */
export async function writeFile(
  file: { path: string; content: string; message: string },
  token: string,
): Promise<void> {
  try {
    await put(file, token, await currentSha(file.path, token));
  } catch (error) {
    const conflict = error instanceof GitHubError && (error.status === 409 || error.status === 422);
    if (!conflict) throw error;
    await put(file, token, await currentSha(file.path, token));
  }
}

/** Confirma que o token serve, para as Definições poderem dizer alguma coisa em vez de nada. */
export async function checkToken(token: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}`, {
      headers: headers(token),
      cache: 'no-store',
    });

    if (!response.ok) return { ok: false, reason: describe(response.status, `HTTP ${response.status}`) };

    const body = (await response.json()) as { permissions?: { push?: boolean } };
    return body.permissions?.push
      ? { ok: true }
      : { ok: false, reason: 'O token lê o repositório mas não tem permissão de escrita.' };
  } catch {
    return { ok: false, reason: 'Não foi possível falar com o GitHub. Há rede?' };
  }
}
