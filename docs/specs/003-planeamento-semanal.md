# Spec 003 — Planeamento semanal

**Milestone:** M3
**Estado:** Pronta
**Depende de:** spec 002 (detalhe), ADR 0004 (escrita)

## Objetivo

Decidir a semana de refeições de uma vez, numa vista visual, em vez de decidir à última hora todos os
dias.

## Comportamento

### Vista

Semana inteira num ecrã, em forma de horário: os dias como colunas, os blocos do dia como linhas.
Nenhum scroll horizontal — a semana toda cabe na largura do tablet em horizontal.

Blocos do dia: pequeno-almoço, almoço, lanche, jantar (questão Q6).

### Navegação

Setas para semana anterior e seguinte, e uma ação para voltar à semana atual. O dia de hoje é
destacado visualmente.

Semanas passadas são navegáveis e mostram o que foi planeado — é assim que se alimenta o histórico.

### Receitas no plano

Cada receita planeada aparece como um cartão pequeno com thumbnail ajustada ao tamanho do bloco, nome
e no máximo 3 labels.

- Tocar num cartão abre o detalhe da receita (spec 002)
- Cada cartão tem um "x" que desplaneia com um toque
- Um bloco aceita **várias receitas** — para uma sopa mais um prato mais uma sobremesa, ou para
  duplicar a mesma receita e dobrar a quantidade
- A mesma receita pode aparecer duas vezes no mesmo bloco

### Adicionar

Tocar num bloco vazio, ou no "+" de um bloco com receitas, abre um seletor de receitas com os mesmos
filtros do catálogo (spec 001). Escolher uma adiciona-a ao bloco.

## Critérios de aceitação

- [ ] A semana toda cabe no ecrã do tablet sem scroll horizontal
- [ ] Dá para navegar para semanas anteriores e seguintes, e voltar à atual
- [ ] O dia de hoje está destacado
- [ ] Um bloco aceita várias receitas, incluindo a mesma repetida
- [ ] Um cartão no plano mostra thumbnail, nome e até 3 labels
- [ ] Tocar num cartão abre o detalhe
- [ ] O "x" desplaneia com um toque
- [ ] Adicionar abre o seletor com os filtros do catálogo
- [ ] Cada semana persiste em `data/planning/<AAAA-Www>.json`
- [ ] Planear offline funciona, e sincroniza quando houver rede
- [ ] A home screen reflete o plano da semana atual

## Fora de âmbito

- Arrastar receitas entre blocos (avaliar depois; toque para mover pode ser mais fiável)
- Repetir uma semana inteira ou usar modelos de semana
- Sugestões automáticas do que planear

## Questões em aberto

- Q5 — o histórico é automático ou manual
- Q6 — que blocos do dia
- Q7 — duas pessoas a planear ao mesmo tempo
