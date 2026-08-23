# ADR 0002 — Dados em ficheiros JSON versionados, sem base de dados gerida

**Data:** 2026-08-23
**Estado:** Aceite

## Contexto

A app precisa de guardar receitas, planeamento semanal, favoritos e histórico. A pergunta original do
planeamento era: "vamos precisar de base de dados?".

Há um requisito explícito que condiciona tudo: **o projeto não pode depender de um serviço que adormeça
por inatividade**. Numa experiência anterior, uma base de dados em free tier desligava-se
automaticamente ao fim de alguns dias sem escritas. Isto é uma app doméstica que pode passar duas
semanas sem ser tocada, e tem de abrir na mesma quando alguém entra na cozinha.

Restrições adicionais: um único utilizador, volume pequeno (algumas centenas de receitas no máximo
realista), leitura muito mais frequente do que escrita, e necessidade de funcionar sem rede.

## Decisão

Os dados são ficheiros JSON dentro do repositório, versionados em Git. Não há base de dados.

- Uma receita = um ficheiro `data/recipes/<slug>.json`
- Uma semana de plano = um ficheiro `data/planning/<AAAA-Www>.json`
- Favoritos e histórico = ficheiros únicos em `data/state/`
- Taxonomias (labels, ingredientes, equipamento) = ficheiros em `data/taxonomies/`
- Os schemas em `data/schema/` são o contrato, validado em CI

Um passo de build agrega tudo num `bundle.json` que a app descarrega e guarda em IndexedDB.

## Alternativas consideradas

**Base de dados gerida (Supabase, Neon, Turso).** SQL a sério, queries ricas, sincronização
instantânea entre dispositivos. Rejeitada: os free tiers pausam por inatividade, exatamente o problema
que se quer evitar. Manter viva exigiria um cron de keep-alive — trabalho recorrente para resolver um
problema autoinfligido — ou pagar uma subscrição para uma app de uma casa.

**SQLite só no tablet, com exportações periódicas.** Rápido e verdadeiramente offline, mas faz do
tablet o único sítio onde os dados existem de verdade. Um tablet de cozinha que cai no chão leva as
receitas todas com ele.

**SQLite no repositório, sincronizado como ficheiro.** Junta o pior dos dois: é binário, portanto os
diffs são inúteis e os conflitos irresolúveis.

## Consequências

**Fica fácil:** custo zero e nada que adormeça. Histórico completo de alterações de graça — dá para ver
quando uma receita mudou e voltar atrás. Os dados são legíveis por humanos e sobrevivem à app: se o
código for todo deitado fora amanhã, as receitas continuam a ser ficheiros que se leem. Editar uma
receita a partir de um computador é abrir um ficheiro. Não há migrações de schema para correr, só
validação.

**Fica difícil:** não há queries. Filtrar e ordenar acontece em memória no cliente, o que é aceitável
para centenas de receitas e deixaria de ser para dezenas de milhares. As escritas são commits, com
latência de segundos em vez de milissegundos — daí o modelo otimista descrito no ADR 0004. Duas
pessoas a escrever ao mesmo tempo podem colidir (questão Q7).

**A vigiar:** o tamanho do repositório, por causa das imagens em `media/`. E o momento em que filtrar
em memória deixe de ser instantâneo no tablet — se o catálogo crescer muito, passa a ser preciso um
índice pré-calculado no bundle.

**Saída de emergência:** se um dia isto deixar de chegar, os JSON importam-se para SQL sem perda. Os
schemas já descrevem as tabelas.
