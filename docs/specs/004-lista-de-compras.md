# Spec 004 — Lista de compras

**Milestone:** M4
**Estado:** Primeira versão construída — ver "O que já existe"
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
- Ver de que receitas vem cada item — para decidir se vale a pena se só se usa numa
- Desmarcar tudo de uma vez, para a ida seguinte
- ~~Acrescentar e remover itens manuais~~ — adiado, ver abaixo

A lista tem de funcionar bem num telemóvel: é aí que se usa, dentro do supermercado. É o primeiro
ecrã que justifica a "versão complementar para telemóvel" prevista no PRD.

## Critérios de aceitação

- [x] A lista gera-se a partir da semana planeada sem intervenção manual
- [x] Quantidades do mesmo ingrediente canónico somam-se entre receitas
- [x] Unidades compatíveis convertem-se antes de somar (kg → g, l → ml)
- [x] Os itens agrupam-se por categoria de supermercado
- [x] Ingredientes de despensa aparecem num grupo separado no fim
- [x] Dá para marcar comprado
- [ ] Dá para acrescentar e remover itens manuais — adiado
- [x] Cada item mostra de que receitas vem
- [x] A lista é usável num ecrã de telemóvel
- [x] Funciona offline dentro do supermercado

## O que já existe

A agregação (`app/src/domain/shopping-list.ts`) estava feita e testada desde o M0. O que faltava era
o ecrã e um plano de onde a lista saísse — o planeamento do M3 destrancou-a.

### As marcas não vão para o repositório

É a única escrita da app que fica só no aparelho, e é deliberado.

Marcar é a ação mais frequente de toda a app — vinte artigos são vinte toques em dez minutos — e
cada um daria um commit; o histórico do repositório passava a ser ruído. E o estado não interessa a
ninguém depois da compra: na semana seguinte a lista é outra.

A consequência é que as marcas não passam do telemóvel para o tablet. Isso está certo: quem vai ao
supermercado leva um aparelho só.

### O telemóvel

É o primeiro ecrã do projeto desenhado para um telemóvel, e obrigou a uma mudança no invólucro:
abaixo dos 640px o painel de navegação passa de coluna à esquerda para barra em baixo.

Não contradiz o design system. A regra era "vertical porque num tablet em horizontal a altura é a
dimensão escassa"; num telemóvel em vertical é a largura que escasseia, e 72px de painel comiam um
quinto do ecrã. É a mesma razão aplicada a um ecrã com a forma oposta.

As linhas têm 56px e o alvo de toque é a linha inteira, não a caixa: num corredor de supermercado,
com o telemóvel numa mão, acertar numa caixa de 24px é pedir demasiado.

### Itens manuais, adiados

O pedido foi uma lista com um simples check, e é isso que está feito. Acrescentar itens obriga a um
campo de texto num ecrã que se usa de mão cheia, e a decidir se esses itens são estado de uma compra
(local) ou dados do projeto (sincronizados). Merece ser desenhado quando a falta se sentir.

## Fora de âmbito

- Inventário de despensa com stock real — ver questão Q9
- Preços e comparação entre lojas
- Exportação para apps de compras (Bring! e afins) — exploração E1 no roadmap
- Comprar num retalhista a partir da lista — exploração E2 no roadmap

A lista foi construída sem nenhuma das duas explorações, de propósito: funciona hoje, e não fica
presa a nenhuma decisão que elas venham a tomar.

## Questões em aberto

- Q9 — despensa
- Como tratar ingredientes que uma receita usa em unidades e outra em peso (2 cebolas vs. 200g de cebola)
