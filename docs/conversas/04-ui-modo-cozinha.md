# Conversa 4 — Modo cozinha

**Estado:** Em curso — perguntas 1, 2 e 3 fechadas
**Conduz:** Claude
**Destino das decisões:** `docs/specs/005-modo-cozinha.md`
**Prioridade:** Pode esperar — é M5. Mas é o ecrã que justifica o tablet estar na parede.

> **Já existe uma versão construída.** As perguntas 1, 2 e 3 foram respondidas em áudio e estão
> aplicadas no código — ver o registo abaixo. As perguntas 4 a 7 continuam por responder.

## Porque existe

É o que mais se aproxima da experiência Bimby, e o único ecrã usado com as mãos ocupadas, sujas ou
molhadas. Todas as regras de interface normais são suspeitas aqui.

## O que já está fechado

- Ecrã inteiro, sem navegação à volta
- Um passo de cada vez, tipografia grande (24px no mínimo)
- Ingredientes do passo visíveis junto ao passo
- Ecrã mantido ligado (Wake Lock API — existe no Fire OS 7)
- Temporizadores por passo, vários em simultâneo

## As minhas perguntas de arranque

1. **Como é que avanças de passo com as mãos sujas?** É a pergunta que decide o ecrã todo. Hipóteses:
   toque em qualquer sítio da metade direita; um botão enorme em baixo; voz. A minha aposta é o toque
   numa zona grande, porque voz numa cozinha com exaustor ligado é uma promessa que não se cumpre —
   mas se tens experiência ao contrário, quero saber.

2. **Um passo de cada vez, mesmo?** É o que está na spec e é o que a Bimby faz. Mas às vezes queres
   ver o passo seguinte para saber o que aí vem — "enquanto isto coze, vou cortando". Proponho: o
   passo atual grande, e o seguinte em cinzento pequeno por baixo. Complica ou ajuda?

3. **Um toque acidental — cotovelo, pano, gato — faz-te perder o sítio.** Vale a pena proteger?
   Formas: pedir confirmação para recuar mas não para avançar; ou uma zona de toque que exija
   deliberação. Ou não fazer nada, porque recuar é barato.

4. **Quantos temporizadores em simultâneo é realista na tua cozinha?** Se for um, a interface é
   trivial. Se forem três, é preciso saber a que passo pertence cada um, e isso é outro desenho.

5. **Quando um temporizador toca e estás noutro passo, o que devia acontecer?** Voltar ao passo do
   temporizador é intrusivo. Só avisar pode passar despercebido com barulho de cozinha.

6. **Marcar ingredientes já usados?** Não está na spec. Numa receita com doze ingredientes, ajuda a
   não repetir o sal. Ou é trabalho a mais no meio de cozinhar?

7. **Como sabes que acabaste?** O último passo é "sirva". Depois disso, o que devia o ecrã fazer —
   perguntar se correu bem, voltar à receita, ou apagar-se e deixar-te comer?

## Registo da conversa

### Ronda 1 — como se avança, o passo seguinte, e o toque acidental

Respondidas as perguntas 1, 2 e 3, e as três apontam para o mesmo sítio: **só os botões reagem ao
toque**.

**Pergunta 1 — como se avança.** Dois botões grandes em baixo, com aspeto físico de "carrega em
mim", e um terceiro ao meio para o temporizador quando o passo tem duração. Ficou aplicado assim: o
"Anterior" com um terço da largura, o "Seguinte" com dois terços porque é o que se toca quase
sempre, e o botão do meio estreito a 132px para não competir com eles. Todos com 72px de altura e um
relevo de 2px por baixo, que é o que os faz parecer premíveis sem os desenhar a três dimensões.

**Pergunta 3 — proteção contra toque acidental.** Resolvida por consequência da 1: **fora dos botões
o ecrã é área morta**. O texto do passo, os ingredientes e a barra de progresso não reagem a nada, e
isso cobre a maior parte da superfície do ecrã. Um cotovelo ou um salpico não avançam a receita. Não
há confirmação extra, que custaria um toque em cada passo para evitar um erro raro.

As exceções continuam a ser alvos: o "Sair" no canto superior direito, e os controlos dos
temporizadores que já estão a correr (pausar, repetir, dispensar).

**Pergunta 2 — o passo seguinte.** Sim, mas pequeno e num canto, não como um bloco por baixo do
passo atual. Foram desenhadas duas variantes para escolher:

- **A — cartão no canto inferior direito**, por cima do fundo da lista de ingredientes. Sítio fixo,
  duas linhas, não rouba largura ao passo atual.
- **B — segunda linha dentro do próprio botão "Seguinte"**, sem cartão nenhum.

Está aplicada a **A**. O argumento contra a B é o contraste: 16px sobre o verde forte, a 70cm de
distância e com vapor pelo meio, não se lê — e o passo seguinte serve para planear enquanto se
cozinha, não no instante em que se toca no botão. Se a preferência for a outra, é uma troca de vinte
linhas de CSS.

### Ronda 2 — os alvos passam a redondos

A barra retangular da ronda 1 durou pouco. Ficou decidido que **recuar e avançar são setas em
círculos**, sem palavra, e que o temporizador é o círculo do meio. As setas dispensam legenda por
serem universais; o temporizador não, e por isso traz o número por baixo do símbolo.

Duas coisas que vieram com a decisão e que não estavam na pergunta:

- **Extremos opostos.** Recuar à esquerda, avançar à direita, o temporizador ao centro. Recuar e
  avançar passam a ser dois movimentos de braço diferentes num tablet na parede, o que é mais uma
  camada de proteção contra o toque errado.
- **O último passo troca de forma.** "Terminar" não pode ser mais um círculo verde no mesmo sítio,
  ou ao fim de doze passos iguais o dedo faz aquilo em piloto automático. É uma pastilha com
  palavra.

E isto fechou a pergunta 2 por consequência: **a variante B deixou de ser possível**. Não cabe uma
linha de pré-visualização dentro de um botão redondo com uma seta. Fica a A, o cartão no canto.

Os símbolos passaram a SVG desenhado em vez de caracteres — o "▶" tem variante de emoji e em Android
há fontes que o desenham a cores. Num botão onde o símbolo é a única legenda, isso não podia ficar à
sorte da fonte do tablet.

### O que mudou por arrasto

O botão "Iniciar 8 min" que estava no corpo do ecrã desapareceu: passou a ser o botão do meio. A
duração continua visível no corpo, mas como etiqueta e não como alvo. E a faixa de temporizadores no
topo passou a mostrar só os temporizadores de **outros** passos — o do passo atual vive no botão do
meio, e ter o mesmo número em dois sítios é ruído.

### Por onde continuar

Perguntas 4 a 7, que são todas sobre o que acontece quando há mais do que uma coisa ao lume:
quantos temporizadores em simultâneo são realistas, o que fazer quando um toca noutro passo, se vale
a pena riscar ingredientes já usados, e o que o ecrã faz no fim.

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|
| Avança-se por botões na barra de baixo, nunca por zonas do ecrã | `docs/specs/005-modo-cozinha.md` |
| Terceiro botão ao meio para o temporizador, só quando o passo tem duração | `docs/specs/005-modo-cozinha.md` |
| Fora dos botões o ecrã é área morta — é essa a proteção contra toque acidental | `docs/specs/005-modo-cozinha.md` |
| O passo seguinte é um cartão pequeno no canto inferior direito | `docs/specs/005-modo-cozinha.md` |
| Recuar e avançar são setas em círculos, sem palavra, em extremos opostos | `docs/specs/005-modo-cozinha.md` |
| "Terminar" muda de forma — pastilha e não círculo | `docs/specs/005-modo-cozinha.md` |
| Símbolos em SVG desenhado, nunca em caracteres | `app/src/ui/icons.tsx` |
