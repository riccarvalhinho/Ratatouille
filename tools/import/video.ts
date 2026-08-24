/**
 * Extrai o que se consegue de um vídeo: metadados, descrição e **transcrição**.
 *
 * A transcrição é a peça que faltava. Um vídeo de TikTok ou de YouTube não tem a receita em texto,
 * mas tem-na dita em voz alta — e as legendas automáticas dessas plataformas são suficientemente
 * boas para se perceber quantidades e passos. A descrição também costuma trazer a receita escrita.
 *
 * Usa o yt-dlp, que é a ferramenta madura para isto e cobre YouTube, Shorts, TikTok e algum
 * Instagram público. **Nunca descarrega o vídeo** — só metadados e ficheiros de legendas.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface VideoSource {
  title?: string;
  uploader?: string;
  description?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  /** Texto das legendas, já limpo de marcas de tempo e de repetições. */
  transcript?: string;
  transcriptLanguage?: string;
  notes: string[];
}

export function hasYtDlp(): boolean {
  try {
    execFileSync('yt-dlp', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** As legendas vêm em VTT, com marcas de tempo e linhas repetidas por causa do efeito de rolagem. */
export function cleanVtt(vtt: string): string {
  const lines = vtt
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith('WEBVTT') &&
        !l.startsWith('Kind:') &&
        !l.startsWith('Language:') &&
        !/^\d+$/.test(l) &&
        !l.includes('-->'),
    )
    .map((l) => l.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  // As legendas automáticas repetem a linha anterior a cada bloco. Tirar duplicados consecutivos.
  const deduped: string[] = [];
  for (const line of lines) {
    if (deduped[deduped.length - 1] !== line) deduped.push(line);
  }
  return deduped.join(' ').replace(/\s+/g, ' ').trim();
}

export function fetchVideo(url: string): VideoSource {
  const result: VideoSource = { notes: [] };

  if (!hasYtDlp()) {
    result.notes.push('yt-dlp não está instalado. Sem ele não há transcrição nem descrição do vídeo.');
    return result;
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ratatouille-video-'));

  try {
    const json = execFileSync(
      'yt-dlp',
      [
        '--dump-json',
        '--no-warnings',
        '--skip-download',
        // Português primeiro, inglês e espanhol como rede de segurança.
        '--write-auto-subs',
        '--write-subs',
        '--sub-langs',
        'pt.*,en.*,es.*',
        '--sub-format',
        'vtt',
        '--paths',
        dir,
        '--output',
        'legendas',
        url,
      ],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] },
    );

    const info = JSON.parse(json.split('\n')[0] ?? '{}') as Record<string, unknown>;
    result.title = typeof info.title === 'string' ? info.title : undefined;
    result.uploader = typeof info.uploader === 'string' ? info.uploader : undefined;
    result.description = typeof info.description === 'string' ? info.description : undefined;
    result.thumbnailUrl = typeof info.thumbnail === 'string' ? info.thumbnail : undefined;
    result.durationSeconds = typeof info.duration === 'number' ? info.duration : undefined;

    // Fica a primeira legenda encontrada, na ordem de preferência de línguas pedida.
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.vtt'));
    const preferred =
      files.find((f) => f.includes('.pt')) ?? files.find((f) => f.includes('.en')) ?? files[0];

    if (preferred) {
      result.transcript = cleanVtt(fs.readFileSync(path.join(dir, preferred), 'utf8'));
      result.transcriptLanguage = /\.([a-z]{2}(?:-[A-Za-z]+)?)\.vtt$/.exec(preferred)?.[1];
      result.notes.push(
        `Transcrição obtida em ${result.transcriptLanguage ?? 'língua desconhecida'}. Vem de legendas automáticas, portanto quantidades podem estar mal ouvidas — confirmar.`,
      );
    } else {
      result.notes.push('O vídeo não tem legendas disponíveis. A receita terá de vir da descrição ou de ser ditada.');
    }
  } catch (error) {
    const message = (error as { stderr?: string; message: string }).stderr ?? (error as Error).message;
    result.notes.push(`O yt-dlp falhou: ${message.split('\n').slice(-3).join(' ').slice(0, 300)}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  return result;
}
