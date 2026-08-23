# Ratatouille

Assistente de cozinha para tablet. Base de dados de receitas, planeamento semanal de refeições,
guia passo a passo durante a confeção e lista de compras gerada automaticamente.

Inspirado no software integrado nas Bimby, mas sem robot: é uma app de consulta e organização,
pensada para correr num tablet suspenso na parede da cozinha e ser usada 100% por toque.

**Estado:** M0 — fundação. A app corre e lê receitas, as features do produto estão por construir.
Ver [roadmap](docs/product/roadmap.md).

---

## Este repositório é a source of truth

Não há Drive, não há documento Word, não há Notion. **Tudo o que define o produto vive aqui**, em Git:

| O quê | Onde |
|---|---|
| Visão e âmbito | [`docs/product/vision.md`](docs/product/vision.md) |
| Requisitos do produto | [`docs/product/prd.md`](docs/product/prd.md) |
| Milestones | [`docs/product/roadmap.md`](docs/product/roadmap.md) |
| O que falta decidir | [`docs/product/open-questions.md`](docs/product/open-questions.md) |
| Specs por feature | [`docs/specs/`](docs/specs/) |
| Decisões de arquitetura | [`docs/adr/`](docs/adr/) |
| Design system | [`docs/design/design-system.md`](docs/design/design-system.md) |
| Receitas e planeamento | [`data/`](data/) — ficheiros JSON, não uma base de dados |
| A aplicação | [`app/`](app/) |

Regras de manutenção:

- Uma **decisão** estrutural nova → um ADR em `docs/adr/`.
- Uma **feature** nova → uma spec em `docs/specs/` antes de código.
- Uma **tarefa** → uma GitHub Issue.
- Uma **receita** nova → um ficheiro em `data/recipes/`.

Se uma informação sobre este produto só existe na cabeça de alguém ou num chat, ainda não existe.

---

## Arranque rápido

```bash
npm ci            # ferramentas de dados (raiz)
npm run validate  # valida todos os JSON de data/ contra os schemas

cd app
npm ci
npm run dev       # http://localhost:5173
```

Build de produção (gera o bundle de dados e compila a PWA):

```bash
npm run build     # a partir da raiz
```

---

## Como funciona, em três linhas

1. As receitas são ficheiros JSON em `data/recipes/`, um por receita, versionados no Git.
2. O CI compila-os num único `bundle.json` e publica a PWA no GitHub Pages.
3. O tablet descarrega o bundle, guarda-o em IndexedDB e funciona offline; alterações feitas na app
   voltam ao repositório como commits através da API do GitHub.

Sem servidor, sem base de dados gerida, sem custo, sem nada que adormeça por inatividade.
Detalhe em [`docs/adr/0001-github-como-source-of-truth.md`](docs/adr/0001-github-como-source-of-truth.md).
