# CLAUDE.md — contexto do projeto Ratatouille

Este ficheiro é carregado automaticamente em sessões de Claude Code. Serve para que qualquer sessão
comece já a saber o que é este projeto, sem precisar de contexto externo.

## O produto

App assistente de cozinha, para uso pessoal, inspirada no software das Bimby mas **sem integração com
qualquer robot de cozinha**. Quatro funções: catálogo de receitas, planeamento semanal de refeições,
guia passo a passo durante a confeção, e lista de compras derivada do plano.

Alvo de hardware: **Amazon Fire HD 10 de 9.ª geração** (Fire OS 7 / Android 9, ecrã de 10,1" a
1920×1200) suspenso na parede da cozinha, usado só por toque, muitas vezes com as mãos sujas e a um
braço de distância. Isto não é um detalhe decorativo — condiciona tamanhos de toque, contraste, e o
facto de tudo ter de funcionar offline. Desenhar e testar as vistas a **1280×800**, que é o viewport
em pixels CSS mais provável.

Idioma de todo o conteúdo e da interface: **português de Portugal**.

## Regras não negociáveis

1. **O GitHub é a source of truth.** Não existe Drive, Notion ou documento externo. Se uma decisão não
   está no repo, não foi tomada.
2. **Sem servidor e sem base de dados gerida.** Os dados são ficheiros JSON em `data/`. Foi uma escolha
   deliberada para o projeto nunca depender de um serviço que adormeça por inatividade ou que custe
   dinheiro. Ver `docs/adr/0002-dados-json-versionados.md` antes de propor uma DB.
3. **Offline-first.** A app tem de abrir e funcionar na cozinha sem rede.
4. **Toque, não rato.** Nada de hover como única forma de descobrir uma ação; alvos de toque grandes.

## Onde está o quê

| Área | Caminho |
|---|---|
| Visão, PRD, roadmap, perguntas em aberto | `docs/product/` |
| Specs por feature (com critérios de aceitação) | `docs/specs/` |
| Decisões de arquitetura | `docs/adr/` |
| Design system e tokens | `docs/design/design-system.md` |
| Setup do tablet | `docs/ops/tablet-setup.md` |
| Metadata das receitas, em revisão | `docs/product/metadata-receitas.md` |
| Conversas em aberto, para decidir a falar | `docs/conversas/` |
| Benchmark da companion app da Bimby | `docs/design/benchmark-bimby.md` |
| Schemas dos dados (o contrato) | `data/schema/` |
| Receitas, taxonomias, planeamento, estado | `data/` |
| Scripts de dados (validar, gerar bundle, importar) | `tools/` |
| A PWA | `app/` |

## Comandos

Na raiz:

```bash
npm run validate    # valida data/**/*.json contra data/schema/*.json
npm run bundle      # gera app/public/data/bundle.json a partir de data/
npm run build       # bundle + build da app
```

Em `app/`:

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Convenções

- **Tipos do domínio derivam dos schemas JSON**, não o contrário. Alterar um campo significa alterar
  `data/schema/*.json` primeiro e depois `app/src/domain/`.
- **Uma receita = um ficheiro**, nome do ficheiro igual ao `id` (slug). **Uma semana de plano = um
  ficheiro** `data/planning/YYYY-Www.json`. Isto mantém os diffs legíveis e evita conflitos de escrita.
- **Ingredientes são referências**, não texto livre: apontam para `data/taxonomies/ingredients.json`.
  Sem isto a lista de compras nunca consegue agregar quantidades.
- **Nada fica em branco em silêncio.** Uma receita cujos campos não se conseguiram determinar leva
  `status: "rascunho"` e lista os buracos em `gaps`. Ausência de `status` significa revisto.
- Build target ES2017 por opção, não por limitação: o tablet aguentaria ES2022, mas a app deve poder
  correr noutros Androids mais antigos e o custo medido é 1,3 kB em 154 kB.
- **Nunca commitar tokens, PATs ou credenciais.** O repositório é público (ADR 0005), portanto isto
  não é higiene, é crítico. O token de escrita do GitHub vive só no `localStorage` do tablet.

## Conversas

`docs/conversas/` guarda temas que se decidem melhor a falar do que a escrever sozinho. Existem para
aproveitar tempos mortos — viagens, esperas — em que dá para pensar mas não para implementar.

Quando o utilizador disser "vamos falar de X", "continua a conversa de Y" ou "que conversas estão
abertas?", ler `docs/conversas/README.md` e o ficheiro do tema, e continuar de onde ficou.

**Estas conversas são debates, não entrevistas.** Ler o protocolo completo no README, mas o essencial:
propor respostas concretas em vez de perguntar no vazio, discordar com o argumento à frente, duas ou
três perguntas de cada vez e não um questionário, perguntar pelo concreto ("na última vez que
planeaste a semana, como começaste?") e não pelo abstrato, e dizer quando uma escolha tem custo.

**No fim de cada sessão, escrever no ficheiro** o que ficou decidido, o que ficou em aberto e por
onde continuar — e mudar as decisões fechadas para onde pertencem (spec, ADR, schema). Uma conversa
que não deixa rasto foi tempo deitado fora.

## Ao trabalhar aqui

- Antes de implementar uma feature, ler a spec correspondente em `docs/specs/`.
- Ao tomar uma decisão estrutural, escrever um ADR (`docs/adr/template.md`).
- Ao descobrir uma questão por responder, acrescentá-la a `docs/product/open-questions.md` em vez de
  assumir em silêncio.
