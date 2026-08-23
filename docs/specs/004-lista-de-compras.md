# Spec 004 — Lista de compras

**Milestone:** M4
**Estado:** Rascunho
**Depende de:** spec 003 (planeamento), taxonomia de ingredientes

## Objetivo

Ir ao supermercado com uma lista que sai sozinha do plano da semana, agrupada pela ordem por que se
percorre a loja.

## Comportamento

### Geração

A lista deriva das receitas planeadas de uma semana. Para cada ingrediente de cada receita:

1. Resolver o ingrediente canónico em `data/taxonomies/ingredients.json`
2. Converter para uma unidade base (g, ml ou unidade)
3. Somar as quantidades do mesmo ingrediente canónico entre receitas
4. Agrupar por categoria de supermercado (frescos, mercearia, congelados, laticínios, …)

Ingredientes marcados como `staple: true` — sal, azeite, farinha, coisas que se têm sempre em casa —
vão para um grupo próprio no fim, para se ignorarem de relance sem terem de ser apagados um a um
(questão Q9).

Ingredientes com quantidade "q.b." não somam; aparecem sem quantidade.

### Uso

- Marcar itens como comprados, com o item a atenuar-se sem desaparecer
- Acrescentar itens manuais que não vêm de nenhuma receita
- Remover itens
- Ver de que receitas vem cada item — para decidir se vale a pena se só se usa numa

A lista tem de funcionar bem num telemóvel: é aí que se usa, dentro do supermercado. É o primeiro
ecrã que justifica a "versão complementar para telemóvel" prevista no PRD.

## Critérios de aceitação

- [ ] A lista gera-se a partir da semana planeada sem intervenção manual
- [ ] Quantidades do mesmo ingrediente canónico somam-se entre receitas
- [ ] Unidades compatíveis convertem-se antes de somar (kg → g, l → ml)
- [ ] Os itens agrupam-se por categoria de supermercado
- [ ] Ingredientes de despensa aparecem num grupo separado no fim
- [ ] Dá para marcar comprado, acrescentar e remover itens
- [ ] Cada item mostra de que receitas vem
- [ ] A lista é usável num ecrã de telemóvel
- [ ] Funciona offline dentro do supermercado

## Fora de âmbito

- Inventário de despensa com stock real — ver questão Q9
- Preços e comparação entre lojas
- Exportação para apps de compras — é M6

## Questões em aberto

- Q9 — despensa
- Como tratar ingredientes que uma receita usa em unidades e outra em peso (2 cebolas vs. 200g de cebola)
