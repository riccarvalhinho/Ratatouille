# app/ — a PWA

Progressive web app em React + TypeScript, compilada com Vite e publicada no GitHub Pages.
Ver [`docs/adr/0003-pwa-em-vez-de-nativo.md`](../docs/adr/0003-pwa-em-vez-de-nativo.md).

## Correr localmente

```bash
npm ci
npm run dev          # precisa do bundle: correr `npm run bundle` na raiz primeiro
```

Ou, a partir da raiz do repositório, `npm run dev` — que gera o bundle e arranca a app de uma vez.

## Estrutura

| Pasta | O que é |
|---|---|
| `src/domain/` | Tipos do domínio, espelho de `data/schema/*.json` |
| `src/data/` | Carregamento do bundle, cache offline, índices derivados |
| `src/ui/` | Componentes partilhados |
| `src/features/` | Um ecrã por feature (a partir de M1) |
| `src/styles/` | Tokens de design e estilos globais |
| `public/` | Ícones, manifest e service worker. `public/data/` é gerado — não editar |

## Como os dados chegam aqui

`public/data/bundle.json` é **gerado** por `tools/build-bundle.ts` a partir de `data/`, e está no
`.gitignore`. Nunca editar à mão: editar `data/` e voltar a correr `npm run bundle`.

Em execução, `src/data/bundle.ts` descarrega o bundle e guarda-o em IndexedDB. Se não houver rede,
serve o que estiver guardado e a interface diz que os dados são da cache.

## Offline

O service worker (`public/sw.js`) é o que faz a app abrir sem rede. Estratégia por tipo de pedido:

- navegação → rede primeiro, cache como rede de segurança
- `/assets/*` → cache primeiro (os nomes têm hash, não ficam desatualizados)
- `bundle.json` → rede primeiro, para apanhar receitas novas

Quando serve da cache, acrescenta o cabeçalho `X-Ratatouille-Cache: hit`, que é como a app sabe
mostrar "offline · dados guardados" em vez de mentir e dizer "atualizado".

## Notas de compatibilidade

O build usa target **ES2017** de propósito. O tablet alvo é um Amazon Fire de modelo ainda não
confirmado (questão Q1) e os Fire mais antigos trazem um WebView datado. Relaxar o target quando o
modelo estiver confirmado — está registado em `docs/product/open-questions.md`.

Sem webfonts: o tablet pode estar offline, e uma fonte que não carrega é pior do que a fonte do
sistema.
