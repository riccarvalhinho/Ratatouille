# Conversa 4 — Modo cozinha

**Estado:** Em curso — perguntas 1, 2 e 3 fechadas; a 8 é a próxima a decidir
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

8. **Um título por cima do passo?** Veio do modo cozinha do Claude, que põe "Preparar o marisco" a
   negrito e o texto do passo por baixo. A favor: dá foco e diz de relance em que ponto da receita se
   está, sem obrigar a ler a frase toda. Contra, e é o receio certo: nos passos curtos o título só
   repete o verbo — "Temperar o frango" por cima de "Tempere as coxas de frango com sal e pimenta" é
   ruído com ar de estrutura. Ver a proposta abaixo, que tenta ficar com o lado bom sem o mau.

## Proposta para a pergunta 8 — fase, não título

A minha posição: **um título por passo não compensa; um nome de fase que dura vários passos
compensa.**

O raciocínio é o dos números. Os passos do seed têm entre 65 e 90 caracteres e fazem uma ação cada —
temperar, alourar, juntar, deixar cozer. Um título por cima de uma frase dessas só pode ser a mesma
frase mais curta, e é precisamente a redundância que preocupa. O exemplo do Claude não tem esse
problema porque os títulos dele não são por passo: "Preparar o marisco" cobre três ou quatro passos
seguidos. O que ali está a fazer trabalho não é o título, é a **fase**.

Concretamente: um campo opcional `phase` no passo, preenchido só no passo em que a fase começa, e o
nome fica visível — pequeno, em maiúsculas discretas, por cima do texto — enquanto essa fase durar.
Assim uma receita de arroz de marisco lê "PREPARAR O MARISCO" durante os passos 1 a 3, "FAZER O
REFOGADO" durante os 4 a 6, e por aí. Uma receita simples não preenche nada e o ecrã fica como está
hoje.

O que isto ganha sobre o título por passo: nunca duplica, porque uma fase e um passo dizem coisas de
tamanhos diferentes. E dá o que o título prometia — saber onde se está sem ler a frase.

O que custa: é mudança de schema, portanto `data/schema/recipe.schema.json` primeiro e depois os
tipos. Preencher as seis receitas do seed é meia hora, e o importador passa a ter de decidir onde
começa cada fase — que é a parte que pode correr mal, e vale a pena perguntar-lhe em vez de adivinhar.

Duas perguntas para responderes de seguida, se concordares com o caminho:

1. Nas receitas que fazes mais vezes, as fases aparecem-te naturalmente ("agora é a parte do molho")
   ou é uma arrumação que eu estou a inventar por cima de uma lista de passos?
2. Se uma receita tiver quatro ou cinco fases, queres vê-las todas em algum sítio — uma linha no
   topo com a fase atual assinalada — ou basta o nome da fase em que estás?

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
pergunta 8, e a proposta está lá em cima: fase em vez de título.

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
