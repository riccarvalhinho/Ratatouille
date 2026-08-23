/**
 * Registo do service worker.
 *
 * Só em produção: em desenvolvimento um service worker a servir da cache torna cada alteração
 * confusa de testar.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error: unknown) => {
      // Sem service worker a app continua a funcionar com rede; só perde o offline.
      console.warn('Não foi possível registar o service worker:', error);
    });
  });
}
