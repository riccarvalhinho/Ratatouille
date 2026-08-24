# app/ — a PWA

Progressive web app em React + TypeScript, compilada com Vite e publicada no GitHub Pages.
Ver [`docs/adr/0003-pwa-em-vez-de-nativo.md`](../docs/adr/0003-pwa-em-vez-de-nativo.md).

## A camada de domínio

`src/domain/` não sabe que existe uma interface. É lógica pura, testada, e é onde está a parte
difícil do produto:

| Ficheiro | O que resolve |
|---|---|
| `units.ts` | Somar "2 cebolas" com "200 g de cebola" e devolver "4 cebolas" |
| `shopping-list.ts` | Agregar os ingredientes da semana por zona de supermercado |
| `scaling.ts` | Escalar doses por múltiplos simples, marcando o que fica esquisito |
| `filters.ts` | Filtrar o catálogo: dentro do mesmo tipo soma, entre tipos restringe |
| `planning.ts` | Semanas ISO, a grelha da semana, e "há 3 semanas" em vez de uma data |

Foi construída antes da interface de propósito: não depende de decisões visuais, e é onde os erros
silenciosos vivem. Um total de compras errado não dá erro nenhum — dá um jantar sem cebolas.

```bash
npm test          # 58 testes
npm run test:watch
```

O validador de dados (`tools/validate-data.ts`) importa `planning.ts` para as semanas ISO, para não
haver duas implementações da mesma regra.

## Correr localmente

```bash
npm ci
npm run dev          # precisa do bundle: correr `npm run bundle` na raiz primeiro
```

Ou, a partir da raiz do repositório, `npm run dev` — que gera o bundle e arranca a app de uma vez.

## Estrutura

| Pasta | O que é |
|---|---|
| `src/domain/` | Tipos e **lógica pura**: conversão de unidades, lista de compras, escalar doses, filtros, semanas ISO. Sem React, sem DOM, testado |
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

O build usa target **ES2017** de propósito. O tablet é um Fire HD 10 de 9.ª geração (Fire OS 7,
Chromium moderno) e aguentaria ES2022 — mas a app deve poder correr noutros Androids mais antigos, e
medimos que subir o target só poupa 1,3 kB em 154 kB. Compatibilidade de graça.

Desenhar e testar a **1280×800**, o viewport em pixels CSS mais provável do tablet.

Sem webfonts: o tablet pode estar offline, e uma fonte que não carrega é pior do que a fonte do
sistema.
