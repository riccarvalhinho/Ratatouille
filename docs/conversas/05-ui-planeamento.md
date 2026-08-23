# Conversa 5 — Planeamento semanal

**Estado:** Por começar
**Conduz:** Claude
**Destino das decisões:** `docs/specs/003-planeamento-semanal.md`, `docs/specs/006-home.md`
**Prioridade:** Pode esperar — é M3
**Resolve de caminho:** Q5 (histórico automático ou manual) e Q6 (que blocos do dia)

## Porque existe

É a feature que resolve o problema de fundo da visão — decidir à última hora e repetir sempre o
mesmo. Mas é também a que mais depende de hábitos pessoais, e por isso a que menos se pode desenhar
por dedução.

## O que já está fechado

- Semana inteira num ecrã, sem scroll horizontal
- Dias em coluna, blocos do dia em linha
- Vários pratos no mesmo bloco, incluindo o mesmo repetido
- "x" em cada cartão para desplanear com um toque
- Um ficheiro por semana em `data/planning/AAAA-Www.json`

## As minhas perguntas de arranque

1. **Quando é que planeias, na vida real?** Domingo à noite para a semana toda? À medida que vai
   dando? Antes de ir às compras? A resposta muda o ecrã: planear de uma assentada quer uma vista
   ampla e rápida de preencher; planear a pingar quer um ecrã que aceite um prato de cada vez sem
   cerimónia.

2. **Quatro blocos ou dois?** A spec propõe pequeno-almoço, almoço, lanche e jantar. Desconfio que na
   prática só planeias jantares e talvez almoços — e que dois blocos dariam cartões o dobro do
   tamanho, que é exatamente o que falta a um ecrã com sete colunas.

3. **As sobras são metade do valor disto.** Fazes um tacho à segunda e come-se outra vez à quarta.
   Como é que isso aparece no plano? Hipóteses: planear a mesma receita duas vezes; um cartão
   "sobras de segunda"; ou nada, e resolve-se de cabeça. Isto liga à proposta P4 da metadata.

4. **Histórico: automático ou manual?** (Q5) Se for automático, o que foi planeado e passou conta
   como cozinhado — não dá trabalho mas mente quando se muda de ideias. Se for manual, é fiel e o
   histórico acaba vazio, porque ninguém se lembra de marcar. Proponho automático, com forma de
   corrigir. Mas se para ti o histórico serve para saber o que **realmente** comeste, muda tudo.

5. **Arrastar ou tocar?** Arrastar é natural para mover um prato de quinta para sexta, e é
   traiçoeiro num ecrã capacitivo com dedos molhados. Tocar duas vezes é mais feio e nunca falha.

6. **O que é que a home devia mostrar quando o tablet está parado na parede?** É o ecrã que vai
   estar ligado horas. Só o jantar de hoje em letras enormes? A semana toda pequena? Uma sugestão do
   que fazer com o que resta?

7. **Planeias a partir do que tens em casa, ou compras a partir do que planeaste?** A spec assume a
   segunda. Se na verdade abres o frigorífico e decides a partir dali, falta um ecrã que não existe.

## Registo da conversa

_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|
