# Conversa 7 — Vocabulário das labels

**Estado:** Por começar
**Conduz:** Claude
**Destino das decisões:** `data/taxonomies/labels.json`
**Vem de:** conversa 1, que fechou tudo o resto da metadata

## Porque existe

A metadata ficou fechada, menos isto. Sabemos que as labels se dividem em duas famílias — as que se
**derivam** dos dados e as que têm de ser **declaradas** — e sabemos que uma das categorias
declaradas é o **tipo ou origem de cozinha**, com o importador a perguntar sempre e a aceitar "não
tem" como resposta válida.

Falta o vocabulário: que categorias existem, e que valores cada uma tem.

## O que já está fechado

- Duas famílias: derivadas e declaradas
- Uma categoria declarada é o tipo de cozinha (italiano, indiano, …)
- A etiqueta "saudável" não existe — foi substituída pelo campo `weight`
- Não há etiqueta de dificuldade — o campo foi cortado
- O objetivo é filtrar e agrupar, portanto cada valor tem de ganhar o seu lugar

## O que está hoje em `labels.json`

24 labels em quatro grupos: tipo de prato, proteína, regime e ocasião. Foram escritas em M0 por
dedução, sem discussão — servem de ponto de partida para contrariar, não de base a preservar.

## As minhas perguntas de arranque

1. **Quantos filtros é que uma pessoa usa mesmo antes de desistir?** Aposto que dois. Se for isso, ter
   seis categorias de labels é construir um sistema de arrumação que ninguém percorre — e a pergunta
   passa a ser quais são as duas ou três que ficam à frente.

2. **A proteína ainda precisa de ser uma família própria?** Carne, peixe e leguminosas derivam-se dos
   ingredientes. Se são derivadas, deixam de ser labels declaradas e passam a ser calculadas — e a
   taxonomia encolhe.

3. **O tipo de cozinha: lista fechada ou aberta?** Fechada é consistente e obriga a decidir onde cabe
   uma receita que é meio grega meio turca. Aberta cresce sozinha e ao fim de um ano tem "italiano",
   "italiana" e "cozinha italiana".

4. **"Para grupos" é ocasião ou é rendimento?** Uma receita para grupos é uma receita que dá para
   muita gente, e isso já está no rendimento. Ou queres dizer outra coisa — algo que se serve ao meio
   da mesa, para partilhar?

## Registo da conversa

_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|
