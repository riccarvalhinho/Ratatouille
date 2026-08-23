# ADR 0001 — O GitHub é a source of truth de tudo

**Data:** 2026-08-23
**Estado:** Aceite

## Contexto

O planeamento do produto vivia num documento Word na Google Drive. Um documento é bom para pensar em
voz alta e mau para tudo o resto: não tem histórico legível, não se liga ao código, não se valida, e
divide-se em cópias assim que alguém o descarrega. Ao mesmo tempo, este projeto vai ser desenvolvido
em grande parte com agentes de código, que precisam de carregar o contexto do produto sem depender de
alguém colar um documento no chat.

## Decisão

Todo o produto vive no repositório Git: código, especificações, decisões, dados das receitas e
documentação de operação. O documento Word e a pasta na Drive ficam mortos.

A estrutura reflete isso:

- `docs/product/` — visão, PRD, roadmap, questões em aberto
- `docs/specs/` — uma spec por feature, com critérios de aceitação
- `docs/adr/` — decisões estruturais, uma por ficheiro, imutáveis
- `docs/design/` — design system e referências
- `docs/ops/` — como operar (setup do tablet, importação de receitas)
- `data/` — as receitas e o planeamento, em JSON versionado
- `CLAUDE.md` — contexto carregado automaticamente por sessões de Claude Code

E as regras de manutenção: uma decisão nova é um ADR, uma feature nova é uma spec, uma tarefa é uma
Issue, uma receita nova é um ficheiro.

## Alternativas consideradas

**Manter os documentos na Drive e o código no GitHub.** É o estado atual e é precisamente o problema:
duas fontes que divergem, e nenhum agente ou script consegue ler a de produto.

**Notion ou Linear para produto, GitHub para código.** Melhor que a Drive, mas continua a ser uma
segunda fonte, atrás de uma API e de uma subscrição. Contradiz o mesmo princípio de autonomia que
motivou o ADR 0002.

**Wiki do GitHub.** Fica no GitHub, mas num repositório separado que não entra nos pull requests e não
é versionado junto com o código que descreve.

## Consequências

**Fica fácil:** uma alteração ao produto e o código que a implementa entram no mesmo pull request.
Qualquer sessão de agente carrega o contexto completo sem intervenção. O histórico de como o produto
evoluiu é o histórico do Git.

**Fica difícil:** escrever em Markdown num editor de texto é menos confortável do que no Word. Não há
comentários em linha nem edição colaborativa em tempo real.

**A vigiar:** a documentação apodrece se não for atualizada nos mesmos pull requests que mudam o
comportamento. A regra prática é: se o pull request muda o que a app faz e não toca em `docs/`, alguma
coisa está errada.
