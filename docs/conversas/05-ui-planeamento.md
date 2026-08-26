# Conversa 5 — Planeamento semanal

**Estado:** Em curso — Q6 fechada, e a pergunta 4 (Q5) fechada na conversa 2. Faltam 1, 3, 5, 6 e 7
**Conduz:** Claude
**Destino das decisões:** `docs/specs/003-planeamento-semanal.md`, `docs/specs/006-home.md`
**Prioridade:** Pode esperar — é M3
**Resolve de caminho:** Q5 (histórico automático ou manual). Q6 (que blocos do dia) já está fechada.

> **Já existe uma primeira versão construída**, com escolhas provisórias tomadas por mim para não
> ficar parado — nomeadamente os quatro blocos, o cartão só com o nome, e a semana a começar à
> segunda. Nada disto está decidido: a conversa continua a ser esta, e agora tens uma coisa concreta
> no ecrã em vez de uma descrição.
>
> Duas coisas que a construção descobriu e que mudam as perguntas abaixo:
>
> 1. **O espaço não chega para quatro blocos com cartões ricos.** A 1280×800 cada célula fica com
>    ~140×130px. A thumbnail e as labels tiveram de sair do cartão para o nome caber legível.
>    **Resolvido:** ficaram só almoço e jantar, as células duplicaram de altura e a thumbnail voltou.
>    As labels continuam de fora, porque a largura não mudou.
> 2. **Planear já funciona, mas o plano fica só no tablet** até o M2 trazer a escrita para o GitHub.
>    Vale a pena confirmar se isso chega para experimentares uma semana a sério.

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

### Ronda 1 — quantos blocos (pergunta 2)

**Só almoço e jantar**, e acrescenta-se o resto se a necessidade aparecer. A razão é a que a
pergunta suspeitava: são as refeições que se decidem de véspera, e o pequeno-almoço e o lanche não
têm decisão que valha uma linha na grelha.

O efeito de lado foi maior do que a decisão: com quatro blocos cada célula ficava com ~140×130px e o
cartão tinha perdido a thumbnail para o nome caber legível. Com dois, as células passaram a ~140×265
e a imagem voltou. As labels continuam de fora, porque a largura de cada dia não mudou.

Aplicado no schema primeiro e depois nos tipos, como manda o CLAUDE.md. Nada no código sabe quantos
blocos há: tudo deriva de `MEAL_BLOCKS`, portanto voltar a quatro é uma linha em cada sítio.

### Ronda 2 — as ações de um cartão

O "x" sempre à vista saiu. Tocar no cartão passa a revelar dois alvos por cima dele — lupa para o
detalhe, cruz para desplanear — e um toque noutro sítio devolve tudo ao normal.

Ganha-se nas duas pontas: o nome fica com a largura toda do cartão (a "Salada de grão com atum"
passou a caber sem reticências), e desplanear deixa de ser um toque único numa grelha de células
vizinhas.

E ficou clara uma distinção que não estava escrita: **este ecrã não é o modo cozinha.** Planeia-se
sentado e com as mãos limpas, antes de haver comida em cima da bancada. As regras da conversa 4 —
alvos de 72px, ecrã morto à volta — nasceram de cozinhar com as mãos ocupadas e não se transportam
para cá. O que manda aqui é a densidade, porque a semana toda tem de caber num ecrã.

### Por onde continuar

As perguntas 1, 3, 5, 6 e 7.

**A 4 já não está aqui.** A Q5 — histórico automático ou manual — fechou-se na conversa 2, quando a
pergunta sobre favoritos e histórico obrigou a dizer o que cada um é. A resposta não veio deste
ecrã: o sinal de conclusão é o "Terminar" do modo cozinha, e o plano da semana **nunca** escreve
histórico sozinho. Ver `docs/product/open-questions.md`.

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|
| Blocos do dia: só almoço e jantar (Q6) | `data/schema/plan.schema.json`, `app/src/domain/types.ts` |
| O cartão do plano tem thumbnail e nome, sem labels | `docs/specs/003-planeamento-semanal.md` |
| Sem "x" permanente: tocar no cartão revela lupa e cruz por cima dele | `docs/specs/003-planeamento-semanal.md` |
