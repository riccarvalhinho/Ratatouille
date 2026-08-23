# Conversa 2 — Catálogo de receitas

**Estado:** Por começar
**Conduz:** Claude — parto de propostas concretas para contrariares
**Destino das decisões:** `docs/specs/001-catalogo-receitas.md`, `docs/design/design-system.md`
**Depende de:** conversa 1 (metadata), porque o cartão só pode mostrar o que existe

## Porque existe

É o ecrã que responde a "o que é que eu posso cozinhar hoje?". A spec 001 já descreve grelha com
filtros, favoritos e histórico — mas nunca foi testada contra como as decisões acontecem mesmo.

## O que já está fechado

- Grelha, quatro cartões por linha a 1280×800
- Navegação vertical à esquerda, só ícones (do benchmark do Cookidoo)
- Cartão mostra thumbnail, nome, duração, dificuldade, até 3 labels, e antecedência quando existe
- Nada depende de hover; alvos de toque com 56px no mínimo

## As minhas perguntas de arranque

1. **Quantas receitas achas que isto terá daqui a seis meses?** Não é curiosidade — muda tudo. Com
   30, a grelha inteira cabe em dois ecrãs e os filtros quase não são precisos. Com 300, sem
   filtros e pesquisa não se encontra nada. Desenhar para o número errado dá um ecrã que não serve.

2. **Qual é a primeira coisa que te faz descartar uma receita?** Aposto que é o tempo — "hoje não
   tenho hora e meia". Se for isso, o tempo devia ser o filtro mais acessível de todos, não um de
   três iguais. Mas pode ser "não tenho os ingredientes", e aí é outro ecrã completamente diferente.

3. **Proponho uma ordenação por omissão que não está na spec: há mais tempo sem fazer.** A visão do
   produto diz que um dos problemas é "repetir sempre os mesmos pratos". Ordenar por alfabeto não
   ajuda nisso; pôr à frente o que não se faz há três meses, sim. Contra-argumento: pode ser
   desconcertante não encontrar as receitas sempre no mesmo sítio.

4. **Favoritos e histórico são mesmo duas coisas?** Na prática, o que fazes muitas vezes acaba por
   ser o que gostas. Se calhar são duas vistas do mesmo, e uma delas está a mais.

5. **Precisas de pesquisa por texto?** A spec deixou-a de fora de propósito. Se souberes o nome, já
   sabes o que queres cozinhar — e aí talvez o problema não seja encontrar, seja decidir.

6. **O que acontece quando os filtros não devolvem nada?** É o momento mais frustrante do ecrã, e
   também a maior oportunidade: "não há nada em 30 minutos, mas há isto em 40".

## Registo da conversa

_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|
