# Conversa 4 — Modo cozinha

**Estado:** Em curso — perguntas 1, 2 e 3 fechadas; a 8 é a próxima a decidir e mexe no schema
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

8. **Um título por passo?** Veio do modo cozinha do Claude, que põe "Preparar o marisco" a negrito e
   o detalhe a seguir. A favor: dá foco e diz de relance o que se está a fazer, sem obrigar a ler a
   frase toda. Contra: nos passos curtos o título arrisca-se a repetir o verbo — "Temperar o frango"
   por cima de "Tempere as coxas de frango com sal e pimenta" é ruído com ar de estrutura. Ver a
   proposta abaixo, que é onde está a saída para isso.

## Proposta para a pergunta 8 — título por passo, com o texto reescrito para completar

### Uma correção, primeiro

A minha primeira leitura do exemplo foi errada e vale a pena ficar registada, porque foi ela que quase
levou a proposta para o sítio errado. Li "Preparar o marisco" como o nome de uma **fase** que cobria
três ou quatro passos, e propus um campo `phase` em vez de um título. Não é isso: no exemplo os
títulos são **1 para 1 com os passos** — "Preparar o marisco", "Fazer o caldo base", "Enriquecer o
caldo", "Fazer o refogado", um por cada número. A relação é próxima, e a fase não é a saída.

### Onde está a diferença que interessa

Está no comprimento do texto, e é grande. Os passos do exemplo têm à volta de **200 caracteres** — são
parágrafos, com quantidades e técnica lá dentro. Os nossos 55 passos do seed têm mediana de **57
caracteres** e máximo de 90. Ou seja, o nosso passo já tem quase o tamanho de um título.

É isso que explica por que ali não há redundância e aqui haveria: um título por cima de um parágrafo
resume; um título por cima de uma frase de sete palavras repete-a.

### A saída é a que apontaste

Não é escolher entre título e texto — é **escrever os dois a saber que o outro existe**. O título fica
com o verbo e o objeto, o texto fica só com o que o título não diz: o como, o até quando, a ressalva.
Nenhum dos dois repete o outro, e a soma até fica mais curta do que a frase de hoje.

O caldo verde inteiro, reescrito assim, para se ver se pega:

| # | Título | Texto |
|---|---|---|
| 1 | Refogar a base | Metade do azeite, a cebola e o alho. Amolecer sem alourar. |
| 2 | Juntar as batatas e a água | Temperar com sal. |
| 3 | Cozer | Até a batata se desfazer com o garfo. |
| 4 | Passar a puré | Com a varinha mágica, até ficar liso. |
| 5 | Alourar o chouriço | Em rodelas, numa frigideira à parte, sem gordura extra. |
| 6 | Juntar a couve | Voltar a pôr o caldo a ferver primeiro. |
| 7 | Cozer a couve | Destapado, para não perder a cor. |
| 8 | Servir | Uma rodela de chouriço e um fio do restante azeite em cada prato. |

Oito passos, nenhuma repetição, e o texto encolheu. O padrão sai sozinho: **o título é o que se faz, o
texto é o que é preciso saber para não o fazer mal.**

### O que isto custa

Três coisas, e a segunda é a que pode correr mal.

**Os 55 passos do seed são para reescrever**, não só para lhes acrescentar um título por cima. É o
trabalho todo desta decisão — uma a duas horas — e é o que faz a diferença entre a coisa funcionar e
ser ruído.

**O importador passa a ter de fazer a separação sozinho**, e o modo de falhar é óbvio: um modelo
produz de bom grado "Temperar o frango" seguido de "Tempere o frango com sal e pimenta". É
exatamente o receio, gerado em série. A spec 007 precisa da regra escrita — *o texto não repete o
título; se o título já disser tudo, o texto fica vazio* — e de um exemplo mau ao lado do bom.

**A tipografia do modo cozinha volta à mesa**, uma semana depois de ter sido arrumada. Dois níveis
não cabem os dois a 44px. Proponho o título a 44px e o texto a 30px por baixo, o que mantém o que se
ganhou: quem olha de longe lê o título, quem precisa do detalhe baixa os olhos uma linha.

E um efeito lateral que é bónus e não custo: **o ecrã de detalhe também melhora.** Doze títulos em
lista lêem-se de relance; doze frases não.

### O que fica de fora, e porquê

A fase que propus antes fica **de reserva, não descartada**. Há um sítio no seed onde ela já anda
disfarçada: o bacalhau com natas tem "Para o béchamel: derreta a manteiga…", e esse prefixo está a
fazer trabalho de fase dentro do texto do passo. Com títulos, os passos 6 a 9 passam a "Fazer a
pasta", "Engrossar", "Temperar", "Juntar as natas" — e perde-se a informação de que os quatro são o
mesmo molho. Pode não fazer falta. Se fizer, acrescenta-se depois; título e fase não competem.

### Três perguntas para responderes de seguida

1. Reescrever os 55 passos do seed agora, ou só pôr títulos nas receitas novas daqui para a frente? A
   segunda é mais barata mas deixa o catálogo com dois formatos ao mesmo tempo, e isso nota-se no
   ecrã de detalhe.
2. No modo cozinha, qual dos dois é o grande — o título ou o texto? Eu ponho o título a 44px porque é
   o que se lê de longe, mas o detalhe é que te impede de errar, e admito que seja ao contrário.
3. Aquele "Para o béchamel" do bacalhau: quando estás a cozinhar, dá-te jeito saber que quatro passos
   seguidos são todos o mesmo molho, ou basta-te o passo em que estás?

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

**Onde ficam.** A primeira tentativa foi espalhá-los pelos extremos — recuar à esquerda, avançar à
direita — a pensar que a distância era mais uma camada de proteção contra o toque errado. Foi
recusado, e com razão: menos intuitivo, e faz da barra uma faixa pesada de canto a canto. Ficaram
**juntos ao centro, com 48px entre eles**, que é o dobro do mínimo do design system e chega para o
dedo não escorregar de um para o outro. Agrupados, olha-se para um sítio só.

**O último passo troca de forma.** "Terminar" não pode ser mais um círculo verde no mesmo sítio, ou
ao fim de doze passos iguais o dedo faz aquilo em piloto automático. É uma pastilha com palavra.

E isto fechou a pergunta 2 por consequência: **a variante B deixou de ser possível**. Não cabe uma
linha de pré-visualização dentro de um botão redondo com uma seta. Fica a A, o cartão no canto.

Os símbolos passaram a SVG desenhado em vez de caracteres — o "▶" tem variante de emoji e em Android
há fontes que o desenham a cores. Num botão onde o símbolo é a única legenda, isso não podia ficar à
sorte da fonte do tablet.

### Ronda 3 — o passo ao centro, e a receita ganha cara

Partiu de um exemplo do modo cozinha do Claude e de duas preferências: o texto do passo mais ao
centro, a usar melhor o ecrã e a ler-se melhor; e a miniatura da receita em pequeno ao pé do nome, no
canto superior esquerdo.

A grelha de `1fr 320px` desapareceu. O corpo passou a uma coluna centrada — texto, temperatura e
duração, ingredientes — com o texto a 44px em vez de 32px e a medida travada em 30ch. As duas coisas
têm de andar juntas: sem limite de largura, uma linha de 1216px a 44px são umas cinquenta palavras e
o olho perde-se a voltar ao início.

Os ingredientes do passo saíram da coluna lateral e vieram para uma linha de pastilhas por baixo do
texto. **A decisão da ronda 1 de os ter à mão mantém-se — muda o sítio.** A coluna de 320px ficava
quase sempre meia vazia e roubava largura ao passo; nenhum passo do seed usa mais do que cinco
ingredientes, portanto uma linha que quebra chega.

A miniatura é um quadrado de 48px ao lado do nome. Num ecrã que só mostra um passo, é a única coisa
que diz qual é o prato — e reconhece-se uma fotografia mais depressa do que se lê um nome. Sem
imagem fica o 🍲, como no catálogo e no detalhe.

Ficou também corrigido um problema que já vinha da ronda 1 e que só apareceu ao medir: o cartão "A
seguir" passava a 8px das pastilhas no passo com mais ingredientes do seed. Cabia por sorte. O corpo
passa a reservar-lhe a faixa de baixo, mesmo no último passo onde o cartão não existe — 176px de
espaço vazio custam menos do que o texto saltar de sítio ao mudar de passo.

**O que ficou por decidir foi o título a negrito** que o exemplo tinha por cima do passo. É a
pergunta 8, e a proposta está lá em cima: título por passo, com o texto reescrito para o completar
em vez de o repetir.

### O que mudou por arrasto

O botão "Iniciar 8 min" que estava no corpo do ecrã desapareceu: passou a ser o botão do meio. A
duração continua visível no corpo, mas como etiqueta e não como alvo. E a faixa de temporizadores no
topo passou a mostrar só os temporizadores de **outros** passos — o do passo atual vive no botão do
meio, e ter o mesmo número em dois sítios é ruído.

### Por onde continuar

A pergunta 8 primeiro, que é a que está em cima da mesa e mexe no schema — quanto mais tarde se
decidir, mais receitas há para preencher à mão.

Depois as perguntas 4 a 7, que são todas sobre o que acontece quando há mais do que uma coisa ao
lume: quantos temporizadores em simultâneo são realistas, o que fazer quando um toca noutro passo, se
vale a pena riscar ingredientes já usados, e o que o ecrã faz no fim.

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|
| Avança-se por botões na barra de baixo, nunca por zonas do ecrã | `docs/specs/005-modo-cozinha.md` |
| Terceiro botão ao meio para o temporizador, só quando o passo tem duração | `docs/specs/005-modo-cozinha.md` |
| Fora dos botões o ecrã é área morta — é essa a proteção contra toque acidental | `docs/specs/005-modo-cozinha.md` |
| O passo seguinte é um cartão pequeno no canto inferior direito | `docs/specs/005-modo-cozinha.md` |
| Recuar e avançar são setas em círculos, sem palavra | `docs/specs/005-modo-cozinha.md` |
| Os alvos ficam agrupados ao centro, com 48px entre eles, e não nos cantos | `docs/specs/005-modo-cozinha.md` |
| "Terminar" muda de forma — pastilha e não círculo | `docs/specs/005-modo-cozinha.md` |
| Símbolos em SVG desenhado, nunca em caracteres | `app/src/ui/icons.tsx` |
| O passo fica ao centro do ecrã, a 44px e com a medida travada em 30ch | `docs/specs/005-modo-cozinha.md` |
| Os ingredientes do passo vêm em linha por baixo do texto, não numa coluna lateral | `docs/specs/005-modo-cozinha.md` |
| O nome da receita leva a miniatura do prato ao lado, em 48px | `docs/specs/005-modo-cozinha.md` |
| O corpo reserva a faixa de baixo ao cartão "A seguir", mesmo no último passo | `docs/specs/005-modo-cozinha.md` |
