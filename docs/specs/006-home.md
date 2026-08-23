# Spec 006 — Home screen

**Milestone:** M3
**Estado:** Rascunho
**Depende de:** spec 003 (planeamento)

## Objetivo

Responder de relance, sem tocar em nada, à pergunta "o que é que se come hoje?". É o ecrã que está
ligado na parede quando ninguém está a usar o tablet.

## Comportamento

### Com refeições planeadas

- Destaque para as refeições de **hoje**, por bloco do dia
- A seguir, o resto da semana em resumo
- Uma secção de histórico recente: o que se cozinhou nos últimos dias
- Tocar numa refeição abre o detalhe da receita (spec 002)

### Sem refeições planeadas

Estado vazio com um CTA claro para planear refeições, que leva à vista de planeamento (spec 003).
Este é o comportamento explicitamente pedido no planeamento original.

### Como painel de parede

Como este ecrã fica horas ligado:

- Sem animações em loop
- Sem branco puro a ocupar o ecrã todo, para não queimar a vista nem o painel
- Atualiza a mudança de dia sem precisar de ser reaberto

## Critérios de aceitação

- [ ] Mostra as refeições de hoje por bloco do dia
- [ ] Mostra o resto da semana em resumo
- [ ] Mostra histórico recente
- [ ] Sem plano, mostra estado vazio com CTA para planear
- [ ] O CTA leva à vista de planeamento
- [ ] Tocar numa refeição abre o detalhe
- [ ] Passa a mostrar o dia novo à meia-noite sem ser reaberto
- [ ] Legível a alguns metros de distância

## Fora de âmbito

- Meteorologia, relógio ou outros widgets de painel
- Sugestões do que cozinhar

## Questões em aberto

- Q5 — o que conta como histórico
