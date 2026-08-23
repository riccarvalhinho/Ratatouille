/*
 * Service worker.
 *
 * É isto que faz a app abrir com o Wi-Fi desligado — a cache em IndexedDB guarda as receitas, mas
 * sem service worker o próprio HTML e o JavaScript não chegariam a carregar.
 *
 * Estratégia por tipo de pedido, escolhida para nunca ficar presa numa versão antiga:
 *  - navegação  → rede primeiro, cache como rede de segurança. Com rede, o HTML é sempre o novo,
 *                 e o HTML novo aponta para os assets novos.
 *  - /assets/*  → cache primeiro. Os nomes têm hash do conteúdo, portanto nunca ficam desatualizados.
 *  - bundle.json→ rede primeiro. Os dados mudam sem o código mudar.
 *  - resto      → cache primeiro, com atualização em segundo plano.
 */

const CACHE = 'ratatouille-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['./', './index.html', './manifest.webmanifest', './icon.svg']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

/**
 * Marca uma resposta vinda da cache, para a app poder dizer ao utilizador que os dados podem estar
 * desatualizados. Sem isto a app não distingue "descarregado agora" de "isto é de há três dias".
 */
async function stampAsCached(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Ratatouille-Cache', 'hit');
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE);

  // Sem rede não vale a pena tentar: o browser serviria da sua própria cache HTTP e nós acabávamos
  // a dizer ao utilizador que os dados estavam atualizados quando podiam ser de há três dias.
  // navigator.onLine é de fiar na negativa; um "true" enganador cai no catch mais abaixo.
  if (self.navigator.onLine === false) {
    const offlineCopy = (await cache.match(request)) || (fallbackUrl && (await cache.match(fallbackUrl)));
    if (offlineCopy) return stampAsCached(offlineCopy);
  }

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = (await cache.match(request)) || (fallbackUrl && (await cache.match(fallbackUrl)));
    if (cached) return stampAsCached(cached);
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) {
    // Atualiza em segundo plano sem atrasar a resposta.
    void fetch(request)
      .then((response) => {
        if (response.ok) cache.put(request, response.clone());
      })
      .catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  if (url.pathname.endsWith('/data/bundle.json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
