/**
 * Mantém o ecrã ligado enquanto se cozinha.
 *
 * O Fire OS 7 tem a Wake Lock API, mas ela **perde-se sozinha** quando o separador vai para segundo
 * plano — o que acontece a cada troca de app. Por isso é reposta ao voltar, senão o ecrã apaga-se a
 * meio da receita e é preciso mexer no tablet com as mãos sujas, que é exatamente o que se evita.
 */
import { useEffect } from 'react';

export function useKeepAwake(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    // Sem a API, o ecrã apaga conforme as definições do tablet. Não é erro, é degradação.
    if (!('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | undefined;
    let cancelled = false;

    const acquire = async () => {
      try {
        const next = await navigator.wakeLock.request('screen');
        if (cancelled) void next.release();
        else sentinel = next;
      } catch {
        // Recusado pelo browser, tipicamente por a página não estar visível. Tenta outra vez à volta.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [active]);
}
