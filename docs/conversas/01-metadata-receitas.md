# Conversa 1 — Metadata das receitas

**Estado:** Por começar
**Conduz:** Ricardo — há uma visão da estrutura para explicar
**Destino das decisões:** `data/schema/recipe.schema.json`, `docs/product/metadata-receitas.md`
**Prioridade:** Primeiro. A metadata determina o que a interface pode mostrar; desenhar ecrãs sobre
um formato que ainda vai mudar é desenhar duas vezes. E o importador (spec 007) não deve começar a
produzir ficheiros antes disto fechar.

## Porque existe

O formato foi definido em M0 a partir do documento de planeamento, mas nunca foi discutido. Há uma
visão do que é útil e de como isto se estrutura que ainda não está no repo.

E há uma janela: com cinco receitas, mudar o formato é editar cinco ficheiros. Com duzentas, é uma
migração.

## O que já está fechado

Não se rediscute sem motivo novo:

- Ingredientes são **referências** a `data/taxonomies/ingredients.json`, nunca texto livre. É o que
  torna a lista de compras possível (ADR 0002).
- Passos são bullets curtos, uma ação por passo. O benchmark do Cookidoo confirmou pela negativa.
- `status` e `gaps` existem para o importador nunca deixar buracos em silêncio.
- Nutrição traz sempre `method`, para distinguir calculado de estimado.

## O que está em cima da mesa

As cinco propostas de `docs/product/metadata-receitas.md`, com a minha recomendação:

| | Proposta | Recomendo |
|---|---|---|
| P1 | Grupos de ingredientes e passos ("para o béchamel") | Sim |
| P2 | `prepAhead` como lista, não objeto único | Sim |
| P3 | Rendimento que não são pessoas ("12 bolinhos") | Sim — o Cookidoo mostra "16 unidades" |
| P4 | Conservação e sobras (congela? dura quanto?) | Sim, mas é a que mais merece discussão |
| P5 | Temperatura de forno estruturada | Não — o texto do passo já resolve |
| P6 | Alergénios derivados do ingrediente canónico | Sim, mas mais tarde |

## As minhas perguntas de arranque

1. **Começa pelo que te falta.** Quando pensas numa receita tua e imaginas metê-la aqui, que campo é
   que já sabes que vais querer e não existe? Vamos por aí antes de eu defender as minhas propostas.

2. **"Dificuldade" é o campo mais vago que temos.** Fácil/médio/difícil — mas difícil porquê? Porque
   exige técnica? Porque há três coisas a acontecer ao mesmo tempo? Porque falha facilmente? Aposto
   que o que queres mesmo saber é "posso fazer isto a meio da semana, cansado?", que é outra coisa.

3. **A P4 é a única que abre funcionalidade nova.** Se a receita soubesse que congela bem e dura três
   dias, o planeamento podia dizer "faz o dobro na segunda e come outra vez na quinta". Isso é útil,
   ou é uma complicação que na prática nunca vais preencher?

4. **Ingredientes canónicos vão dar trabalho.** Cada receita nova pode obrigar a acrescentar
   ingredientes à taxonomia, com zona de supermercado e peso por unidade. É o preço da lista de
   compras. Quanto é que estás disposto a pagar? Há um caminho mais preguiçoso: aceitar texto livre
   e mapear só quando a lista de compras precisar.

5. **Uma receita tua tem coisas que uma receita de livro não tem** — "a avó fazia com mais alho",
   "da última vez ficou salgado", "o Rui não come coentros". Isso é um campo de notas, ou merece
   estrutura?

6. **Escalar doses (Q3).** Interessa mesmo poder fazer para 2 quando a receita é para 4, ou na
   prática fazes sempre a receita toda e guardas o resto?

## Registo da conversa

_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|
