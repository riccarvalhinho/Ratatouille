/**
 * Definições: o token do GitHub e o estado da sincronização.
 *
 * É o único ecrã onde se escreve texto — e de propósito é raro: escreve-se uma vez, quando se monta
 * o tablet na parede. Ver docs/adr/0004-escrita-via-github-api.md e docs/ops/tablet-setup.md.
 */
import { useState } from 'react';
import { checkToken, readToken, repo, writeToken } from '../../data/github.ts';
import type { Outbox } from '../../data/outbox-store.ts';
import styles from './DefinicoesScreen.module.css';

interface DefinicoesScreenProps {
  outbox: Outbox;
}

type Check = { state: 'idle' } | { state: 'checking' } | { state: 'ok' } | { state: 'erro'; reason: string };

/** "há 3 minutos", para o "à espera desde quando" ser legível sem fazer contas. */
function since(timestamp: number, now: number): string {
  const minutes = Math.floor((now - timestamp) / 60_000);
  if (minutes < 1) return 'há menos de um minuto';
  if (minutes === 1) return 'há 1 minuto';
  if (minutes < 60) return `há ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? 'há 1 hora' : `há ${hours} horas`;
}

export function DefinicoesScreen({ outbox }: DefinicoesScreenProps) {
  const [token, setToken] = useState(() => readToken() ?? '');
  const [saved, setSaved] = useState(() => readToken() !== undefined);
  const [check, setCheck] = useState<Check>({ state: 'idle' });

  const save = async () => {
    const trimmed = token.trim();
    if (!trimmed) return;

    setCheck({ state: 'checking' });
    const result = await checkToken(trimmed);

    if (!result.ok) {
      setCheck({ state: 'erro', reason: result.reason });
      return;
    }

    // Só guarda depois de confirmar que serve. Guardar um token inválido dava uma app que parece
    // configurada e falha em silêncio na primeira escrita.
    writeToken(trimmed);
    setSaved(true);
    setCheck({ state: 'ok' });
    outbox.syncNow();
  };

  const forget = () => {
    writeToken(undefined);
    setToken('');
    setSaved(false);
    setCheck({ state: 'idle' });
  };

  const { pending, lastError, oldestQueuedAt } = outbox.status;

  return (
    <div className={styles.screen}>
      <h2 className={styles.title}>Definições</h2>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Sincronização</h3>

        <p className={styles.status}>
          {pending === 0 ? (
            <span className={styles.ok}>Tudo enviado.</span>
          ) : (
            <>
              <strong>
                {pending === 1 ? '1 alteração' : `${pending} alterações`} por enviar
              </strong>
              {oldestQueuedAt !== undefined && <> — a mais antiga {since(oldestQueuedAt, Date.now())}.</>}
            </>
          )}
        </p>

        {!outbox.hasToken && (
          <p className={styles.warning}>
            Sem token não há sincronização. O que planeares fica só neste tablet.
          </p>
        )}

        {lastError && <p className={styles.warning}>Última falha: {lastError}</p>}

        <button
          type="button"
          className={styles.secondary}
          onClick={outbox.syncNow}
          disabled={outbox.syncing || pending === 0}
        >
          {outbox.syncing ? 'A enviar…' : 'Tentar agora'}
        </button>
      </section>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Token do GitHub</h3>

        <p className={styles.help}>
          Um <strong>fine-grained personal access token</strong> com acesso só a{' '}
          <code>
            {repo.owner}/{repo.name}
          </code>{' '}
          e permissão <code>Contents: read and write</code>. Fica guardado só neste tablet, em{' '}
          <code>localStorage</code>, e nunca vai para o repositório.
        </p>

        <label className={styles.label} htmlFor="token">
          Token
        </label>
        <input
          id="token"
          className={styles.input}
          type="password"
          value={token}
          onChange={(event) => {
            setToken(event.target.value);
            setCheck({ state: 'idle' });
          }}
          placeholder="github_pat_…"
          autoComplete="off"
          spellCheck={false}
        />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => void save()}
            disabled={check.state === 'checking' || token.trim() === ''}
          >
            {check.state === 'checking' ? 'A confirmar…' : 'Guardar e confirmar'}
          </button>

          {saved && (
            <button type="button" className={styles.danger} onClick={forget}>
              Esquecer
            </button>
          )}
        </div>

        {check.state === 'ok' && <p className={styles.ok}>Token válido e com permissão de escrita.</p>}
        {check.state === 'erro' && <p className={styles.warning}>{check.reason}</p>}

        <p className={styles.help}>
          Quem tiver este tablet na mão consegue tirar o token daqui. É o risco assumido na ADR 0004:
          tablet doméstico, repositório pessoal, token limitado a um repositório. Vale a pena
          definir-lhe validade e revogá-lo se o tablet sair de casa.
        </p>
      </section>
    </div>
  );
}
